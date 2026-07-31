// Two rules over the backend's freshness report: what the footer badge shows, and
// whether cached search results still hold.
//
// The badge thresholds follow the extraction cadence: the Airflow DAG runs daily, so
// one missed run is worth a warning and three mean something is actually wrong. The
// backend stamps every run (not only the ones that changed something), so a recess
// or a quiet weekend does not age the data.

export const DELAYED_AFTER_MS = 24 * 60 * 60 * 1000;
export const STALE_AFTER_MS = 72 * 60 * 60 * 1000;

/**
 * @returns {'ok'|'delayed'|'stale'|'down'}
 *   down    – no answer from the backend, or it cannot tell us when the data changed
 *   ok      – refreshed within the last day
 *   delayed – a day or more without a refresh
 *   stale   – three days or more
 */
export const classifyDataStatus = ({ ok, lastUpdated, now = Date.now() }) => {
  if (!ok) return 'down';

  const updatedAt = lastUpdated ? Date.parse(lastUpdated) : NaN;
  // A reachable backend that cannot say when the data changed is not healthy:
  // once extraction has run, only unreadable bookkeeping produces a null here.
  if (Number.isNaN(updatedAt)) return 'down';

  const age = now - updatedAt;
  if (age >= STALE_AFTER_MS) return 'stale';
  if (age >= DELAYED_AFTER_MS) return 'delayed';
  return 'ok';
};

/**
 * Whether cached search results computed against `storedLastUpdated` still hold.
 *
 * The corpus only changes when an extraction run finishes, so that timestamp — not
 * the reader's calendar day — is the boundary: a run landing mid-morning drops the
 * cached results, and local midnight leaves them alone.
 *
 * `status` is the backend's answer, or **null when there is no answer to trust** —
 * none has arrived yet, or the last attempt failed. That is not the same as an answer
 * carrying no timestamp, and the difference is load-bearing: treating an unknown
 * timestamp as "cannot say" falls back to the calendar day on every page load and
 * throws valid results away a moment before the real answer lands. So say nothing
 * until we know, compare timestamps once we do, and fall back to the day only when
 * the backend has answered without one (a fresh install, or bookkeeping it cannot
 * read).
 */
export const isCacheStale = ({ storedLastUpdated, storedDay, status, today }) => {
  if (!status) return false;
  if (status.last_updated) return storedLastUpdated !== status.last_updated;
  return storedDay !== today;
};
