import { describe, it, expect } from 'vitest';
import { resolveSpan } from './span';

describe('resolveSpan', () => {
  const src = 'HPI: chest tightness after walking uphill, diaphoresis, SOB.';

  it('resolves an exact substring to correct offsets', () => {
    const s = resolveSpan(src, 'diaphoresis');
    expect(s).not.toBeNull();
    expect(src.slice(s!.start, s!.end)).toBe('diaphoresis');
  });

  it('returns null for text not present', () => {
    expect(resolveSpan(src, 'myocardial infarction confirmed')).toBeNull();
  });

  it('returns null for an empty quote', () => {
    expect(resolveSpan(src, '')).toBeNull();
  });

  it('resolves across collapsed whitespace', () => {
    const messy = 'Pain now\n   3/10 after rest';
    const s = resolveSpan(messy, 'Pain now 3/10');
    expect(s).not.toBeNull();
    expect(messy.slice(s!.start, s!.end).replace(/\s+/g, ' ')).toBe('Pain now 3/10');
  });
});
