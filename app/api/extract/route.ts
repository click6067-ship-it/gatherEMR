import { NextResponse } from 'next/server';
import { extractText } from '@/lib/extract';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const maxDuration = 60;
const MAX_BYTES = 20 * 1024 * 1024; // 20MB

/** Upload a file (PDF/image/HWP/HWPX/DOCX/…) → extracted plain text. The raw
 * file is processed in memory and never stored. Text still passes through the
 * de-identification gate afterward (client sends the extracted text to /api/deid-preview). */
export async function POST(req: Request) {
  const rl = rateLimit(`extract:${clientIp(req)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid form' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: '파일이 너무 큽니다 (20MB 이하).' }, { status: 400 });
  }
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const text = await extractText(bytes, file.name, file.type);
    if (!text) {
      return NextResponse.json({ error: '텍스트를 추출하지 못했습니다. 다른 파일을 시도하거나 텍스트를 직접 붙여넣으세요.' }, { status: 422 });
    }
    return NextResponse.json({ text, filename: file.name });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
