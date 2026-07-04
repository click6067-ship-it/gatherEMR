import { describe, it, expect } from 'vitest';
import { clamp, lerp, sectionProgress } from './scrubMath';

describe('clamp', () => {
  it('bounds within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('moves current toward target by factor', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(10, 10, 0.12)).toBe(10);
  });
});

describe('sectionProgress', () => {
  const H = 3000, V = 1000; // scrollable range = 2000
  it('is 0 before/at entry (top >= 0)', () => {
    expect(sectionProgress(500, H, V)).toBe(0);
    expect(sectionProgress(0, H, V)).toBe(0);
  });
  it('is 0.5 at mid scrub (top = -1000)', () => {
    expect(sectionProgress(-1000, H, V)).toBeCloseTo(0.5, 5);
  });
  it('is 1 at/after end (top <= -2000)', () => {
    expect(sectionProgress(-2000, H, V)).toBe(1);
    expect(sectionProgress(-9999, H, V)).toBe(1);
  });
  it('never divides by zero when wrapHeight == viewportH', () => {
    expect(sectionProgress(-10, 1000, 1000)).toBe(1);
    expect(sectionProgress(10, 1000, 1000)).toBe(0);
  });
});
