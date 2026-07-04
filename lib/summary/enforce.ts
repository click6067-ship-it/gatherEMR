import type { Summary, SummaryItem } from './schema';
import type { Chunk } from '../chunking';

/**
 * Anti-hallucination gate. Strip citation ids that don't match a real chunk,
 * then DROP any item left with no valid citation. Empty blocks are removed.
 * Uncited or fabricated-citation claims never reach the UI.
 */
export function enforceCitations(summary: Summary, chunks: Chunk[]): Summary {
  const valid = new Set(chunks.map((c) => c.id));
  const clean = (items: SummaryItem[]): SummaryItem[] =>
    items
      .map((it) => ({ ...it, citations: it.citations.filter((id) => valid.has(id)) }))
      .filter((it) => it.citations.length > 0);

  return {
    oneLiner: clean(summary.oneLiner),
    cannotMiss: clean(summary.cannotMiss),
    blocks: summary.blocks
      .map((b) => ({ title: b.title, items: clean(b.items) }))
      .filter((b) => b.items.length > 0),
    medChanges: clean(summary.medChanges),
    gaps: clean(summary.gaps),
  };
}
