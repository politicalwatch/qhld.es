// Replaces app/api/index.js + axios + qs.
// Methods are available app-wide via const { $api } = useNuxtApp()

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public;
  const kb = config.knowledgebase;

  const backendFetch = $fetch.create({ baseURL: config.backendUrl });
  const homeFetch = $fetch.create({ baseURL: config.homebuilderUrl });

  const baseQuery = { knowledgebase: kb };

  // Strip falsy / empty-array query params (mirrors old qs + axios behaviour)
  const cleanParams = (params) =>
    Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v != null && !(Array.isArray(v) && v.length === 0)
      )
    );

  const api = {
    // ── Reference data ──────────────────────────────────────────────────────
    getTopics: () => backendFetch('/topics/', { query: baseQuery }),

    getTopic: (topicId) =>
      backendFetch(`/topics/${topicId}`, { query: baseQuery }),

    getGroups: (params = {}) =>
      backendFetch('/parliamentary-groups/', {
        query: { ...cleanParams(params), knowledgebase: kb },
      }),

    getGroup: (id) =>
      backendFetch(`/parliamentary-groups/${id}`, { query: baseQuery }),

    getDeputies: (params = {}) =>
      backendFetch('/deputies/', {
        query: { ...cleanParams(params), knowledgebase: kb },
      }),

    getDeputy: (id) => backendFetch(`/deputies/${id}`, { query: baseQuery }),

    getBirthdays: () =>
      backendFetch('/deputies/todays-birthdays', { query: baseQuery }),

    getPlaces: () => backendFetch('/places/', { query: baseQuery }),

    getStatus: () => backendFetch('/initiative-status/', { query: baseQuery }),

    getTypes: () => backendFetch('/initiative-types/', { query: baseQuery }),

    // Service status and how fresh the data is. Not `getStatus` — that one is the
    // initiative statuses. No knowledgebase: this is about the whole deployment.
    getDataStatus: () => backendFetch('/'),

    // ── Initiatives ──────────────────────────────────────────────────────────
    getInitiatives: (params = {}) =>
      backendFetch('/initiatives/', {
        // ofetch serialises arrays as key=v1&key=v2 (repeat), matching old qs behaviour
        query: { ...cleanParams(params), knowledgebase: kb },
      }),

    getInitiative: (id, allkbs = true) =>
      backendFetch(`/initiatives/${id}`, {
        // Per-call kb string; never mutates shared state (fixes the old api bug)
        query: { knowledgebase: allkbs ? `${kb},ods` : kb },
      }),

    getInitiativeByReference: async (reference) => {
      const data = await backendFetch('/initiatives/', {
        query: { reference, knowledgebase: kb },
      });
      return data.initiatives?.[0] ?? null;
    },

    // ── Sessions ─────────────────────────────────────────────────────────────
    getSessionByCode: async (code) => {
      const data = await backendFetch('/sessions/', {
        query: { code, per_page: 1, knowledgebase: kb },
      });
      return data.sessions?.[0] ?? null;
    },

    // ── Speeches ─────────────────────────────────────────────────────────────
    getSpeech: (id) => backendFetch(`/speeches/${id}`, { query: baseQuery }),

    getSpeeches: (params = {}) =>
      backendFetch('/speeches/', {
        query: { ...cleanParams(params), knowledgebase: kb },
      }),

    searchSpeeches: (params = {}) =>
      backendFetch('/speeches/search', {
        // `exclude` is an array; ofetch repeats it (exclude=a&exclude=b) as the API expects
        query: { ...cleanParams(params), knowledgebase: kb },
      }),

    // All relevant passages of one speech for a query (detail-page highlighting).
    // No `knowledgebase`: speeches carry no topic classification.
    getSpeechPassages: (id, q) =>
      backendFetch(`/speeches/${id}/passages`, { query: { q } }),

    // ── Alerts ───────────────────────────────────────────────────────────────
    saveAlert: (search) =>
      backendFetch('/alerts', {
        method: 'POST',
        body: { ...cleanParams(search), knowledgebase: kb },
      }),

    // ── Tags ─────────────────────────────────────────────────────────────────
    getTags: async (topicId) => {
      const data = await backendFetch(`/topics/${topicId}`, {
        query: baseQuery,
      });
      return data.tags;
    },

    // ── Stats ─────────────────────────────────────────────────────────────────
    getOverallStats: () =>
      backendFetch('/stats/overall', { query: baseQuery }),

    getLastdaysStats: () => backendFetch('/stats/lastdays'),

    getTopicsByWeek: (topic) =>
      backendFetch('/stats/topics-by-week', {
        query: { topic, ...baseQuery },
      }),

    getAllTopicsByWeek: () =>
      backendFetch('/stats/by-week', { query: baseQuery }),

    // ── Footprint ─────────────────────────────────────────────────────────────
    getDeputiesRanking: async (topic, limit = 5) => {
      const data = await backendFetch('/footprint/by-topic', {
        query: { topic },
      });
      return data.deputies.slice(0, limit);
    },

    getFootprintRange: () =>
      backendFetch('/footprint/range-by-all-topics', { query: {} }),

    // ── Scanner / tagger ─────────────────────────────────────────────────────
    annotate: (text, file) => {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('file', file);
      return backendFetch('/tagger/', { method: 'POST', body: formData });
    },

    getScannerResult: (taskID) =>
      backendFetch(`/tagger/result/${taskID}`, { query: baseQuery }),

    // ── Home (homebuilder) ────────────────────────────────────────────────────
    getHome: async () => {
      const data = await homeFetch('/homes');
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    },

    getHomeResourceUrl: (path) => `${config.homebuilderUrl}${path}`,
  };

  return { provide: { api } };
});
