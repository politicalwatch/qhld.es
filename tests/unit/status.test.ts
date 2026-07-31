import { describe, expect, it } from 'vitest';

import {
  DELAYED_AFTER_MS,
  STALE_AFTER_MS,
  classifyDataStatus,
} from '../../app/utils/status.js';

const NOW = Date.parse('2026-07-31T08:00:00Z');

// Reachable backend, data refreshed `ms` before now.
const agedBy = (ms: number) =>
  classifyDataStatus({
    ok: true,
    lastUpdated: new Date(NOW - ms).toISOString(),
    now: NOW,
  });

const HOUR = 60 * 60 * 1000;

describe('classifyDataStatus', () => {
  it('is ok while the data is younger than a day', () => {
    expect(agedBy(0)).toBe('ok');
    expect(agedBy(23 * HOUR)).toBe('ok');
  });

  it('turns delayed on the 24h boundary, not before it', () => {
    expect(agedBy(DELAYED_AFTER_MS - 1)).toBe('ok');
    expect(agedBy(DELAYED_AFTER_MS)).toBe('delayed');
    expect(agedBy(48 * HOUR)).toBe('delayed');
  });

  it('turns stale on the 72h boundary, not before it', () => {
    expect(agedBy(STALE_AFTER_MS - 1)).toBe('delayed');
    expect(agedBy(STALE_AFTER_MS)).toBe('stale');
    expect(agedBy(30 * 24 * HOUR)).toBe('stale');
  });

  it('is down whenever the backend did not answer, however fresh the date', () => {
    expect(
      classifyDataStatus({
        ok: false,
        lastUpdated: new Date(NOW).toISOString(),
        now: NOW,
      })
    ).toBe('down');
  });

  it('is down when a reachable backend cannot say when the data changed', () => {
    // Only unreadable bookkeeping produces this once extraction has run once.
    expect(classifyDataStatus({ ok: true, lastUpdated: null, now: NOW })).toBe('down');
    expect(classifyDataStatus({ ok: true, lastUpdated: 'nonsense', now: NOW })).toBe(
      'down'
    );
  });

  it('defaults to the current time so callers need not pass one', () => {
    expect(
      classifyDataStatus({ ok: true, lastUpdated: new Date().toISOString() })
    ).toBe('ok');
  });
});
