import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { extractText } from '@/lib/extract';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const maxDuration = 60;
export const runtime = 'nodejs';

const BLOB_URL = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^\s"']+$/i;

// For files too large to upload directly (>4.5MB): the client puts them in Vercel Blob,
// then calls this with the Blob URL. We fetch, OCR/extract, and DELETE the raw file
// immediately — it lives in storage only for the few seconds extraction takes.
export async function POST(req: Request) {
  const rl = rateLimit(`extblob:${clientIp(req)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });
  }

  let url = '';
  let filename = 'upload';
  let contentType = '';
  try {
    const b = (await req.json()) as { url?: unknown; filename?: unknown; contentType?: unknown };
    if (typeof b.url === 'string') url = b.url;
    if (typeof b.filename === 'string') filename = b.filename;
    if (typeof b.contentType === 'string') contentType = b.contentType;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // Only accept our own Blob URLs (SSRF guard).
  if (!BLOB_URL.test(url)) {
    return NextResponse.json({ error: '잘못된 파일 참조입니다.' }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('업로드된 파일을 불러오지 못했어요. 다시 시도해 주세요.');
    const bytes = new Uint8Array(await res.arrayBuffer());
    const text = await extractText(bytes, filename, contentType);
    if (!text) {
      return NextResponse.json(
        { error: '스캔 PDF에서 텍스트를 추출하지 못했어요. 화질을 높여 다시 올리거나, 텍스트를 붙여넣어 주세요.' },
        { status: 422 },
      );
    }
    return NextResponse.json({ text, filename });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  } finally {
    // Always remove the raw file, success or not.
    await del(url).catch(() => {});
  }
}
