// Turns the backend's freshness report into the state the footer badge shows.
//
// The thresholds follow the extraction cadence: the Airflow DAG runs daily, so one
// missed run is worth a warning and three mean something is actually wrong. The
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
