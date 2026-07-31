import { defineCachedEventHandler } from 'nitropack/runtime';

/**
 * Service status + data freshness for the footer badge.
 *
 * Reads the backend's root endpoint, which reports when the engine last refreshed
 * each dataset. Cached for a minute because the footer renders on every page while
 * the underlying value changes once a day (extraction is a daily Airflow DAG).
 *
 * An unreachable or unhappy backend is not an error here — it is the "down" state
 * the badge exists to show, so it resolves to `{ ok: false }`.
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);
    const backendUrl = config.public.backendUrl || 'http://localhost:5000';

    try {
      const status = await $fetch(`${backendUrl}/`, { timeout: 5000 });
      return {
        ok: status?.status === 'ok',
        lastUpdated: status?.last_updated ?? null,
        datasets: status?.datasets ?? {},
      };
    } catch {
      return { ok: false, lastUpdated: null, datasets: {} };
    }
  },
  {
    maxAge: 60,
    swr: true,
    name: 'status',
    getKey: () => 'service-status',
  }
);
