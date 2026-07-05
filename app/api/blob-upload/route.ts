import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

// Issues a short-lived client-upload token so large documents (>4.5MB) can go straight
// to Vercel Blob, bypassing the serverless request-body limit. Restricted to medical
// document types and size-capped. The uploaded file is fetched, OCR'd, and deleted by
// /api/extract-blob right after — it is never persisted.
export async function POST(req: Request) {
  const rl = rateLimit(`blobup:${clientIp(req)}`, 12, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });
  }

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'application/pdf',
          'image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/tiff', 'image/heic',
        ],
        maximumSizeInBytes: 30 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      // Fires via webhook after the client finishes uploading; extraction + deletion
      // is driven by /api/extract-blob, so nothing to do here.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
