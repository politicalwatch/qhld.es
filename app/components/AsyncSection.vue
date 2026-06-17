<template>
  <slot v-if="status === 'success'" />
  <Loader
    v-else-if="status === 'pending' || status === 'idle'"
    :title="loadingTitle"
    :subtitle="loadingSubtitle"
  />
  <p v-else-if="status === 'error'" class="c-async-section__error u-text-center">
    {{ errorMessage }}
  </p>
</template>

<script setup>
defineProps({
  status: { type: String, required: true },
  loadingTitle: { type: String, default: 'Cargando datos' },
  loadingSubtitle: { type: String, default: 'Puede llevar unos segundos' },
  errorMessage: { type: String, default: 'No se pudieron cargar los datos.' },
});
</script>

<style lang="scss" scoped>
.c-async-section__error {
  padding: rem($spacer-unit * 4) 0;
  color: $secondary-dark;
  opacity: 0.7;
}
</style>
