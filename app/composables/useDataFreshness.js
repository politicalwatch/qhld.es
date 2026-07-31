// When the backend last finished updating the data. The footer badge shows it, and
// the speech-search history uses it to decide whether cached results still hold.
//
// Three verbs over one keyed request, following useParliamentData.js:
//   useDataFreshness()  fetch it — the badge owns this, and must await it so SSR
//                       waits for the answer rather than rendering "no answer yet"
//   useDataStatus()     read the fetched answer, without fetching
//   refreshDataStatus() ask again — the badge sits outside <NuxtPage/> and so never
//                       remounts, meaning nothing else re-checks within a session

const KEY = "data-status";

export const useDataFreshness = () => {
  const { $api } = useNuxtApp();
  return useAsyncData(KEY, () => $api.getDataStatus(), {
    default: () => null,
    getCachedData: getCachedPayload,
  });
};

/**
 * The backend's answer, or `null` while none has arrived.
 *
 * "Not heard yet" and "answered without a timestamp" are deliberately different: a
 * consumer must be able to wait rather than act on a guess. Keep that distinction.
 */
export const useDataStatus = () => useNuxtData(KEY).data;

// Ask again and publish the answer to every reader, including the badge. Writing
// through useNuxtData's ref is the documented way to update a keyed fetch's data;
// `refreshNuxtData(KEY)` looks like the tool for this but does not re-run the
// request here, so the call is explicit.
export const refreshDataStatus = async () => {
  const { $api } = useNuxtApp();
  const status = useDataStatus();
  try {
    status.value = await $api.getDataStatus();
  } catch {
    // No answer to trust; readers must wait rather than act on the stale one.
    status.value = null;
  }
  return status.value;
};
