import { describe, it, expect } from 'vitest';
import { slopLint } from './slopLint';
import type { Summary } from './schema';

const base: Summary = { oneLiner: [], cannotMiss: [], blocks: [], medChanges: [], gaps: [] };
const item = (text: string) => ({ text, quote: null, citations: ['c1'], label: 'explicit' as const });
const withBlock = (text: string): Summary => ({ ...base, blocks: [{ title: 'labs', items: [item(text)] }] });

describe('slopLint (generic shape)', () => {
  it('flags a lab mentioned without a number (inside a block)', () => {
    expect(slopLint(withBlock('Troponin 상승')).map((f) => f.rule)).toContain('lab-without-number');
  });

  it('passes a quantified lab with a timestamped trend', () => {
    expect(slopLint(withBlock('Troponin 0.8→2.1 (19:22→20:46)'))).toEqual([]);
  });

  it('flags a lab/vital trend without a time', () => {
    expect(slopLint(withBlock('Cr 1.8 상승')).map((f) => f.rule)).toContain('trend-without-time');
  });

  it('exempts pending/ordered items', () => {
    expect(slopLint({ ...base, medChanges: [item('Repeat Troponin ordered 21:10 - pending')] })).toEqual([]);
  });

  it('does not flag a pure symptom trend with no lab/vital token', () => {
    expect(slopLint({ ...base, oneLiner: [item('Rest 후 pain 7/10 → 3/10으로 감소')] })).toEqual([]);
  });
});
