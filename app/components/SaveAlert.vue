<template>
  <div class="c-save-alert o-container u-margin-top-4">
    <div class="o-grid o-grid--center">
      <div class="c-save-alert__wrapper o-grid__col u-12 u-6@sm">
        <div class="c-save-alert__image">
          <img src="/img/alerts.png" />
        </div>
        <h4 class="u-uppercase">
          No te pierdas nada de la actividad parlamentaria relacionada con
        </h4>
        <h1 class="u-uppercase">{{ text }}</h1>
        <AlertButton :searchParams="searchparams" />
      </div>
    </div>
  </div>
</template>

<script setup>
import AlertButton from "@/components/AlertButton.vue";

const { searchparams, text } = defineProps({
  searchparams: {
    type: Object,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.c-save-alert {
  margin-bottom: 32px;

  &__image {
    margin-bottom: 32px;
  }

  &__wrapper {
    text-align: center;
  }

  &__button {
    display: inline-block;
    margin-top: 8px;
  }
}
</style>
