import { describe, it, expect } from 'vitest';
import { enforceCitations } from './enforce';
import type { Summary } from './schema';
import type { Chunk } from '../chunking';

const chunks: Chunk[] = [
  { id: 'c1', start: 0, end: 5, line: 1, text: 'aaaaa' },
  { id: 'c2', start: 6, end: 11, line: 2, text: 'bbbbb' },
];

const empty: Summary = { oneLiner: [], cannotMiss: [], blocks: [], medChanges: [], gaps: [] };

describe('enforceCitations (generic shape)', () => {
  it('drops uncited/bad-cite items, strips bad ids, removes empty blocks', () => {
    const s: Summary = {
      ...empty,
      oneLiner: [
        { text: 'valid', quote: null, citations: ['c1'], label: 'explicit' },
        { text: 'uncited', quote: null, citations: [], label: 'derived' },
        { text: 'mixed', quote: null, citations: ['c99', 'c2'], label: 'derived' },
      ],
      blocks: [
        { title: 'A', items: [{ text: 'keep', quote: null, citations: ['c1'], label: 'explicit' }] },
        { title: 'B', items: [{ text: 'drop', quote: null, citations: [], label: 'uncertain' }] },
      ],
    };
    const out = enforceCitations(s, chunks);
    expect(out.oneLiner.map((i) => i.text)).toEqual(['valid', 'mixed']);
    expect(out.oneLiner[1].citations).toEqual(['c2']); // c99 stripped
    expect(out.blocks.map((b) => b.title)).toEqual(['A']); // empty block B removed
  });
});
