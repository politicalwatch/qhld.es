<script setup>
definePageMeta({ name: "speeches-search" });
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
