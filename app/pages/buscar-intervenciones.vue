<script setup>
// Key on the path only so a `?q=` change (from running a search) reuses the page
// instance instead of remounting it — otherwise the search box tears down and
// rebuilds mid-search (a visible shrink/jump).
definePageMeta({ name: "speeches-search", key: (route) => route.path });
useSeoMeta({
  title: 'Buscador de intervenciones',
  ogTitle: 'Buscador de intervenciones',
  ogType: 'website',
  // Provisional URL: pending rename agreement, keep out of indexes
  robots: 'noindex, follow',
});
</script>

<template>
  <SpeechSearchContent />
</template>
