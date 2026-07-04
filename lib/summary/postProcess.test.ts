import { describe, it, expect } from 'vitest';
import { postProcessSummary } from './summarize';
import { chunkText } from '../chunking';
import type { Summary } from './schema';

const source = 'CC: chest pain\nTroponin 0.8 at 19:22\nTroponin 2.1 at 20:46';
const chunks = chunkText(source); // c1, c2, c3

const empty: Summary = { oneLiner: [], cannotMiss: [], blocks: [], medChanges: [], gaps: [] };

describe('postProcessSummary (generic shape)', () => {
  it('resolves the quote inside its cited chunk and drops no-quote / uncited items', () => {
    const raw: Summary = {
      ...empty,
      blocks: [
        {
          title: '핵심 검사',
          items: [
            { text: 'Troponin 0.8→2.1', quote: 'Troponin 2.1 at 20:46', citations: ['c3'], label: 'derived' },
            { text: 'no quote', quote: null, citations: ['c1'], label: 'explicit' },
          ],
        },
      ],
    };
    const { summary } = postProcessSummary(raw, chunks);
    expect(summary.blocks[0].items).toHaveLength(1);
    const it0 = summary.blocks[0].items[0];
    expect(source.slice(it0.span.start, it0.span.end)).toBe('Troponin 2.1 at 20:46');
  });

  it('drops a fabricated claim whose quote is not in its cited chunk', () => {
    const raw: Summary = {
      ...empty,
      cannotMiss: [{ text: 'PE confirmed', quote: 'CT confirms pulmonary embolism', citations: ['c1'], label: 'explicit' }],
    };
    expect(postProcessSummary(raw, chunks).summary.cannotMiss).toHaveLength(0);
  });

  it('resolves within the CITED chunk when the quote is duplicated elsewhere', () => {
    const dupSource = 'Pain improved\nPain improved';
    const dupChunks = chunkText(dupSource); // c1 @0-13, c2 @14-27
    const raw: Summary = {
      ...empty,
      oneLiner: [{ text: 'better', quote: 'Pain improved', citations: ['c2'], label: 'explicit' }],
    };
    const { summary } = postProcessSummary(raw, dupChunks);
    expect(summary.oneLiner).toHaveLength(1);
    expect(summary.oneLiner[0].span.start).toBe(14); // c2, not the c1 copy at 0
  });
});
