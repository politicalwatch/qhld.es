<script setup>
definePageMeta({ name: "search" });
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
