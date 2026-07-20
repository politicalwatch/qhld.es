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
      v-for="(pieces, paragraphIndex) in paragraphs"
      :key="`${activeLang}-${paragraphIndex}`"
      class="c-speech-text__body"
    >
      <template v-for="(piece, index) in pieces" :key="index">
        <component
          :is="piece.highlighted ? 'mark' : 'span'"
          :id="piece.anchorId != null ? `speech-hl-${piece.anchorId}` : undefined"
          :class="pieceClass(piece)"
        >
          <NuxtLink
            v-if="piece.type === 'mention' && piece.isDeputy"
            :to="{ name: 'deputy', params: { id: piece.personId } }"
            class="c-speech-text__mention c-speech-text__mention--linked"
          >
            {{ piece.text }}
          </NuxtLink>
          <template v-else>{{ piece.text }}</template>
        </component>
      </template>
    </p>
  </div>
</template>

<script setup>
const { blocks, people, highlightRanges, currentHlId } = defineProps({
  // speech[] from the API: [{ lang, text, original }]
  blocks: { type: Array, required: true },
  // mentions + interruptions, for surface-form highlighting
  people: { type: Array, default: () => [] },
  // search highlights per language: { [lang]: [{ start, end, hlId }] }
  highlightRanges: { type: Object, default: () => ({}) },
  // the highlight the jump nav is currently tracking (for emphasis)
  currentHlId: { type: Number, default: null },
});

// owned here by default, but the jump nav needs to switch tabs → expose as model
const activeLang = defineModel("activeLang", { default: null });

const LANG_LABELS = {
  es: "Castellano",
  ca: "Català",
  eu: "Euskara",
  gl: "Galego",
};
const langLabel = (lang) => LANG_LABELS[lang] ?? lang;

// default to the as-delivered language when the parent hasn't set one
if (activeLang.value == null) {
  activeLang.value = (blocks.find((b) => b.original) ?? blocks[0])?.lang ?? null;
}

// the text carries the Diario's paragraph structure as blank-line breaks;
// search highlights (if any) are layered on top per active language block
const paragraphs = computed(() => {
  const block = blocks.find((b) => b.lang === activeLang.value) ?? blocks[0];
  const ranges = highlightRanges[activeLang.value] ?? [];
  return buildSpeechParagraphs(block?.text ?? "", people, ranges);
});

const pieceClass = (piece) => {
  const classes = [];
  if (piece.type === "annotation") classes.push("c-speech-text__annotation");
  else if (piece.type === "mention" && !piece.isDeputy)
    classes.push("c-speech-text__mention");
  if (piece.highlighted) classes.push("c-speech-text__hl");
  if (currentHlId != null && piece.hlIds?.includes(currentHlId))
    classes.push("c-speech-text__hl--current");
  return classes;
};
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

  // search-match highlight — amber, deliberately distinct from the mint mentions
  &__hl {
    $hl: #fce6a2;
    $hl-current: #f6c945;

    background-color: $hl;
    color: inherit;
    padding: 0 rem(1px);
    box-shadow: 0 rem(1px) 0 rgba($black, 0.12);
    scroll-margin-top: rem($spacer-unit * 6);
    transition: background-color 0.2s ease;

    // a mention sitting inside a match keeps its own tint readable on amber
    .c-speech-text__mention {
      background-color: rgba($black, 0.06);
    }

    &--current {
      background-color: $hl-current;
    }
  }
}
</style>
