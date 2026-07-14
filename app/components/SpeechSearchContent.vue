<template>
  <div>
    <div id="speech-search" class="o-container o-section u-margin-bottom-10">
      <PageHeader
        :title="'Buscador de intervenciones'"
        :subtitle="'Pregunta en lenguaje natural sobre los debates del Congreso'"
      />

      <SpeechSearchForm
        v-model="q"
        :loading="loading !== 'idle'"
        @search="search"
      />

      <div v-if="chips.length && loading !== 'first'" class="c-speech-search__chips">
        <span class="c-speech-search__chips-label">Entendido como</span>
        <span v-for="chip in chips" :key="chip.label + chip.value" class="c-speech-search__chip">
          <strong>{{ chip.label }}</strong> {{ chip.value }}
        </span>
      </div>

      <Loader
        v-if="loading === 'first'"
        title="Analizando tu pregunta"
        subtitle="La primera búsqueda puede tardar unos segundos"
      />

      <div v-if="results.length > 0" id="speech-results">
        <h2 class="u-uppercase u-margin-bottom-4">
          Mostrando {{ results.length }} intervenciones
        </h2>
        <section class="o-grid">
          <div
            class="o-grid__col u-12 u-4@sm"
            v-for="result in results"
            :key="result.speech.id"
          >
            <SpeechCard :speech="result.speech" :highlights="result.highlights" />
          </div>
        </section>
        <div class="o-grid o-grid--center" v-if="queryMeta.has_more">
          <div class="o-grid__col">
            <a href="#" class="u-border-link" @click.prevent="loadMore">
              <Icon
                :name="loading === 'more' ? 'mdi:loading' : 'mdi:reload'"
                :class="{ 'c-speech-search__spin': loading === 'more' }"
              />
              {{ loading === 'more' ? 'Cargando…' : 'Cargar más intervenciones' }}
            </a>
          </div>
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
  </div>
</template>

<script setup>
import SpeechSearchForm from "@/components/SpeechSearchForm.vue";
import SpeechCard from "@/components/SpeechCard.vue";
import PageHeader from "@/components/PageHeader.vue";
import Loader from "@/components/Loader.vue";
import NotFound from "@/components/NotFound.vue";

const { $api } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const toast = useToast();

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

const q = ref("");
const results = ref([]);
const queryMeta = ref({});
const loading = ref("idle"); // 'idle' | 'first' | 'more'
const searched = ref(false);

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
  loading.value = "first";
  results.value = [];
  queryMeta.value = {};
  router.push({ path: "/buscar-intervenciones", query: { q: query } }).catch((e) => e);
  $api
    .searchSpeeches({ q: query, per_page: PER_PAGE, highlights: HIGHLIGHTS })
    .then((response) => {
      results.value = response.results;
      queryMeta.value = response.query_meta;
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
      results.value.push(...response.results);
      queryMeta.value = response.query_meta;
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

onMounted(() => {
  if (route.query.q) {
    q.value = String(route.query.q);
    search();
  }
});
</script>
