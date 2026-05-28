<template>
  <div>
    <loader
      v-if="loadingResults"
      title="Cargando resultados"
      subtitle="Puede llevar algun tiempo"
    />
    <section
      class="o-masonry o-grid"
      ref="masonryRef"
      v-if="initiatives && initiatives.length && !loadingResults"
    >
      <div
        class="o-grid__col u-12 u-4@sm o-masonry__item"
        v-for="(initiative, index) in initiatives"
        :key="index"
      >
        <initiative-card
          :initiative="initiative"
          :extendedLayout="extendedLayout"
          :topicsStyles="topicsStyles"
        />
      </div>
    </section>
    <div class="o-grid o-grid--center" v-if="isMoreResults">
      <div class="o-grid__col">
        <a href="#" class="u-border-link" @click.prevent="loadMore">
          <icon icon="mdi:reload" />Cargar más {{ nextResultsLabel }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, computed, watch, onMounted, onUpdated } from "vue";
import { Icon } from "@iconify/vue";

import InitiativeCard from "@/components/InitiativeCard.vue";
import Loader from "@/components/Loader.vue";

const props = defineProps({
  loadingResults: Boolean,
  initiatives: {
    type: Array,
    default: () => [],
  },
  queryMeta: Object,
  layout: String,
  topicsStyles: Object,
});

const { loadingResults, initiatives, queryMeta, layout, topicsStyles } =
  toRefs(props);

const emit = defineEmits(["loadMore"]);

const isMoreResults = computed(() => {
  return (
    !loadingResults.value && queryMeta.value?.page < queryMeta.value?.pages
  );
});

const nextResultsLabel = computed(() => {
  let nextResult = queryMeta.value?.page * queryMeta.value?.per_page + 1;
  let lastResult = nextResult + queryMeta.value?.per_page - 1;
  return `(${nextResult}-${lastResult})`;
});

const extendedLayout = computed(() => {
  return layout.value != "tiny";
});

const loadMore = () => {
  emit("loadMore");
};

const masonryRef = ref(null);
let MasonryLib = null;

const setupMasonry = () => {
  if (masonryRef.value && MasonryLib) {
    let msnry = new MasonryLib(masonryRef.value, {
      columnWidth: ".o-masonry__item",
      percentPosition: true,
      itemSelector: ".o-masonry__item",
    });
    msnry.reloadItems();
    msnry.layout();
  }
};

onUpdated(() => {
  setupMasonry();
});

onMounted(async () => {
  MasonryLib = (await import("masonry-layout")).default;
  setupMasonry();
  window.addEventListener("resize", setupMasonry);
});
</script>
