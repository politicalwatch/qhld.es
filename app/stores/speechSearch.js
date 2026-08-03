// Remembers speech searches so results survive a refresh, the Back button, and
// — now — a tab close, without ever re-firing the (paid, ~8s first-query)
// semantic search when the corpus hasn't changed.
//
// History (query + full results + meta) is backed by VueUse `useLocalStorage`,
// so it persists across tab close. It is scoped to the corpus it was searched
// against: `ensureFresh()` wipes the history when the backend reports that a
// newer extraction run has finished. That is deliberately the ONE place the
// freshness rule lives; the rule itself is `isCacheStale`, which falls back to a
// calendar day when the backend cannot say.
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

import { useDataStatus } from "@/composables/useDataFreshness.js";
import { isCacheStale } from "@/utils/status";

const MAX_ENTRIES = 10;

// Local calendar-day stamp, e.g. "2026-07-23". The fallback boundary, used only
// when the backend cannot say when it last finished updating.
const todayStamp = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const emptyHistory = () => ({ day: "", lastUpdated: null, entries: [] });

export const useSpeechSearchStore = defineStore("speechSearch", () => {
  // { day, lastUpdated, entries: [{ query, results, meta, ts }, ...] }
  // entries are ordered most-recent-first.
  const history = useLocalStorage("qhld:speech-search:history", emptyHistory(), {
    // Merge missing keys if an older/partial shape is ever read back.
    mergeDefaults: true,
  });
  // Which entry is currently on screen. Per-tab (a second tab can display a
  // different past search while sharing the same history).
  const activeQuery = useSessionStorage("qhld:speech-search:active", "");
  // Fetched by the footer badge, so it is normally already resolved. Null until an
  // answer arrives, which is why ensureFresh() waits for one rather than guessing.
  const dataStatus = useDataStatus();

  // Which corpus the stored entries belong to.
  const currentStamps = () => ({
    day: todayStamp(),
    lastUpdated: dataStatus.value?.last_updated ?? null,
  });

  // Drop the whole history once the corpus it was searched against is superseded:
  // reopening within the same corpus keeps the results, a tab left open across a run
  // self-invalidates on its next interaction.
  const ensureFresh = () => {
    const stale = isCacheStale({
      storedLastUpdated: history.value.lastUpdated,
      storedDay: history.value.day,
      status: dataStatus.value,
      today: todayStamp(),
    });
    if (!stale) return;
    history.value = { ...currentStamps(), entries: [] };
    activeQuery.value = "";
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
    // These results came from whatever the backend serves now, so record which run
    // they belong to — otherwise a search made before the first answer arrived is
    // attributed to no run and discarded as soon as one does.
    Object.assign(history.value, currentStamps());
    const entry = {
      query: q,
      results: response.results ?? [],
      meta: response.query_meta ?? {},
      ts: Date.now(),
      // The score this visitor gave, once they give one. Null means "not asked yet",
      // and `ensureFresh` wipes it with the rest when the corpus moves on — a rating
      // only ever applies to the results it was looking at.
      rating: null,
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

  // Remember that this search was rated, so recalling it shows the answer back instead
  // of asking again. Mutating the entry in place persists through `useLocalStorage`,
  // the same way `appendResults` does.
  const setRating = (q, rating) => {
    const entry = history.value.entries.find((item) => item.query === q);
    if (entry) entry.rating = rating;
  };

  const ratingFor = (q) =>
    history.value.entries.find((item) => item.query === q)?.rating ?? null;

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
    history.value = { ...currentStamps(), entries: [] };
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

  // Prune results from a superseded corpus as soon as the store is created on the
  // client, then again whenever the status changes — covering both a first answer
  // that arrives late and a run finishing while the tab stays open.
  if (import.meta.client) {
    ensureFresh();
    watch(dataStatus, ensureFresh);
  }

  return {
    query,
    results,
    queryMeta,
    entries: skipHydrate(entries),
    activeQuery: skipHydrate(activeQuery),
    excludeIds,
    setSearch,
    appendResults,
    setRating,
    ratingFor,
    recall,
    remove,
    clearHistory,
    highlightsFor,
  };
});
