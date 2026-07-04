import { describe, it, expect } from 'vitest';
import { slopLint } from './slopLint';
import type { Summary } from './schema';

const base: Summary = {
  acuity: [], oneLiner: [], riskModifiers: [], immediateThreats: [], pending: [],
  hpi: [], vitals: [], keyLabs: [], ddx: { working: [], cannotMiss: [], ruledOut: [] },
  txResponse: [], disposition: [], gaps: [],
};
const item = (text: string) => ({ text, citations: ['c1'], label: 'explicit' as const });

describe('slopLint', () => {
  it('flags a lab mentioned without a number', () => {
    const rules = slopLint({ ...base, keyLabs: [item('Troponin 상승')] }).map((f) => f.rule);
    expect(rules).toContain('lab-without-number');
  });

  it('passes a quantified lab with a timestamped trend', () => {
    expect(slopLint({ ...base, keyLabs: [item('Troponin 0.8→2.1 (19:22→20:46)')] })).toEqual([]);
  });

  it('flags a trend without a time', () => {
    const rules = slopLint({ ...base, keyLabs: [item('Cr 1.8 상승')] }).map((f) => f.rule);
    expect(rules).toContain('trend-without-time');
  });

  it('exempts pending/ordered lab items (no value or time yet)', () => {
    expect(slopLint({ ...base, pending: [item('Repeat Troponin ordered 21:10 - pending at sign-out')] })).toEqual([]);
  });

  it('does not flag a pure symptom trend with no lab/vital token', () => {
    expect(slopLint({ ...base, hpi: [item('Rest 후 pain 7/10 → 3/10으로 감소')] })).toEqual([]);
  });
});
