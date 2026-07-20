<template>
  <aside v-if="highlights.length || orphans.length" class="c-speech-hl">
    <h4 class="c-speech-hl__title u-uppercase">Coincidencias de tu búsqueda</h4>
    <ol v-if="highlights.length" class="c-speech-hl__list">
      <li v-for="(hl, index) in highlights" :key="hl.hlId" class="c-speech-hl__item">
        <button
          type="button"
          :class="[
            'c-speech-hl__button',
            { 'c-speech-hl__button--active': hl.hlId === currentHlId },
          ]"
          @click="goTo(hl)"
        >
          <span class="c-speech-hl__index">{{ index + 1 }}</span>
          <span class="c-speech-hl__preview">{{ hl.preview }}</span>
          <span v-if="isMultiLang" class="c-speech-hl__lang">{{
            langLabel(hl.lang)
          }}</span>
        </button>
      </li>
    </ol>

    <!-- passages the search matched but that couldn't be located in the current
         transcript (upstream re-clean since indexing); shown so they aren't lost -->
    <div v-if="orphans.length" class="c-speech-hl__orphans">
      <p class="c-speech-hl__orphans-note">
        Coincidencias adicionales en esta intervención:
      </p>
      <p
        v-for="(passage, index) in orphans"
        :key="`orphan-${index}`"
        class="c-speech-hl__orphan"
      >
        {{ passage }}
      </p>
    </div>
  </aside>
</template>

<script setup>
const { highlights, orphans, langLabels } = defineProps({
  // document-ordered, located in the transcript: [{ hlId, lang, preview }]
  highlights: { type: Array, default: () => [] },
  // matched passages that couldn't be located in the transcript (shown as text)
  orphans: { type: Array, default: () => [] },
  langLabels: { type: Object, default: () => ({}) },
});

const activeLang = defineModel("activeLang", { default: null });
const currentHlId = defineModel("currentHlId", { default: null });

const langLabel = (lang) => langLabels[lang] ?? lang;

const isMultiLang = computed(
  () => new Set(highlights.map((hl) => hl.lang)).size > 1
);

const anchorId = (hlId) => `speech-hl-${hlId}`;

const scrollToCurrent = (hlId) => {
  document
    .getElementById(anchorId(hlId))
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const goTo = async (hl) => {
  currentHlId.value = hl.hlId;
  if (hl.lang !== activeLang.value) {
    // switch language tab first, then scroll once the block has re-rendered
    activeLang.value = hl.lang;
    await nextTick();
  }
  scrollToCurrent(hl.hlId);
};

// Track which match is on screen (topmost visible) to sync the active item.
const visible = new Map(); // hlId → isIntersecting
const markEls = shallowRef([]);

const refreshMarks = async () => {
  await nextTick();
  markEls.value = Array.from(
    document.querySelectorAll('[id^="speech-hl-"]')
  );
};

useIntersectionObserver(
  markEls,
  (entries) => {
    for (const entry of entries) {
      const hlId = Number(entry.target.id.replace("speech-hl-", ""));
      visible.set(hlId, entry.isIntersecting);
    }
    const onScreen = [...visible.entries()]
      .filter(([, seen]) => seen)
      .map(([hlId]) => hlId);
    if (onScreen.length) currentHlId.value = Math.min(...onScreen);
  },
  { rootMargin: "-20% 0px -60% 0px" }
);

// re-collect anchor marks whenever the set or the active language changes
// (marks only exist in the DOM for the active language block)
onMounted(refreshMarks);
watch([() => highlights, activeLang], refreshMarks);
</script>

<style lang="scss" scoped>
.c-speech-hl {
  margin-bottom: rem($spacer-unit * 2);

  @media (min-width: $md) {
    position: sticky;
    top: rem($spacer-unit * 4);
  }

  &__title {
    margin-bottom: rem($spacer-unit);
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    counter-reset: none;
  }

  &__item {
    margin-bottom: rem(math.div($spacer-unit, 2));

    // suppress the global li::before decoration from 04_base/_base__lists.scss
    &::before {
      content: none;
    }
  }

  &__button {
    display: flex;
    gap: rem(math.div($spacer-unit, 2));
    width: 100%;
    text-align: left;
    background: none;
    border: 0;
    border-left: 3px solid var(--color-brand-200);
    padding: rem(math.div($spacer-unit, 2)) rem($spacer-unit);
    cursor: pointer;
    color: $secondary-dark;

    &:hover {
      background-color: var(--color-brand-100);
    }

    &--active {
      border-left-color: #f6c945;
      background-color: var(--color-brand-100);
    }
  }

  &__index {
    @include overline;

    color: $secondary-medium;
    flex-shrink: 0;
  }

  &__preview {
    @include tbody2;

    font-style: italic;
    color: $secondary-dark;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &__lang {
    @include overline;

    color: $secondary-medium;
    flex-shrink: 0;
    margin-left: auto;
  }

  &__orphans {
    margin-top: rem($spacer-unit);
  }

  &__orphans-note {
    @include overline;

    color: $secondary-medium;
    margin: 0 0 rem(math.div($spacer-unit, 2));
  }

  &__orphan {
    @include tbody2;

    font-style: italic;
    color: $secondary-dark;
    border-left: 3px solid var(--color-brand-200);
    padding: rem(math.div($spacer-unit, 2)) rem($spacer-unit);
    margin: 0 0 rem(math.div($spacer-unit, 2));
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
  }
}
</style>
