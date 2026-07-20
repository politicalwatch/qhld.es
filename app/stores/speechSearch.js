// Remembers the last speech search so the results survive a page refresh and,
// crucially, the browser Back button — returning from a speech detail page must
// NOT re-fire the (paid, ~8s first-query) semantic search.
//
// State is backed by VueUse `useSessionStorage`: it persists per browser tab and
// clears when the tab closes, so a user never sees search state older than their
// current session (the corpus changes daily) and nothing is shareable across
// users. `defineStore` / `useSessionStorage` are Nuxt auto-imports.
//
// SSR note: sessionStorage is client-only, so any UI derived from this store
// must be client-guarded to avoid a hydration mismatch. The storage-backed refs
// are wrapped in `skipHydrate` so Pinia does NOT overwrite them with the (empty)
// SSR payload on the client — without it, navigating between pages clobbers the
// persisted search back to defaults.
import { skipHydrate } from "pinia";

export const useSpeechSearchStore = defineStore("speechSearch", () => {
  const query = useSessionStorage("qhld:speech-search:query", "");
  const results = useSessionStorage("qhld:speech-search:results", []);
  const queryMeta = useSessionStorage("qhld:speech-search:meta", {});

  // The ids already shown, resent as `exclude` on "load more".
  const excludeIds = computed(() =>
    results.value.map((result) => result.speech?.id).filter(Boolean)
  );

  const setSearch = (q, response) => {
    query.value = q;
    results.value = response.results ?? [];
    queryMeta.value = response.query_meta ?? {};
  };

  const appendResults = (response) => {
    results.value = [...results.value, ...(response.results ?? [])];
    queryMeta.value = response.query_meta ?? {};
  };

  const clear = () => {
    query.value = "";
    results.value = [];
    queryMeta.value = {};
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

  return {
    query: skipHydrate(query),
    results: skipHydrate(results),
    queryMeta: skipHydrate(queryMeta),
    excludeIds,
    setSearch,
    appendResults,
    clear,
    highlightsFor,
  };
});
