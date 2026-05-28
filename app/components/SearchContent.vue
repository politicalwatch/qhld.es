<template>
  <div>
    <div id="search" class="o-container o-section u-margin-bottom-10">
      <PageHeader :title="'Buscador de iniciativas'" />

      <InitiativesForm
        v-model:formData="formData"
        @getResults="getResults"
        @clearInitiatives="clearInitiatives"
      />

      <div v-if="initiatives.length > 0">
        <div class="o-grid o-grid--align-center u-margin-bottom-4" id="results">
          <div class="o-grid__col o-grid__col--fill">
            <h2 class="u-uppercase" v-if="query_meta.page">
              {{ message.message }}
            </h2>
            <CsvDownload
              :initiatives="initiatives || []"
              :csvItems="csvItems"
              :canDownloadCSV="canDownloadCSV"
              @loadCSVItems="loadCSVItems"
            />
          </div>
          <div class="o-grid__col o-grid__col--right">
            <AlertButton
              :searchParams="formData"
              v-if="use_alerts && query_meta.page"
            />
          </div>
        </div>
        <Results
          :loadingResults="loadingResults"
          :initiatives="initiatives || []"
          :topicsStyles="topicsStyles"
          :queryMeta="query_meta"
          @loadMore="loadMore"
        />
      </div>

      <div
        v-if="initiatives.length == 0 && !cleanedForm && !loadingResults"
        id="results"
        class="u-padding-top-6 u-text-center"
      >
        <NotFound
          message="No se han encontrado resultados. Crea una alerta y te avisaremos."
        />
        <AlertButton
          :searchParams="formData"
          v-if="use_alerts && query_meta.page"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUpdated, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import qs from "qs";
import VueScrollTo from "vue-scrollto";

import api from "@/api";
import config from "@/config";
import InitiativesForm from "@/components/InitiativesForm.vue";
import AlertButton from "@/components/AlertButton.vue";
import PageHeader from "@/components/PageHeader.vue";
import Results from "@/components/Results.vue";
import NotFound from "@/components/NotFound.vue";

const route = useRoute();
const router = useRouter();

const LIMITCSV = 20000;
const use_alerts = config.USE_ALERTS;
const topicsStyles = config.STYLES.topics;

const errors = ref(null);
const initiatives = ref([]);
const query_meta = ref({});
const formData = ref({
  topic: "",
  author: "",
  deputy: "",
  startdate: "",
  enddate: "",
  place: "",
  reference: "",
  page: 1,
  tags: [],
  subtopics: [],
  text: "",
});
const loadingResults = ref(false);
const csvItems = ref([]);
const scrollToID = ref("#results");
const cleanedForm = ref(true);

const canDownloadCSV = computed(() => query_meta.value.total < LIMITCSV);

const message = computed(() => {
  if (errors.value) {
    return { icon: true, type: "error", message: errors.value };
  }
  if (query_meta.value.total) {
    return {
      icon: true,
      type: "success",
      message: `Se han encontrado ${query_meta.value.total} iniciativas`,
    };
  }
  return {
    icon: true,
    type: "error",
    message: `No se han encontrado iniciativas que cumplan los criterios`,
  };
});

const getResults = (event) => {
  console.log("[results] route.params.data =", JSON.stringify(route.params.data));
  loadingResults.value = true;
  cleanedForm.value = false;
  csvItems.value = [];
  const isNewSearch = event?.type === "submit";
  const params =
    route.params.data && !isNewSearch
      ? qs.parse(route.params.data)
      : formData.value;
  formData.value = Object.assign(formData.value, params);
  const urlParams = Object.assign({}, formData.value);

  if (isNewSearch) {
    scrollToID.value = "#results";
    event.preventDefault();
  }

  Object.keys(urlParams).forEach(
    (key) => (!urlParams[key] || key === "page") && delete urlParams[key]
  );

  router
    .push({
      name: "results",
      params: {
        data: qs.stringify(urlParams, { arrayFormat: "repeat" }),
      },
    })
    .catch((e) => e);

  api
    .getInitiatives(formData.value)
    .then((response) => {
      if (!isNewSearch) {
        initiatives.value.push.apply(initiatives.value, response.initiatives);
      } else {
        initiatives.value = response.initiatives;
      }
      query_meta.value = response.query_meta;
      loadingResults.value = false;
      nextTick().then(() => {
        VueScrollTo.scrollTo(scrollToID.value, 1500);
      });
    })
    .catch((error) => (errors.value = error));
};

const clearInitiatives = () => {
  initiatives.value = [];
  cleanedForm.value = true;
};

const loadMore = () => {
  let node = document.querySelectorAll(".c-initiative-card");
  node = node[node.length - 1];
  scrollToID.value = `#${node.id}`;
  formData.value.page++;
  getResults();
};

const loadCSVItems = (event) => {
  if (!canDownloadCSV.value) return false;
  event.target.innerText = "Procesando descarga...";
  let params = Object.assign({ per_page: LIMITCSV }, formData.value);
  api
    .getInitiatives(params)
    .then((response) => {
      csvItems.value = response.initiatives.map((initiative) => ({
        ...initiative,
        topics: initiative.tagged[0].topics.join(", "),
        tags: initiative.tagged[0].tags.map((tag) => tag.tag).join(", "),
      }));
      event.target.innerText = "Descargar resultados";
    })
    .catch((error) => (errors.value = error));
};

const resetPage = () => {
  formData.value.page = 1;
};

watch(() => formData.value.topic, resetPage);
watch(() => formData.value.author, resetPage);
watch(() => formData.value.deputy, resetPage);
watch(() => formData.value.startdate, resetPage);
watch(() => formData.value.enddate, resetPage);
watch(() => formData.value.place, resetPage);
watch(() => formData.value.reference, resetPage);
watch(() => formData.value.tags, resetPage, { deep: true });
watch(() => formData.value.subtopics, resetPage, { deep: true });
watch(() => formData.value.text, resetPage);

onMounted(() => {
  if (route.name == "results") {
    getResults();
  }
});

onUpdated(() => {
  if (document.getElementById("downloadCSV")) {
    document.getElementById("downloadCSV").click();
  }
});
</script>
