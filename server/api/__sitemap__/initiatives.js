import { defineCachedEventHandler } from 'nitropack/runtime';

/**
 * Dynamic sitemap URL source for recent initiatives.
 * Returns the newest ~2,000 initiatives (newest-first API order, page 1).
 * Cached server-side for 24h with SWR so the first request after expiry
 * still returns the stale data immediately while revalidating in background.
 *
 * Full initiative inclusion (all ~98k with a slim endpoint) is deferred to
 * the FastAPI migration — see fastapi_migration_context memory.
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);
    const backendUrl = config.public.backendUrl || 'http://localhost:5000';
    const knowledgebase = config.public.knowledgebase || 'politicas';

    try {
      const data = await $fetch(`${backendUrl}/initiatives/`, {
        query: { knowledgebase, page: 1, per_page: 2000 },
      });

      return (data?.initiatives ?? [])
        .filter((i) => i.id)
        .map((i) => ({
          loc: `/iniciativas/${i.id}`,
          // Slice to YYYY-MM-DD — API returns "2026-06-01T00:00:00" (no tz), which
          // fails W3C date validation in @nuxtjs/sitemap. Date-only is valid W3C.
          ...(i.updated ? { lastmod: i.updated.slice(0, 10) } : {}),
        }));
    } catch (err) {
      console.warn('[sitemap:initiatives] Failed to fetch:', err?.message);
      return [];
    }
  },
  {
    maxAge: 60 * 60 * 24, // 24 hours
    swr: true,
    name: 'sitemap-initiatives',
  }
);
