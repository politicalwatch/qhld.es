// Remembers speech searches so results survive a refresh, the Back button, and
// — now — a tab close, without ever re-firing the (paid, ~8s first-query)
// semantic search when the corpus hasn't changed.
//
// History (query + full results + meta) is backed by VueUse `useLocalStorage`,
// so it persists across tab close. It is scoped to the CURRENT DAY: the corpus
// is re-extracted daily, so `ensureFresh()` wipes the history whenever the
// stored day no longer matches today. This is deliberately the ONE place the
// freshness rule lives — swapping the calendar-day check for a backend
// extraction timestamp later is a change to `ensureFresh()`/`todayStamp()` only.
//
// The most-recent searches are kept (cap `MAX_ENTRIES`, LRU) so a researcher can
// re-run the same set of queries to compare results, mid-day, instantly and for
// free. `activeQuery` (per-tab session storage) tracks which entry is currently
// displayed; the `query`/`results`/`queryMeta` getters resolve to that entry so
// the consuming components keep the exact same API as before.
//
// SSR note: web storage is client-only, so any UI derived from this store must
// be client-guarded to avoid a hydration mismatch. The storage-backed refs are
// wrapped in `skipHydrate` so Pinia does NOT overwrite them with the (empty) SSR
// payload on the client — without it, navigating between pages clobbers the
// persisted state back to defaults. `defineStore` / `useLocalStorage` /
// `useSessionStorage` are Nuxt auto-imports.
import { skipHydrate } from "pinia";

const MAX_ENTRIES = 10;

// Local calendar-day stamp, e.g. "2026-07-23". The invalidation boundary; a
// future backend extraction timestamp would replace this.
const todayStamp = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const emptyHistory = () => ({ day: "", entries: [] });

export const useSpeechSearchStore = defineStore("speechSearch", () => {
  // { day: "YYYY-MM-DD", entries: [{ query, results, meta, ts }, ...] }
  // entries are ordered most-recent-first.
  const history = useLocalStorage("qhld:speech-search:history", emptyHistory(), {
    // Merge missing keys if an older/partial shape is ever read back.
    mergeDefaults: true,
  });
  // Which entry is currently on screen. Per-tab (a second tab can display a
  // different past search while sharing the same day-scoped history).
  const activeQuery = useSessionStorage("qhld:speech-search:active", "");

  // Drop the whole history when the corpus day has rolled over. Fixes both the
  // reopen-same-day case (history survived in localStorage, still valid) and the
  // long-open-tab case (a tab open across the daily extraction self-invalidates
  // on its next interaction).
  const ensureFresh = () => {
    const today = todayStamp();
    if (history.value.day !== today) {
      history.value = { day: today, entries: [] };
      activeQuery.value = "";
    }
  };

  const entries = computed(() => history.value.entries);

  const activeEntry = computed(() =>
    history.value.entries.find((entry) => entry.query === activeQuery.value)
  );

  // Back-compat getters: the active search backs the displayed results/meta,
  // preserving the API used by SpeechSearchContent.vue and intervenciones/[id].vue.
  const query = computed(() => activeEntry.value?.query ?? "");
  const results = computed(() => activeEntry.value?.results ?? []);
  const queryMeta = computed(() => activeEntry.value?.meta ?? {});

  // The ids already shown, resent as `exclude` on "load more".
  const excludeIds = computed(() =>
    results.value.map((result) => result.speech?.id).filter(Boolean)
  );

  const setSearch = (q, response) => {
    ensureFresh();
    const entry = {
      query: q,
      results: response.results ?? [],
      meta: response.query_meta ?? {},
      ts: Date.now(),
    };
    // Upsert + promote to front, then cap (LRU eviction of the oldest).
    const rest = history.value.entries.filter((item) => item.query !== q);
    history.value.entries = [entry, ...rest].slice(0, MAX_ENTRIES);
    activeQuery.value = q;
  };

  const appendResults = (response) => {
    const entry = activeEntry.value;
    if (!entry) return;
    entry.results = [...entry.results, ...(response.results ?? [])];
    entry.meta = response.query_meta ?? entry.meta;
  };

  // Bring an existing (cached) search back on screen. Returns true if found.
  const recall = (q) => {
    ensureFresh();
    const exists = history.value.entries.some((item) => item.query === q);
    if (exists) activeQuery.value = q;
    return exists;
  };

  const remove = (q) => {
    history.value.entries = history.value.entries.filter(
      (item) => item.query !== q
    );
    if (activeQuery.value === q) activeQuery.value = "";
  };

  const clearHistory = () => {
    history.value = { day: todayStamp(), entries: [] };
    activeQuery.value = "";
  };

  // The compact result carries both the hash `id` and the numeric `video_id`;
  // the detail page may be reached through either, so match on both.
  const highlightsFor = (speechId) => {
    const key = String(speechId);
    return (
      results.value.find(
        (result) =>
          result.speech?.id === key || String(result.speech?.video_id) === key
      )?.highlights ?? []
    );
  };

  // Prune a stale day as soon as the store is created on the client.
  if (import.meta.client) ensureFresh();

  return {
    query,
    results,
    queryMeta,
    entries: skipHydrate(entries),
    activeQuery: skipHydrate(activeQuery),
    excludeIds,
    setSearch,
    appendResults,
    recall,
    remove,
    clearHistory,
    highlightsFor,
  };
});
