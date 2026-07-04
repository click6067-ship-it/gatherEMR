import type { Summary, SummaryItem } from './schema';
import type { Chunk } from '../chunking';

/**
 * Anti-hallucination gate. For every summary item:
 *  - strip citation ids that don't match a real chunk,
 *  - then DROP the item entirely if it has no valid citation left.
 * Uncited or fabricated-citation claims never reach the UI. Block order is
 * preserved; only items are filtered.
 */
export function enforceCitations(summary: Summary, chunks: Chunk[]): Summary {
  const valid = new Set(chunks.map((c) => c.id));
  const clean = (items: SummaryItem[]): SummaryItem[] =>
    items
      .map((it) => ({ ...it, citations: it.citations.filter((id) => valid.has(id)) }))
      .filter((it) => it.citations.length > 0);

  return {
    acuity: clean(summary.acuity),
    oneLiner: clean(summary.oneLiner),
    riskModifiers: clean(summary.riskModifiers),
    immediateThreats: clean(summary.immediateThreats),
    pending: clean(summary.pending),
    hpi: clean(summary.hpi),
    vitals: clean(summary.vitals),
    keyLabs: clean(summary.keyLabs),
    ddx: {
      working: clean(summary.ddx.working),
      cannotMiss: clean(summary.ddx.cannotMiss),
      ruledOut: clean(summary.ddx.ruledOut),
    },
    txResponse: clean(summary.txResponse),
    disposition: clean(summary.disposition),
    gaps: clean(summary.gaps),
  };
}
