// Replaces app/stores/parliament.js + pinia.
// Each composable wraps useAsyncData with a stable key so the request runs once
// per session (SSR populates the payload; client reuses it via getCachedData).
// Usage:
//   const { data: topics } = await useTopics()   ← in a page (blocking SSR)
//   const { data: topics } = useTopics()          ← in a component (non-blocking)

// Exported so page-level useAsyncData calls can reuse the same caching
// strategy (payload first, static fallback) for per-route detail fetches.
export const getCachedPayload = (key, nuxtApp) =>
  nuxtApp.payload.data[key] ?? nuxtApp.static?.data?.[key];

// ── Reference data ────────────────────────────────────────────────────────────

export const useTopics = () => {
  const { $api } = useNuxtApp();
  return useAsyncData('topics', () => $api.getTopics(), {
    default: () => [],
    getCachedData: getCachedPayload,
  });
};

export const useDeputies = () => {
  const { $api } = useNuxtApp();
  return useAsyncData('deputies', () => $api.getDeputies(), {
    default: () => [],
    getCachedData: getCachedPayload,
  });
};

export const useParliamentaryGroups = () => {
  const { $api } = useNuxtApp();
  return useAsyncData('parliamentary-groups', () => $api.getGroups(), {
    default: () => [],
    getCachedData: getCachedPayload,
  });
};

export const useFootprintRange = () => {
  const { $api } = useNuxtApp();
  return useAsyncData('footprint-range', () => $api.getFootprintRange(), {
    default: () => [],
    getCachedData: getCachedPayload,
  });
};

export const useTypes = () => {
  const { $api } = useNuxtApp();
  return useAsyncData('types', () => $api.getTypes(), {
    default: () => [],
    getCachedData: getCachedPayload,
  });
};

export const useStatus = () => {
  const { $api } = useNuxtApp();
  return useAsyncData('status', () => $api.getStatus(), {
    default: () => [],
    getCachedData: getCachedPayload,
  });
};

export const usePlaces = () => {
  const { $api } = useNuxtApp();
  return useAsyncData('places', () => $api.getPlaces(), {
    default: () => [],
    getCachedData: getCachedPayload,
  });
};

// Birthdays are date-keyed so they refresh each calendar day.
// useState pins the date string from the server so SSR and client agree on the
// key even near midnight or across timezones — prevents a spurious client refetch.
// No getCachedData: intentionally re-fetches on revisit so the list stays fresh.
export const useBirthdays = () => {
  const { $api } = useNuxtApp();
  const today = useState('birthdays-date', () => new Date().toISOString().split('T')[0]);
  return useAsyncData(`birthdays-${today.value}`, () => $api.getBirthdays(), {
    default: () => [],
  });
};

// ── Finder helpers (synchronous lookups into the cached data) ─────────────────
// Call these in setup() to get a plain finder function; the underlying
// useAsyncData call is deduplicated by key so no extra requests are made.

export const useDeputyByName = () => {
  const { data: deputies } = useDeputies();
  return (name) => deputies.value?.find((d) => d.name === name);
};

// mention.person_id (and the deputy route param) is the deputy's id slug
export const useDeputyById = () => {
  const { data: deputies } = useDeputies();
  return (id) => deputies.value?.find((d) => d.id === id);
};

export const useGroupByName = () => {
  const { data: groups } = useParliamentaryGroups();
  return (name) => groups.value?.find((g) => g.name === name);
};

export const useDeputiesByGroup = () => {
  const { data: deputies } = useDeputies();
  return (shortname) =>
    deputies.value?.filter((d) => d.parliamentarygroup === shortname) ?? [];
};
