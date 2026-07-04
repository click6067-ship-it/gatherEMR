import { describe, it, expect } from 'vitest';
import { chunkText } from './chunking';

describe('chunkText', () => {
  const note = 'CC: chest pain\n\nVitals: BP 168/94\nPain 7/10';

  it('slices back to the source exactly', () => {
    for (const c of chunkText(note)) {
      expect(note.slice(c.start, c.end)).toBe(c.text);
    }
  });

  it('skips blank lines but keeps line numbers', () => {
    const chunks = chunkText(note);
    expect(chunks.map((c) => c.text)).toEqual([
      'CC: chest pain',
      'Vitals: BP 168/94',
      'Pain 7/10',
    ]);
    expect(chunks[1].line).toBe(3); // the blank line was line 2
  });

  it('assigns stable sequential ids', () => {
    expect(chunkText(note).map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
  });
});
