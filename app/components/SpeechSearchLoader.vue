<template>
  <div class="c-speech-loader" role="status" aria-live="polite">
    <span class="c-speech-loader__spinner" aria-hidden="true" />
    <div class="c-speech-loader__text">
      <p class="c-speech-loader__title">
        {{ title }}<span class="c-speech-loader__ellipsis" aria-hidden="true" />
      </p>
      <p v-if="subtitle" class="c-speech-loader__subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
// Search-specific loader for the semantic speeches search (first query).
// Deliberately separate from the shared Loader.vue — do not merge them here.
const { title, subtitle } = defineProps({
  title: { type: String, default: "Analizando tu pregunta" },
  subtitle: {
    type: String,
    default: "La primera búsqueda puede tardar unos segundos",
  },
});
</script>

<style lang="scss" scoped>
.c-speech-loader {
  display: flex;
  align-items: center;
  gap: rem($spacer-unit);
  margin: rem($spacer-unit * 2.5) 0;

  &__spinner {
    flex: none;
    width: rem($spacer-unit * 2);
    height: rem($spacer-unit * 2);
    border: 3px solid var(--color-brand-200);
    border-top-color: var(--color-brand-700);
    border-radius: 50%;
    animation: cspl-spin 0.9s linear infinite;
  }

  &__title {
    font-family: $font-headline;
    font-size: rem(20px);
    line-height: 1.2;
    color: $secondary-dark;
    margin: 0;
  }

  // animated "···" appended to the title
  &__ellipsis::after {
    content: "";
    animation: cspl-ellipsis 1.4s steps(1, end) infinite;
  }

  &__subtitle {
    @include tbody;

    color: $secondary-medium;
    margin: rem($spacer-unit * 0.25) 0 0;
  }
}

@keyframes cspl-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes cspl-ellipsis {
  0% {
    content: "";
  }
  25% {
    content: "·";
  }
  50% {
    content: "··";
  }
  75%,
  100% {
    content: "···";
  }
}

@media (prefers-reduced-motion: reduce) {
  .c-speech-loader__spinner {
    animation: none;
  }

  .c-speech-loader__ellipsis::after {
    content: "···";
    animation: none;
  }
}
</style>
