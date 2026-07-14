<template>
  <div class="c-speech-text">
    <div v-if="blocks.length > 1" class="c-speech-text__langs">
      <button
        v-for="block in blocks"
        :key="block.lang"
        type="button"
        :class="[
          'c-speech-text__lang',
          { 'c-speech-text__lang--active': block.lang === activeLang },
        ]"
        @click="activeLang = block.lang"
      >
        {{ langLabel(block.lang) }}
        <span v-if="block.original" class="c-speech-text__lang-original">original</span>
      </button>
    </div>

    <p
      v-for="(segments, paragraphIndex) in paragraphs"
      :key="`${activeLang}-${paragraphIndex}`"
      class="c-speech-text__body"
    >
      <template v-for="(segment, index) in segments" :key="index">
        <span v-if="segment.type === 'annotation'" class="c-speech-text__annotation">
          {{ segment.text }}
        </span>
        <NuxtLink
          v-else-if="segment.type === 'mention' && segment.isDeputy"
          :to="{ name: 'deputy', params: { id: segment.personId } }"
          class="c-speech-text__mention c-speech-text__mention--linked"
        >
          {{ segment.text }}
        </NuxtLink>
        <span v-else-if="segment.type === 'mention'" class="c-speech-text__mention">
          {{ segment.text }}
        </span>
        <template v-else>{{ segment.text }}</template>
      </template>
    </p>
  </div>
</template>

<script setup>
const { blocks, people } = defineProps({
  // speech[] from the API: [{ lang, text, original }]
  blocks: { type: Array, required: true },
  // mentions + interruptions, for surface-form highlighting
  people: { type: Array, default: () => [] },
});

const LANG_LABELS = {
  es: "Castellano",
  ca: "Català",
  eu: "Euskara",
  gl: "Galego",
};
const langLabel = (lang) => LANG_LABELS[lang] ?? lang;

// the as-delivered language is shown first
const activeLang = ref(
  (blocks.find((b) => b.original) ?? blocks[0])?.lang ?? null
);

// the text carries the Diario's paragraph structure as blank-line breaks
const paragraphs = computed(() => {
  const block = blocks.find((b) => b.lang === activeLang.value) ?? blocks[0];
  return (block?.text ?? "")
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph) => parseSpeechText(paragraph, people));
});
</script>

<style lang="scss" scoped>
.c-speech-text {
  &__langs {
    display: flex;
    gap: rem(math.div($spacer-unit, 2));
    margin-bottom: rem($spacer-unit);
  }

  &__lang {
    @include overline;

    background: none;
    border: 1px solid $secondary-medium;
    color: $secondary-dark;
    padding: rem(math.div($spacer-unit, 4)) rem($spacer-unit);
    cursor: pointer;

    &--active {
      border-color: $secondary-dark;
      background-color: var(--color-brand-100);
    }
  }

  &__lang-original {
    text-transform: lowercase;
    color: $secondary-medium;
    margin-left: rem(math.div($spacer-unit, 4));
  }

  &__body {
    @include tbody2;

    line-height: 1.8;
    margin: 0 0 rem($spacer-unit);

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__annotation {
    font-style: italic;
    color: $secondary-medium;
  }

  &__mention {
    background-color: var(--color-brand-100);
    padding: 0 rem(2px);
    border-radius: rem(2px);

    &--linked {
      color: $secondary-dark;

      &:hover {
        background-color: var(--color-brand-200);
        text-decoration: underline;
      }
    }
  }
}
</style>
