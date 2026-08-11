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
        {{ blockLabel(block) }}
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
            v-if="showMentions && piece.type === 'mention' && piece.isDeputy"
            :to="{ name: 'deputy', params: { id: piece.personId } }"
            class="c-speech-text__mention c-speech-text__mention--linked"
            :class="{ 'c-speech-text__mention--grp': metaFor(piece) }"
            :style="metaFor(piece) ? { '--mgrp': metaFor(piece).color } : undefined"
          >
            <img
              v-if="metaFor(piece)?.image"
              :src="metaFor(piece).image"
              class="c-speech-text__mention-av"
              alt=""
              aria-hidden="true"
            />
            {{ piece.text }}
          </NuxtLink>
          <template v-else>{{ piece.text }}</template>
        </component>
      </template>
    </p>
  </div>
</template>

<script setup>
const { blocks, people, highlightRanges, currentHlId, showMentions } =
  defineProps({
    // speech[] from the API: [{ lang, text, original }]
    blocks: { type: Array, required: true },
    // mentions + interruptions, for surface-form highlighting
    people: { type: Array, default: () => [] },
    // search highlights per language: { [lang]: [{ start, end, hlId }] }
    highlightRanges: { type: Object, default: () => ({}) },
    // the highlight the jump nav is currently tracking (for emphasis)
    currentHlId: { type: Number, default: null },
    // when false, mentions render as plain text (no chip / avatar / tint)
    showMentions: { type: Boolean, default: true },
  });

// owned here by default, but the jump nav needs to switch tabs → expose as model
const activeLang = defineModel("activeLang", { default: null });

// group colour + avatar photo for each deputy mentioned (looked up once by id).
// Deputies are SSR-populated (fetched on the page), so this renders identically
// on server and client — no hydration drift.
const getDeputyById = useDeputyById();
const mentionMetaMap = computed(() => {
  const map = new Map();
  for (const person of people) {
    if (person.person_type !== "deputy" || !person.person_id) continue;
    if (map.has(person.person_id)) continue;
    const deputy = getDeputyById(person.person_id);
    if (deputy) {
      map.set(person.person_id, {
        image: deputy.image,
        color: partyColor(deputy.party_name),
      });
    }
  }
  return map;
});
const metaFor = (piece) =>
  piece.type === "mention" && piece.isDeputy
    ? mentionMetaMap.value.get(piece.personId)
    : null;

const LANG_LABELS = {
  es: "Castellano",
  ca: "Català",
  eu: "Euskara",
  gl: "Galego",
};
const langLabel = (lang) => LANG_LABELS[lang] ?? lang;

// A block holds what was said, whatever languages that mixes — a Basque passage inside a
// Spanish speech, a Catalan paragraph carrying Spanish borrowings. Naming only the main
// one would hide that the others were spoken at all, so name them all. `langs` opens with
// `lang`, and is empty on speeches extracted before the field existed.
const blockLabel = (block) =>
  (block.langs?.length ? block.langs : [block.lang]).map(langLabel).join(" · ");

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
  else if (piece.type === "mention" && !piece.isDeputy && showMentions)
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

    // deputy mentions carry the party colour + an inline avatar
    &--grp {
      background-color: color-mix(in srgb, var(--mgrp) 16%, transparent);
      color: $secondary-dark;

      &:hover {
        background-color: color-mix(in srgb, var(--mgrp) 28%, transparent);
      }
    }
  }

  &__mention-av {
    display: inline-block;
    width: 1.25em;
    height: 1.25em;
    border-radius: 50%;
    object-fit: cover;
    vertical-align: -0.28em;
    margin-right: 0.28em;
    border: 1.5px solid var(--mgrp, var(--color-brand-500));
  }

  // search-match highlight — green, active gets a yellow ring (matches artifact)
  &__hl {
    background-color: var(--color-brand-400);
    color: #16302b;
    padding: rem(1px) rem(2px);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    scroll-margin-top: rem($spacer-unit * 6);
    transition: box-shadow 0.2s ease;

    // a mention sitting inside a match keeps its own tint readable on green
    .c-speech-text__mention {
      background-color: rgba($black, 0.08);
    }

    &--current {
      box-shadow: 0 0 0 2px #efca53;
    }
  }
}
</style>
