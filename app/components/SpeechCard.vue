<template>
  <article class="c-speech-card" :id="`speech-card-${speech.id}`">
    <header class="c-speech-card__header">
      <h2 class="c-speech-card__speaker">
        <NuxtLink
          :to="`/intervenciones/${speech.video_id ?? speech.id}`"
          class="c-speech-card__speaker-link"
        >
          {{ speech.speaker }}
        </NuxtLink>
      </h2>
      <p class="c-speech-card__meta">
        <span v-if="speech.group">{{ speech.group }}</span>
        <span v-if="speech.role"> · {{ speech.role }}</span>
      </p>
      <p class="c-speech-card__session">
        <NuxtLink
          v-if="sessionCode"
          :to="`/sesiones/${sessionCode}`"
          class="c-speech-card__session-link"
        >
          {{ speech.session_name }} · {{ formattedDate }}
        </NuxtLink>
        <template v-else>{{ speech.session_name }} · {{ formattedDate }}</template>
      </p>
    </header>
    <p
      v-for="(passage, index) in highlights"
      :key="index"
      class="c-speech-card__highlight"
    >
      {{ passage }}
    </p>
  </article>
</template>

<script setup>
const { speech, highlights } = defineProps({
  speech: { type: Object, required: true },
  highlights: { type: Array, default: () => [] },
});

// date arrives as a yyyymmdd integer, e.g. 20241009
const formattedDate = computed(() => formatDateInt(speech.date));

// session_link is the Diario PDF path; its filename stem is the session code
// (e.g. /public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-196.PDF → DSCD-15-PL-196)
const sessionCode = computed(() => {
  const stem = speech.session_link?.split("/").pop()?.replace(/\.pdf$/i, "");
  return stem || null;
});
</script>

<style scoped lang="scss">
.c-speech-card {
  @include tbody2;

  padding-bottom: rem($spacer-unit * 3);

  &__header {
    margin-bottom: rem($spacer-unit);
  }

  &__speaker {
    font-size: rem(20px);
    line-height: 1.4;
    text-transform: none;
    color: $secondary-dark;
    margin-bottom: rem(math.div($spacer-unit, 4));
  }

  &__speaker-link {
    color: inherit;

    &:hover {
      text-decoration: underline;
    }
  }

  &__meta {
    @include overline;

    margin: 0;
  }

  &__session {
    @include tbody2;

    color: $secondary-medium;
    margin: 0;
  }

  &__session-link {
    color: inherit;

    &:hover {
      color: $secondary-dark;
      text-decoration: underline;
    }
  }

  &__highlight {
    border-left: 4px solid var(--color-brand-500);
    padding-left: rem($spacer-unit);
    margin-bottom: rem($spacer-unit);
    font-style: italic;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
    overflow: hidden;
  }
}
</style>
