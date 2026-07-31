import { describe, expect, it } from 'vitest';

import {
  DELAYED_AFTER_MS,
  STALE_AFTER_MS,
  classifyDataStatus,
  isCacheStale,
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

describe('isCacheStale', () => {
  const RUN = '2026-07-31T02:55:01Z';
  const LATER_RUN = '2026-08-01T02:51:44Z';
  // The backend's own payload shape, passed through untouched.
  const answered = (last_updated: string | null) => ({ status: 'ok', last_updated });

  it('keeps results searched against the current corpus', () => {
    expect(
      isCacheStale({
        storedLastUpdated: RUN,
        storedDay: '2026-07-31',
        status: answered(RUN),
        today: '2026-08-01', // a new local day is NOT a new corpus
      })
    ).toBe(false);
  });

  it('drops results once a newer run has finished', () => {
    expect(
      isCacheStale({
        storedLastUpdated: RUN,
        storedDay: '2026-07-31',
        status: answered(LATER_RUN),
        today: '2026-07-31', // the run landed mid-session, same local day
      })
    ).toBe(true);
  });

  it('drops results that cannot be attributed to a run', () => {
    expect(
      isCacheStale({
        storedLastUpdated: null,
        storedDay: '2026-07-31',
        status: answered(RUN),
        today: '2026-07-31',
      })
    ).toBe(true);
  });

  it('says nothing until an answer has arrived', () => {
    // The bug this pins: treating "not heard yet" as "cannot say" made every page
    // load fall back to the calendar day and wipe valid results a moment before the
    // real timestamp landed.
    expect(
      isCacheStale({
        storedLastUpdated: RUN,
        storedDay: '2026-01-01', // a day mismatch that must NOT trigger a wipe yet
        status: null,
        today: '2026-07-31',
      })
    ).toBe(false);
  });

  describe('when the backend answers without a timestamp', () => {
    it('keeps the history within the same day rather than wiping it', () => {
      // A fresh install, or bookkeeping the backend cannot read. Fail open: not
      // knowing which run produced the results must not throw them away.
      expect(
        isCacheStale({
          storedLastUpdated: RUN,
          storedDay: '2026-07-31',
          status: { status: 'ok', last_updated: null },
          today: '2026-07-31',
        })
      ).toBe(false);
    });

    it('still falls back to the calendar day, so nothing lives forever', () => {
      expect(
        isCacheStale({
          storedLastUpdated: RUN,
          storedDay: '2026-07-31',
          status: { status: 'ok', last_updated: null },
          today: '2026-08-01',
        })
      ).toBe(true);
    });
  });
});
