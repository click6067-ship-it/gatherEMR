import { describe, it, expect } from 'vitest';
import { postProcessSummary } from './summarize';
import { chunkText } from '../chunking';
import type { Summary } from './schema';

const source = 'CC: chest pain\nTroponin 0.8 at 19:22\nTroponin 2.1 at 20:46';
const chunks = chunkText(source); // c1, c2, c3

const empty: Summary = {
  acuity: [], oneLiner: [], riskModifiers: [], immediateThreats: [], pending: [],
  hpi: [], vitals: [], keyLabs: [], ddx: { working: [], cannotMiss: [], ruledOut: [] },
  txResponse: [], disposition: [], gaps: [],
};

describe('postProcessSummary', () => {
  it('resolves the quote inside its cited chunk and drops uncited items', () => {
    const raw: Summary = {
      ...empty,
      keyLabs: [
        { text: 'Troponin 0.8→2.1', quote: 'Troponin 2.1 at 20:46', citations: ['c3'], label: 'derived' },
        { text: 'uncited claim', citations: [], label: 'explicit' },
      ],
    };
    const { summary } = postProcessSummary(raw, chunks, source);
    expect(summary.keyLabs).toHaveLength(1);
    const item = summary.keyLabs[0];
    expect(source.slice(item.span.start, item.span.end)).toBe('Troponin 2.1 at 20:46');
  });

  it('drops a fabricated claim whose quote is not in its cited chunk', () => {
    const raw: Summary = {
      ...empty,
      acuity: [{ text: 'CT confirms PE', quote: 'CT confirms pulmonary embolism', citations: ['c1'], label: 'explicit' }],
    };
    expect(postProcessSummary(raw, chunks, source).summary.acuity).toHaveLength(0);
  });

  it('drops an item with no quote (no evidence span → not shown)', () => {
    const raw: Summary = { ...empty, acuity: [{ text: 'Sick', citations: ['c1'], label: 'derived' }] };
    expect(postProcessSummary(raw, chunks, source).summary.acuity).toHaveLength(0);
  });

  it('resolves within the CITED chunk even when the quote is duplicated elsewhere', () => {
    const dupSource = 'Pain improved\nPain improved';
    const dupChunks = chunkText(dupSource); // c1 @0-13, c2 @14-27
    const raw: Summary = {
      ...empty,
      hpi: [{ text: 'better', quote: 'Pain improved', citations: ['c2'], label: 'explicit' }],
    };
    const { summary } = postProcessSummary(raw, dupChunks, dupSource);
    expect(summary.hpi).toHaveLength(1);
    expect(summary.hpi[0].span.start).toBe(14); // c2, not the c1 copy at 0
  });
});
