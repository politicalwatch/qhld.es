<template>
  <header class="c-page-header" :class="{ 'c-page-header--nosub': !subtitle }">
    <h1 class="c-page-header__title u-uppercase">{{ title }}</h1>
    <h4 class="u-uppercase" v-if="subtitle">{{ subtitle }}</h4>
  </header>
</template>

<script setup>
const { title, subtitle } = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
});
</script>

<style lang="scss" scoped>
.c-page-header {
  margin-bottom: rem($spacer-unit * 4);

  @media (min-width: $md) {
    margin-bottom: rem($spacer-unit * 4);
  }

  &__title {
    color: $secondary-dark;

    a {
      color: $secondary-dark;
    }
  }

  &--nosub {
    padding-bottom: rem($spacer-unit * 2);

    .c-page-header {
      &__title {
        margin-bottom: 0;
      }
    }
  }
}
</style>
