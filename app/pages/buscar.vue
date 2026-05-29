<script setup>
definePageMeta({ name: "search" });
import { useParliamentStore } from "@/stores/parliament";

const store = useParliamentStore();

await Promise.all([
  useAsyncData('topics', () => store.getTopics(), {
    getCachedData: (key, nuxtApp) =>
      store.allTopics.length ? store.allTopics : nuxtApp.payload.data[key],
  }),
  useAsyncData('status', () => store.getStatus(), {
    getCachedData: (key, nuxtApp) =>
      store.allStatus.length ? store.allStatus : nuxtApp.payload.data[key],
  }),
  useAsyncData('parliamentary-groups', () => store.getParliamentaryGroups(), {
    getCachedData: (key, nuxtApp) =>
      store.allParliamentaryGroups.length ? store.allParliamentaryGroups : nuxtApp.payload.data[key],
  }),
  useAsyncData('deputies', () => store.getDeputies(), {
    getCachedData: (key, nuxtApp) =>
      store.allDeputies.length ? store.allDeputies : nuxtApp.payload.data[key],
  }),
  useAsyncData('places', () => store.getPlaces(), {
    getCachedData: (key, nuxtApp) =>
      store.allPlaces.length ? store.allPlaces : nuxtApp.payload.data[key],
  }),
  useAsyncData('types', () => store.getTypes(), {
    getCachedData: (key, nuxtApp) =>
      store.allTypes.length ? store.allTypes : nuxtApp.payload.data[key],
  }),
]);
</script>

<template>
  <SearchContent />
</template>
