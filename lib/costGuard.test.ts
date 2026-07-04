import { describe, it, expect } from 'vitest';
import { makeCostGuard } from './costGuard';

describe('costGuard', () => {
  it('blocks spend that would exceed the daily cap, and resets next day', () => {
    const store = new Map<string, number>();
    const s = {
      get: (d: string) => store.get(d) ?? 0,
      add: (d: string, u: number) => store.set(d, (store.get(d) ?? 0) + u),
    };
    let clock = '2026-07-04T10:00:00.000Z';
    const g = makeCostGuard(s, 20, () => new Date(clock));

    expect(g.canSpend(5)).toBe(true);
    g.record(18);
    expect(g.canSpend(5)).toBe(false); // 18 + 5 = 23 > 20
    expect(g.canSpend(2)).toBe(true); // 18 + 2 = 20 <= 20
    expect(g.spentToday()).toBe(18);

    clock = '2026-07-05T10:00:00.000Z';
    expect(g.canSpend(20)).toBe(true); // new day resets
  });
});
