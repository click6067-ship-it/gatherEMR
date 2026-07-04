import { NextResponse } from 'next/server';
import { chunkText } from '@/lib/chunking';
import { detect, mask } from '@/lib/deid';
import { summarize } from '@/lib/summary/summarize';
import { makeCostGuard } from '@/lib/costGuard';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const maxDuration = 60;

// Ephemeral per-instance spend ledger (v1, pre-Supabase). Swap for the DB-backed
// store once the Supabase project is live.
const store = new Map<string, number>();
const guard = makeCostGuard(
  { get: (d) => store.get(d) ?? 0, add: (d, u) => store.set(d, (store.get(d) ?? 0) + u) },
  Number(process.env.DAILY_SPEND_CAP_USD ?? 20),
  () => new Date(),
);

const RESERVE_USD = 0.3; // conservative per-request reservation

export async function POST(req: Request) {
  // Abuse protection: per-IP + coarse global cap on the expensive OpenAI call.
  const perIp = rateLimit(`sum:${clientIp(req)}`, 8, 60_000);
  const global = rateLimit('sum:global', 40, 60_000);
  if (!perIp.ok || !global.ok) {
    const retry = Math.max(perIp.retryAfterSec, global.retryAfterSec);
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' }, { status: 429, headers: { 'retry-after': String(retry) } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const { maskedText, focus } = (body as { maskedText?: unknown; focus?: unknown }) ?? {};
  if (typeof maskedText !== 'string' || !maskedText.trim()) {
    return NextResponse.json({ error: 'maskedText required' }, { status: 400 });
  }

  // Defense in depth: re-run de-identification server-side so that even if a
  // client posts raw text directly to this route, identifiers never reach
  // OpenAI. On already-masked input this is a no-op (███ matches no recognizer),
  // so spans stay aligned with the client's previewed text.
  const { masked } = mask(maskedText, detect(maskedText));
  const chunks = chunkText(masked);

  // Reserve budget BEFORE the call to shrink the concurrency race, reconcile after.
  if (!guard.canSpend(RESERVE_USD)) {
    return NextResponse.json({ error: '오늘 사용량 상한에 도달했습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });
  }
  guard.record(RESERVE_USD);

  try {
    const { summary, lint, usage } = await summarize(masked, chunks, {
      focus: typeof focus === 'string' ? focus : undefined,
    });
    const u = usage as { inputTokens?: number; outputTokens?: number };
    const actual = ((u?.inputTokens ?? 0) * 5 + (u?.outputTokens ?? 0) * 30) / 1_000_000;
    guard.record(actual - RESERVE_USD); // reconcile reservation to actual
    return NextResponse.json({ summary, lint, chunks });
  } catch (e) {
    guard.record(-RESERVE_USD); // release the reservation on failure
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
