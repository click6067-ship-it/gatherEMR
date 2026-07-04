import { describe, it, expect } from 'vitest';
import { rateLimit } from './rateLimit';

describe('rateLimit', () => {
  it('allows up to the limit, blocks within the window, then resets', () => {
    const key = 'test-key';
    let now = 1_000;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 1_000, now).ok).toBe(true);
    }
    const blocked = rateLimit(key, 3, 1_000, now);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);

    now += 1_001; // window elapsed
    expect(rateLimit(key, 3, 1_000, now).ok).toBe(true);
  });
});
