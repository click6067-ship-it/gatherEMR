import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SummarySchema, type Summary, type SummaryItem, type Label } from './schema';
import { EM_SYSTEM_PROMPT, buildUserPrompt } from './emTemplate';
import { enforceCitations } from './enforce';
import { slopLint, type LintFinding } from './slopLint';
import { resolveSpan, type Span } from '../span';
import type { Chunk } from '../chunking';

export type ResolvedItem = {
  text: string;
  label: Label;
  citations: string[];
  quote?: string;
  span: Span;
};

export type ResolvedSummary = {
  acuity: ResolvedItem[];
  oneLiner: ResolvedItem[];
  riskModifiers: ResolvedItem[];
  immediateThreats: ResolvedItem[];
  pending: ResolvedItem[];
  hpi: ResolvedItem[];
  vitals: ResolvedItem[];
  keyLabs: ResolvedItem[];
  ddx: { working: ResolvedItem[]; cannotMiss: ResolvedItem[]; ruledOut: ResolvedItem[] };
  txResponse: ResolvedItem[];
  disposition: ResolvedItem[];
  gaps: ResolvedItem[];
};

function resolveItems(items: SummaryItem[], byId: Map<string, Chunk>, source: string): ResolvedItem[] {
  const out: ResolvedItem[] = [];
  for (const it of items) {
    // The quote MUST resolve INSIDE one of the item's own cited chunks. This ties
    // the highlight to the citation (no first-match-anywhere) and drops any claim
    // whose quote is absent or not actually present in what it cites — a
    // fabricated claim citing a real chunk id no longer survives.
    let span: Span | null = null;
    if (it.quote) {
      for (const id of it.citations) {
        const c = byId.get(id);
        if (!c) continue;
        const local = resolveSpan(c.text, it.quote);
        if (local) {
          span = { start: c.start + local.start, end: c.start + local.end };
          break;
        }
      }
    }
    if (span) out.push({ text: it.text, label: it.label, citations: it.citations, quote: it.quote ?? undefined, span });
    // else: no in-citation evidence span → not shown (R3: "span 못 잡으면 표시 안 함")
  }
  return out;
}

/** Pure post-processing: enforce citations (drop hallucinations) → resolve each
 * surviving item to an exact source span → run clinical slop-lint. Testable
 * without any API call. */
export function postProcessSummary(
  raw: Summary,
  chunks: Chunk[],
  source: string,
): { summary: ResolvedSummary; lint: LintFinding[] } {
  const enforced = enforceCitations(raw, chunks);
  const byId = new Map(chunks.map((c) => [c.id, c]));
  const R = (items: SummaryItem[]) => resolveItems(items, byId, source);
  const summary: ResolvedSummary = {
    acuity: R(enforced.acuity),
    oneLiner: R(enforced.oneLiner),
    riskModifiers: R(enforced.riskModifiers),
    immediateThreats: R(enforced.immediateThreats),
    pending: R(enforced.pending),
    hpi: R(enforced.hpi),
    vitals: R(enforced.vitals),
    keyLabs: R(enforced.keyLabs),
    ddx: {
      working: R(enforced.ddx.working),
      cannotMiss: R(enforced.ddx.cannotMiss),
      ruledOut: R(enforced.ddx.ruledOut),
    },
    txResponse: R(enforced.txResponse),
    disposition: R(enforced.disposition),
    gaps: R(enforced.gaps),
  };
  return { summary, lint: slopLint(enforced) };
}

/** Live summarization: masked text → EM structured summary. `source` MUST be the
 * de-identified text (spans resolve into it). Caller checks the cost guard first. */
export async function summarize(
  maskedText: string,
  chunks: Chunk[],
  opts?: { focus?: string; model?: string; maxOutputTokens?: number },
): Promise<{ summary: ResolvedSummary; lint: LintFinding[]; usage: unknown }> {
  const model = opts?.model ?? process.env.OPENAI_MODEL ?? 'gpt-5.5';
  // gpt-5.x is a reasoning model: reasoning tokens count against the output
  // budget, so this must be generous enough for reasoning + the full JSON.
  const { object, usage } = await generateObject({
    model: openai(model),
    schema: SummarySchema,
    system: EM_SYSTEM_PROMPT,
    prompt: buildUserPrompt(chunks, opts?.focus),
    maxOutputTokens: opts?.maxOutputTokens ?? 8000,
    providerOptions: { openai: { reasoningEffort: 'low' } },
  });
  const { summary, lint } = postProcessSummary(object as Summary, chunks, maskedText);
  return { summary, lint, usage };
}
