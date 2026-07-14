<template>
  <section class="c-debate-section">
    <header class="c-debate-section__header">
      <p v-if="debate.references.length > 1" class="c-debate-section__joint">
        Debate conjunto
      </p>
      <div
        v-for="reference in debate.references"
        :key="reference"
        class="c-debate-section__initiative"
      >
        <p v-if="initiativeFor(reference)?.type" class="c-debate-section__type">
          {{ initiativeFor(reference).type }} · {{ reference }}
        </p>
        <p v-else class="c-debate-section__type">{{ reference }}</p>
        <NuxtLink
          :to="`/iniciativas/${reference.replace('/', '-')}`"
          class="c-debate-section__title"
        >
          {{ initiativeFor(reference)?.title ?? `Iniciativa ${reference}` }}
        </NuxtLink>
      </div>
    </header>

    <ol class="c-debate-section__speeches">
      <li
        v-for="speech in debate.speeches"
        :key="speech.id"
        class="c-debate-section__speech"
      >
        <NuxtLink
          :to="`/intervenciones/${speech.video_id ?? speech.id}`"
          class="c-debate-section__speech-link"
        >
          <span class="c-debate-section__order">{{ speech.order }}</span>
          <span class="c-debate-section__speech-body">
            <span class="c-debate-section__speaker">{{ speech.speaker }}</span>
            <span class="c-debate-section__speaker-meta">
              <template v-if="speech.group">{{ speech.group }} · </template>{{ speech.role }}
            </span>
          </span>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>

<script setup>
const { debate, initiativesByRef } = defineProps({
  // { references: [...], speeches: [...] } — speeches already sorted by order
  debate: { type: Object, required: true },
  // reference code → { id, title, type }
  initiativesByRef: { type: Object, default: () => ({}) },
});

const initiativeFor = (reference) => initiativesByRef[reference];
</script>

<style lang="scss" scoped>
.c-debate-section {
  margin-bottom: rem($spacer-unit * 4);

  &__header {
    margin-bottom: rem($spacer-unit * 1.5);
  }

  &__joint {
    @include overline;

    color: $secondary-medium;
    margin: 0 0 rem(math.div($spacer-unit, 2));
  }

  &__initiative {
    margin-bottom: rem($spacer-unit);
  }

  &__type {
    @include overline;

    margin: 0;
  }

  &__title {
    font-size: rem(20px);
    line-height: 1.4;
    color: $secondary-dark;

    &:hover {
      text-decoration: underline;
    }
  }

  &__speeches {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 4px solid var(--color-brand-500);
  }

  &__speech {
    margin: 0;

    // suppress the global li::before counter from 04_base/_base__lists.scss
    &::before {
      content: none;
    }
  }

  &__speech-link {
    display: flex;
    align-items: baseline;
    gap: rem($spacer-unit);
    padding: rem(math.div($spacer-unit, 2)) rem($spacer-unit);
    color: inherit;

    &:hover {
      background-color: var(--color-brand-100);

      .c-debate-section__speaker {
        text-decoration: underline;
      }
    }
  }

  &__order {
    @include overline;

    min-width: rem(24px);
    text-align: right;
    color: $secondary-medium;
  }

  &__speech-body {
    display: flex;
    flex-direction: column;
  }

  &__speaker {
    @include tbody2;

    color: $secondary-dark;
  }

  &__speaker-meta {
    @include overline;

    color: $secondary-medium;
  }
}
</style>
