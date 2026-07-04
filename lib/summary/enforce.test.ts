import { describe, it, expect } from 'vitest';
import { enforceCitations } from './enforce';
import type { Summary } from './schema';
import type { Chunk } from '../chunking';

const chunks: Chunk[] = [
  { id: 'c1', start: 0, end: 5, line: 1, text: 'aaaaa' },
  { id: 'c2', start: 6, end: 11, line: 2, text: 'bbbbb' },
];

const empty: Summary = {
  acuity: [], oneLiner: [], riskModifiers: [], immediateThreats: [], pending: [],
  hpi: [], vitals: [], keyLabs: [], ddx: { working: [], cannotMiss: [], ruledOut: [] },
  txResponse: [], disposition: [], gaps: [],
};

describe('enforceCitations', () => {
  it('drops uncited and bad-cite items, strips bad ids, preserves order', () => {
    const s: Summary = {
      ...empty,
      acuity: [
        { text: 'valid', citations: ['c1'], label: 'explicit' },
        { text: 'uncited', citations: [], label: 'derived' },
        { text: 'bad cite', citations: ['c99'], label: 'explicit' },
        { text: 'mixed', citations: ['c99', 'c2'], label: 'derived' },
      ],
    };
    const out = enforceCitations(s, chunks);
    expect(out.acuity.map((i) => i.text)).toEqual(['valid', 'mixed']);
    expect(out.acuity[1].citations).toEqual(['c2']); // c99 stripped
  });

  it('filters nested DDx items too', () => {
    const s: Summary = {
      ...empty,
      ddx: {
        working: [{ text: 'ok', citations: ['c1'], label: 'derived' }],
        cannotMiss: [{ text: 'drop', citations: [], label: 'uncertain' }],
        ruledOut: [],
      },
    };
    const out = enforceCitations(s, chunks);
    expect(out.ddx.working).toHaveLength(1);
    expect(out.ddx.cannotMiss).toHaveLength(0);
  });
});
