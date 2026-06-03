<script setup>
definePageMeta({ name: "search" });
useSeoMeta({
  title: 'Buscador de iniciativas',
  ogTitle: 'Buscador de iniciativas',
  ogType: 'website',
});
await Promise.all([
  useTopics(),
  useStatus(),
  useParliamentaryGroups(),
  useDeputies(),
  usePlaces(),
  useTypes(),
]);
</script>

<template>
  <SearchContent />
</template>
