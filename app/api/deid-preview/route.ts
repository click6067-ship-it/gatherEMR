import { NextResponse } from 'next/server';
import { detect, mask } from '@/lib/deid';
import { chunkText } from '@/lib/chunking';
import { rateLimit, clientIp } from '@/lib/rateLimit';

/** Raw text in → detected identifiers + de-identified (masked) text + chunks.
 * The raw text is NEVER persisted; it lives only for this request. */
export async function POST(req: Request) {
  const rl = rateLimit(`deid:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' }, { status: 429, headers: { 'retry-after': String(rl.retryAfterSec) } });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const text = (body as { text?: unknown })?.text;
  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }
  const identifiers = detect(text);
  const { masked } = mask(text, identifiers);
  const chunks = chunkText(masked);
  return NextResponse.json({ identifiers, masked, chunks });
}
