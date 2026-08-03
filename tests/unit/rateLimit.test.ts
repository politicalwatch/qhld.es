import { describe, expect, it } from 'vitest';

import { createRateLimiter } from '../../server/utils/rateLimit.js';

const HOUR = 60 * 60 * 1000;
const NOW = Date.parse('2026-08-03T08:00:00Z');

describe('createRateLimiter', () => {
  it('allows requests up to the limit and then refuses', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: HOUR });

    expect(limiter.check('1.2.3.4', NOW)).toBe(true);
    expect(limiter.check('1.2.3.4', NOW)).toBe(true);
    expect(limiter.check('1.2.3.4', NOW)).toBe(true);
    expect(limiter.check('1.2.3.4', NOW)).toBe(false);
  });

  it('counts each key separately', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: HOUR });

    expect(limiter.check('1.2.3.4', NOW)).toBe(true);
    expect(limiter.check('1.2.3.4', NOW)).toBe(false);
    // A second visitor is unaffected by the first one's spending.
    expect(limiter.check('5.6.7.8', NOW)).toBe(true);
  });

  it('lets a refused key through again once its window has passed', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: HOUR });

    expect(limiter.check('1.2.3.4', NOW)).toBe(true);
    expect(limiter.check('1.2.3.4', NOW)).toBe(true);
    expect(limiter.check('1.2.3.4', NOW + HOUR - 1)).toBe(false);
    expect(limiter.check('1.2.3.4', NOW + HOUR + 1)).toBe(true);
  });

  it('expires hits individually rather than all at once', () => {
    // Two hits 30 min apart against a limit of 2: 61 min later the first has aged out
    // and the second has not, so exactly one slot is free.
    const limiter = createRateLimiter({ limit: 2, windowMs: HOUR });
    limiter.check('1.2.3.4', NOW);
    limiter.check('1.2.3.4', NOW + 30 * 60 * 1000);

    expect(limiter.check('1.2.3.4', NOW + 61 * 60 * 1000)).toBe(true);
    expect(limiter.check('1.2.3.4', NOW + 61 * 60 * 1000)).toBe(false);
  });

  it('forgets keys whose hits have all expired', () => {
    // The sweep is what keeps a long-lived instance from holding every IP it has ever
    // seen; with maxKeys 0 it runs on every call, so this asserts it actually drops them.
    const limiter = createRateLimiter({ limit: 1, windowMs: HOUR, maxKeys: 0 });
    limiter.check('1.2.3.4', NOW);

    expect(limiter.check('1.2.3.4', NOW + 2 * HOUR)).toBe(true);
  });
});
