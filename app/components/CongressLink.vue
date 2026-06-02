<template>
  <a
    :href="url"
    class="c-congress-link u-uppercase u-border-link"
    target="_blank"
    title="Ver en el Congreso.es"
  >
    Ver en el Congreso.es
    <Icon name="mdi:external-link" style="color: #2d4252" :size="20" />
  </a>
</template>

<script setup>

const { url } = defineProps({
  url: { type: String },
});
</script>

<style lang="scss" scoped>
.c-congress-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  .c-icon {
    margin-left: 8px;

    path {
      fill: $black;
    }
  }
}
</style>
