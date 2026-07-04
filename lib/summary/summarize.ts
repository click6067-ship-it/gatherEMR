import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SummarySchema, type Summary, type SummaryItem, type Label } from './schema';
import { buildSystemPrompt, buildUserPrompt } from './prompt';
import { enforceCitations } from './enforce';
import { slopLint, type LintFinding } from './slopLint';
import { resolveSpan, type Span } from '../span';
import type { Chunk } from '../chunking';
import type { Template } from '../specialties';

export type ResolvedItem = {
  text: string;
  label: Label;
  citations: string[];
  quote?: string;
  span: Span;
};
export type ResolvedBlock = { title: string; items: ResolvedItem[] };
export type ResolvedSummary = {
  oneLiner: ResolvedItem[];
  cannotMiss: ResolvedItem[];
  blocks: ResolvedBlock[];
  medChanges: ResolvedItem[];
  gaps: ResolvedItem[];
};

function resolveItems(items: SummaryItem[], byId: Map<string, Chunk>): ResolvedItem[] {
  const out: ResolvedItem[] = [];
  for (const it of items) {
    // The quote MUST resolve INSIDE one of the item's own cited chunks — ties the
    // highlight to the citation and drops any claim whose quote is absent or not
    // actually present in what it cites (fabricated citation can't survive).
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
  }
  return out;
}

/** Pure post-processing: enforce citations → resolve each surviving item to an
 * exact source span (within its cited chunk) → clinical slop-lint. Testable
 * without any API call. */
export function postProcessSummary(
  raw: Summary,
  chunks: Chunk[],
): { summary: ResolvedSummary; lint: LintFinding[] } {
  const enforced = enforceCitations(raw, chunks);
  const byId = new Map(chunks.map((c) => [c.id, c]));
  const R = (items: SummaryItem[]) => resolveItems(items, byId);
  const summary: ResolvedSummary = {
    oneLiner: R(enforced.oneLiner),
    cannotMiss: R(enforced.cannotMiss),
    blocks: enforced.blocks
      .map((b) => ({ title: b.title, items: R(b.items) }))
      .filter((b) => b.items.length > 0),
    medChanges: R(enforced.medChanges),
    gaps: R(enforced.gaps),
  };
  return { summary, lint: slopLint(enforced) };
}

/** Live summarization for a selected specialty template. `source` MUST be the
 * de-identified text (spans resolve into it). Caller checks the cost guard. */
export async function summarize(
  maskedText: string,
  chunks: Chunk[],
  template: Template,
  opts?: { focus?: string; model?: string; maxOutputTokens?: number },
): Promise<{ summary: ResolvedSummary; lint: LintFinding[]; usage: unknown }> {
  const model = opts?.model ?? process.env.OPENAI_MODEL ?? 'gpt-5.5';
  const { object, usage } = await generateObject({
    model: openai(model),
    schema: SummarySchema,
    system: buildSystemPrompt(template),
    prompt: buildUserPrompt(chunks, opts?.focus),
    maxOutputTokens: opts?.maxOutputTokens ?? 8000,
    providerOptions: { openai: { reasoningEffort: 'low' } },
  });
  const { summary, lint } = postProcessSummary(object as Summary, chunks);
  return { summary, lint, usage };
}
