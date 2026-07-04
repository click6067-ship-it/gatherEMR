import { NextResponse } from 'next/server';
import { chunkText } from '@/lib/chunking';
import { detect, mask } from '@/lib/deid';
import { summarize } from '@/lib/summary/summarize';
import { makeCostGuard } from '@/lib/costGuard';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { resolveTemplate } from '@/lib/specialties';
import { serverClient, saveDocument } from '@/lib/supabase';

export const maxDuration = 60;

// Ephemeral per-instance spend ledger (v1). Swap for the DB-backed store once
// the Supabase project is resumed.
const store = new Map<string, number>();
const guard = makeCostGuard(
  { get: (d) => store.get(d) ?? 0, add: (d, u) => store.set(d, (store.get(d) ?? 0) + u) },
  Number(process.env.DAILY_SPEND_CAP_USD ?? 20),
  () => new Date(),
);
const RESERVE_USD = 0.3;
const MAX_INPUT_CHARS = 60_000;

export async function POST(req: Request) {
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
  const { maskedText, specialtyId, subId, focus, sessionId } = (body ?? {}) as {
    maskedText?: unknown; specialtyId?: unknown; subId?: unknown; focus?: unknown; sessionId?: unknown;
  };

  if (typeof maskedText !== 'string' || !maskedText.trim()) {
    return NextResponse.json({ error: 'maskedText required' }, { status: 400 });
  }
  const template = typeof specialtyId === 'string'
    ? resolveTemplate(specialtyId, typeof subId === 'string' ? subId : undefined)
    : null;
  if (!template) {
    return NextResponse.json({ error: '분과를 선택하세요.' }, { status: 400 });
  }

  // Defense in depth: re-de-identify server-side (no-op on already-masked text).
  const trimmed = maskedText.slice(0, MAX_INPUT_CHARS);
  const { masked } = mask(trimmed, detect(trimmed));
  const chunks = chunkText(masked);

  if (!guard.canSpend(RESERVE_USD)) {
    return NextResponse.json({ error: '오늘 사용량 상한에 도달했습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });
  }
  guard.record(RESERVE_USD);

  try {
    const { summary, lint, usage } = await summarize(masked, chunks, template, {
      focus: typeof focus === 'string' ? focus : undefined,
    });
    const u = usage as { inputTokens?: number; outputTokens?: number };
    const actual = ((u?.inputTokens ?? 0) * 5 + (u?.outputTokens ?? 0) * 30) / 1_000_000;
    guard.record(actual - RESERVE_USD);

    // Best-effort persistence (de-identified only). Fails fast & silently while
    // the Supabase project is paused — the summary response still succeeds.
    let documentId: string | undefined;
    try {
      const db = serverClient();
      const specialtyLabel = template.name;
      const res = await saveDocument(db, {
        sessionId: typeof sessionId === 'string' ? sessionId : 'anon',
        specialty: specialtyLabel,
        maskedText: masked,
        chunks,
        summary,
        lint,
        model: process.env.OPENAI_MODEL ?? 'gpt-5.5',
      });
      documentId = res.documentId;
    } catch {
      /* Supabase unavailable (paused) — skip persistence. */
    }

    return NextResponse.json({ summary, lint, chunks, documentId });
  } catch (e) {
    guard.record(-RESERVE_USD);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
