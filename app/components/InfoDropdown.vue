<template>
  <div class="c-info-dropdown">
    <div class="c-info-dropdown__title_wrapper" @click="shown = !shown">
      <h3 class="c-info-dropdown__title">{{ title }}</h3>
      <div v-show="shown" class="c-info-dropdown__icon">
        Mostrar menos<Icon name="mdi:minus" :size="22" />
      </div>
      <div v-show="!shown" class="c-info-dropdown__icon">
        Mostrar más<Icon name="mdi:plus" :size="22" />
      </div>
    </div>
    <div class="c-info-dropdown__content" v-if="shown">
      <slot />
    </div>
  </div>
</template>

<script setup>

const { title } = defineProps({
  title: { type: String },
});

const shown = ref(false);
</script>

<style lang="scss" scoped>
.c-info-dropdown {
  background-color: $lightgrey;
  padding: 32px;
  margin-bottom: 32px;

  &__title_wrapper {
    width: 100%;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    margin: 0;
    display: inline-block;
  }

  &__content {
    margin-top: 32px;

    &__item {
      display: block;
      margin-top: 0;
      margin-bottom: 16px;
    }
  }

  &__icon {
    display: flex;
    gap: 1rem;
    font-family: $font-headline;
  }
}
</style>
