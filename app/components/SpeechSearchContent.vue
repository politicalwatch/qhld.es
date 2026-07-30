<template>
  <!-- .o-container (width:100%) is the root so the page fills its width in every
       state — the app's .page-container centers a shrink-to-fit child, which made
       the header/box jump to centre while the loading view was narrow. -->
  <div id="speech-search" class="o-container o-section u-margin-bottom-10">
      <PageHeader
        :title="'Buscador de intervenciones'"
        :subtitle="'Pregunta en lenguaje natural sobre los debates del Congreso'"
      />

      <SpeechSearchForm
        v-model="q"
        :loading="loading !== 'idle'"
        :entries="entries"
        @search="search"
        @recall="onRecall"
        @remove="onRemove"
        @clear="onClear"
      />

      <div v-if="searched && chips.length && loading !== 'first'" class="c-speech-search__chips">
        <span class="c-speech-search__chips-label">Entendido como</span>
        <span v-for="chip in chips" :key="chip.label + chip.value" class="c-speech-search__chip">
          <strong>{{ chip.label }}</strong> {{ chip.value }}
        </span>
      </div>

      <SpeechSearchLoader v-if="loading === 'first'" />

      <div v-if="showSuggestions" class="c-speech-search__suggestions">
        <p class="c-speech-search__suggestions-label">
          Describe un tema, una persona, un grupo o una fecha — o prueba con un ejemplo:
        </p>
        <ul class="c-speech-search__examples">
          <li v-for="suggestion in suggestions" :key="suggestion">
            <button
              type="button"
              class="c-speech-search__example"
              @click="applyExample(suggestion)"
            >
              <span class="c-speech-search__example-arrow" aria-hidden="true">›</span>
              {{ suggestion }}
            </button>
          </li>
        </ul>
      </div>

      <div v-if="searched && results.length > 0 && loading !== 'first'" id="speech-results">
        <div class="c-speech-search__results-toolbar">
          <p class="c-speech-search__results-count">
            Mostrando {{ results.length }} intervenciones, {{ orderLabel }}
          </p>
        </div>
        <section class="c-speech-search__results-grid">
          <SpeechCard
            v-for="result in results"
            :key="result.speech.id"
            :speech="result.speech"
            :highlights="result.highlights"
          />
        </section>
        <div class="c-speech-search__load-more" v-if="queryMeta.has_more">
          <a href="#" class="u-border-link" @click.prevent="loadMore">
            <Icon
              :name="loading === 'more' ? 'mdi:loading' : 'mdi:reload'"
              :class="{ 'c-speech-search__spin': loading === 'more' }"
            />
            {{ loading === 'more' ? 'Cargando…' : 'Cargar más intervenciones' }}
          </a>
        </div>
      </div>

      <div
        v-if="searched && results.length === 0 && loading === 'idle'"
        class="u-padding-top-6 u-text-center"
      >
        <template v-if="blockingUnresolved.length > 0">
          <NotFound message="No hemos podido entender parte de tu búsqueda." />
          <div
            v-for="item in blockingUnresolved"
            :key="item.field + item.value"
            class="c-speech-search__unresolved"
          >
            <p>
              No hemos podido identificar {{ fieldLabel(item.field) }}
              «{{ item.value }}».
            </p>
            <a
              v-if="item.suggestion"
              href="#"
              class="u-border-link"
              @click.prevent="applySuggestion(item)"
            >
              ¿Quisiste decir «{{ cleanSuggestion(item.suggestion) }}»?
            </a>
          </div>
        </template>
        <NotFound
          v-else
          message="No se han encontrado intervenciones para tu búsqueda."
        />
      </div>
    </div>
</template>

<script setup>
import SpeechSearchForm from "@/components/SpeechSearchForm.vue";
import SpeechCard from "@/components/SpeechCard.vue";
import PageHeader from "@/components/PageHeader.vue";
import SpeechSearchLoader from "@/components/SpeechSearchLoader.vue";
import NotFound from "@/components/NotFound.vue";
import config from "@/config";

const { $api } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useSpeechSearchStore();

const PER_PAGE = 12;
const HIGHLIGHTS = 3;

const FIELD_LABELS = {
  speaker: "a la persona",
  deputy: "a la persona",
  group: "al grupo",
  date: "la fecha",
  date_from: "la fecha",
  date_to: "la fecha",
  legislature: "la legislatura",
  session: "la sesión",
  role: "el rol",
};

const FILTER_LABELS = {
  speaker: "Diputado/a",
  deputy: "Diputado/a",
  group: "Grupo",
  date_from: "Desde",
  date_to: "Hasta",
  legislature: "Legislatura",
  session: "Sesión",
  role: "Rol",
};

// The store is the single source of truth for results/meta, so "load more" and
// the Back-button restore never fall out of sync (and page 2 isn't duplicated).
const { results, queryMeta, entries } = storeToRefs(store);
const q = ref("");
const loading = ref("idle"); // 'idle' | 'first' | 'more'
const searched = ref(false);

// Warm the deputies cache so the result cards can borrow the speaker's photo +
// party colour (SpeechCard reads it via useDeputyByName; the fetch is dedup'd).
useDeputies();

// Empty-state example queries (from app/config). Shown whenever no search is
// being displayed — `searched` gates the results, NOT the store, so a cached
// search can survive in the background while the empty state is shown.
const suggestions = config.SEARCH_SUGGESTIONS;
const showSuggestions = computed(
  () => !searched.value && loading.value === "idle"
);

const chips = computed(() => {
  const meta = queryMeta.value;
  if (!meta.semantic_query && !meta.filters) return [];
  const list = [];
  if (meta.semantic_query) {
    list.push({ label: "Tema", value: meta.semantic_query });
  }
  Object.entries(meta.filters || {}).forEach(([field, value]) => {
    list.push({ label: FILTER_LABELS[field] || field, value: formatFilterValue(value) });
  });
  return list;
});

const orderLabel = computed(() =>
  queryMeta.value.browse ? "las más recientes primero" : "por relevancia"
);

const blockingUnresolved = computed(
  () => (queryMeta.value.unresolved || []).filter((item) => item.blocking)
);

const formatFilterValue = (value) => {
  if (Array.isArray(value)) return value.map(formatFilterValue).join(", ");
  if (value && typeof value === "object")
    return Object.values(value).map(formatFilterValue).join(" – ");
  return String(value);
};

const fieldLabel = (field) => FIELD_LABELS[field] || `el criterio «${field}»`;

const errorDescription = (status) => {
  switch (status) {
    case 422:
      // The query wasn't a speech search (a command, a question to the
      // assistant, an injection) — tell the user how to phrase a real search.
      return "Esto no parece una búsqueda de intervenciones parlamentarias. Prueba a describir un tema, orador, grupo o fecha.";
    case 503:
      return "El buscador inteligente no está disponible en este momento";
    default:
      return "Inténtalo de nuevo más tarde";
  }
};

const handleError = (error) => {
  toast.add({
    title: "Error en la búsqueda",
    description: errorDescription(error?.status ?? error?.statusCode),
    color: "error",
    icon: "i-lucide-alert-circle",
  });
};

const search = () => {
  const query = q.value.trim();
  if (query.length < 2 || loading.value !== "idle") return;

  // Already in today's history (whether or not it's the one on screen) → recall
  // it and show it again; don't re-run the (paid, slow) semantic query. `recall`
  // also refreshes the day scope, so a query kept from before today's extraction
  // is dropped and falls through to a fresh fetch below.
  if (store.recall(query)) {
    searched.value = true;
    router.push({ path: "/buscar-intervenciones", query: { q: query } }).catch((e) => e);
    nextTick().then(() => {
      document
        .querySelector("#speech-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return;
  }

  loading.value = "first";
  router.push({ path: "/buscar-intervenciones", query: { q: query } }).catch((e) => e);
  $api
    .searchSpeeches({ q: query, per_page: PER_PAGE, highlights: HIGHLIGHTS })
    .then((response) => {
      store.setSearch(query, response);
      searched.value = true;
      nextTick().then(() => {
        document
          .querySelector("#speech-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    })
    .catch(handleError)
    .finally(() => (loading.value = "idle"));
};

const applyExample = (query) => {
  q.value = query;
  search();
};

const loadMore = () => {
  if (loading.value !== "idle") return;
  loading.value = "more";
  const lastCardId = `#speech-card-${results.value[results.value.length - 1].speech.id}`;
  $api
    .searchSpeeches({
      q: q.value.trim(),
      per_page: PER_PAGE,
      highlights: HIGHLIGHTS,
      exclude: results.value.map((result) => result.speech.id),
    })
    .then((response) => {
      store.appendResults(response);
      nextTick().then(() => {
        document
          .querySelector(lastCardId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    })
    .catch(handleError)
    .finally(() => (loading.value = "idle"));
};

// Suggestions arrive as "'López Cano, Ignacio' (53)" — name in quotes plus match score
const cleanSuggestion = (suggestion) =>
  suggestion.match(/^'(.+)'(?:\s*\(\d+\))?$/)?.[1] ?? suggestion;

const applySuggestion = (item) => {
  const suggestion = cleanSuggestion(item.suggestion);
  const pattern = new RegExp(item.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  q.value = pattern.test(q.value)
    ? q.value.replace(pattern, suggestion)
    : suggestion;
  search();
};

// Panel actions. Recall reuses `search()`, which serves the cached entry when
// it's still in today's history (no API call) or re-runs it if the day rolled.
const onRecall = (query) => {
  q.value = query;
  search();
};

const resetToEmptyState = () => {
  searched.value = false;
  q.value = "";
  router.push({ path: "/buscar-intervenciones" }).catch((e) => e);
};

const onRemove = (query) => {
  const wasActive = store.activeQuery === query;
  store.remove(query);
  // If the deleted search is the one on screen, drop back to the empty state.
  if (wasActive && searched.value) resetToEmptyState();
};

const onClear = () => {
  store.clearHistory();
  if (searched.value) resetToEmptyState();
};

onMounted(() => {
  const urlQuery = route.query.q ? String(route.query.q) : "";
  if (urlQuery) {
    // Returning via Back/refresh onto a results URL: restore the cached results
    // instead of re-running the (paid, slow) semantic search. sessionStorage is
    // client-only, so this runs on mount — never during SSR.
    if (store.results.length && urlQuery === store.query) {
      // results/queryMeta already reflect the store (storeToRefs) — just the input
      q.value = store.query;
      searched.value = true;
      return;
    }
    // A query in the URL we haven't cached → run it.
    q.value = urlQuery;
    search();
    return;
  }
  // Clean entry (no ?q, e.g. via the menu): show the empty state WITHOUT touching
  // the store — the last search stays cached (so repeating it is instant); it is
  // just not displayed because `searched` is false.
});

// The page instance is kept alive across `?q=` changes (see the page's `key`),
// so navigating to the clean /buscar-intervenciones URL won't remount it — return
// to the empty state when the query is cleared, but keep the cached search.
watch(
  () => route.query.q,
  (value) => {
    if (!value && searched.value && loading.value === "idle") {
      searched.value = false;
      q.value = "";
    }
  }
);
</script>
