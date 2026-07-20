<template>
  <div class="c-speech">
    <div v-if="speech" class="o-container o-section u-margin-bottom-10">
      <div class="o-grid o-grid--between">
        <div class="o-grid__col u-12 u-8@md">
          <h2>{{ speech.speaker }}</h2>
          <p class="c-speech__meta">
            <span v-if="speech.group">{{ speech.group }} · </span>{{ speech.role }}
          </p>
          <p class="c-speech__session">
            <NuxtLink v-if="sessionCode" :to="`/sesiones/${sessionCode}`">
              {{ speech.session_name }} · {{ formattedDate }}
            </NuxtLink>
            <template v-else>{{ speech.session_name }} · {{ formattedDate }}</template>
          </p>

          <div class="c-speech__initiatives u-margin-bottom-4">
            <div
              v-for="reference in speech.references"
              :key="reference"
              class="c-speech__initiative"
            >
              <p class="c-speech__initiative-type">
                <template v-if="initiativesByRef[reference]?.type"
                  >{{ initiativesByRef[reference].type }} · </template
                >{{ reference }}
              </p>
              <NuxtLink
                :to="`/iniciativas/${reference.replace('/', '-')}`"
                class="c-speech__initiative-title"
              >
                {{ initiativesByRef[reference]?.title ?? `Iniciativa ${reference}` }}
              </NuxtLink>
            </div>
          </div>

          <section v-if="speech.video_link" class="c-speech__video u-margin-bottom-4">
            <video controls preload="metadata" :src="speech.video_link" />
          </section>
          <Message v-else type="info" icon>
            El vídeo de esta intervención aún no ha sido publicado por el Congreso.
          </Message>

          <SpeechTextView
            v-model:active-lang="activeLang"
            :blocks="speech.speech"
            :people="people"
            :highlight-ranges="highlightRanges"
            :current-hl-id="currentHlId"
          />

          <nav v-if="debate.length > 1" class="c-speech__nav u-padding-top-2">
            <NuxtLink
              v-if="prevSpeech"
              :to="prevSpeech.url"
              class="c-speech__nav-link c-speech__nav-link--prev"
            >
              <Icon name="mdi:chevron-left" :size="20" />
              {{ prevSpeech.speaker }}
            </NuxtLink>
            <span v-else />
            <span class="c-speech__nav-position">
              Intervención {{ debateIndex + 1 }} de {{ debate.length }}
            </span>
            <NuxtLink
              v-if="nextSpeech"
              :to="nextSpeech.url"
              class="c-speech__nav-link c-speech__nav-link--next"
            >
              {{ nextSpeech.speaker }}
              <Icon name="mdi:chevron-right" :size="20" />
            </NuxtLink>
            <span v-else />
          </nav>
        </div>

        <div class="o-grid__col u-12 u-3@md">
          <DeputyCard v-if="speakerDeputy" :deputy="speakerDeputy" layout="medium" />

          <template v-if="speech.mentions.length">
            <h4 class="u-uppercase">Personas mencionadas</h4>
            <ul class="c-speech__people">
              <li
                v-for="mention in speech.mentions"
                :key="mention.person_id ?? mention.name"
                class="c-speech__person"
              >
                <NuxtLink
                  v-if="mention.person_type === 'deputy' && mention.person_id"
                  :to="{ name: 'deputy', params: { id: mention.person_id } }"
                  class="c-speech__person-name c-speech__person-name--linked"
                >
                  {{ mention.name }}
                </NuxtLink>
                <span v-else class="c-speech__person-name">{{ mention.name }}</span>
                <span v-if="mention.count > 1" class="c-speech__person-count"
                  >×{{ mention.count }}</span
                >
              </li>
            </ul>
          </template>

          <template v-if="speech.interruptions.length">
            <h4 class="u-uppercase">Interrupciones</h4>
            <ul class="c-speech__people">
              <li
                v-for="(interruption, index) in speech.interruptions"
                :key="index"
                class="c-speech__person c-speech__interruption"
              >
                <NuxtLink
                  v-if="interruption.person_type === 'deputy' && interruption.person_id"
                  :to="{ name: 'deputy', params: { id: interruption.person_id } }"
                  class="c-speech__person-name c-speech__person-name--linked"
                >
                  {{ interruption.name }}
                </NuxtLink>
                <span v-else class="c-speech__person-name">{{ interruption.name }}</span>
                <blockquote
                  v-for="quote in interruption.quotes"
                  :key="quote"
                  class="c-speech__quote"
                >
                  «{{ quote }}»
                </blockquote>
                <span
                  v-if="interruption.reactions.length"
                  class="c-speech__reactions"
                >
                  {{ interruption.reactions.join(" · ") }}
                </span>
              </li>
            </ul>
          </template>

          <ClientOnly>
            <SpeechHighlightNav
              v-if="navHighlights.length || orphanHighlights.length"
              v-model:active-lang="activeLang"
              v-model:current-hl-id="currentHlId"
              :highlights="navHighlights"
              :orphans="orphanHighlights"
              :lang-labels="LANG_LABELS"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
    <div v-else class="o-container o-section u-margin-bottom-10">
      <Loader title="Cargando datos" subtitle="Puede llevar unos segundos" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'speech' });

import SpeechTextView from "@/components/SpeechTextView.vue";
import SpeechHighlightNav from "@/components/SpeechHighlightNav.vue";
import DeputyCard from "@/components/DeputyCard.vue";
import Message from "@/components/Message.vue";
import Loader from "@/components/Loader.vue";

const route = useRoute();
const { $api } = useNuxtApp();
const store = useSpeechSearchStore();

await useDeputies();
const getDeputyByName = useDeputyByName();

// Fetch the speech via SSR so meta tags have data during server render
const { data: speech, error: speechError } = await useAsyncData(
  () => `speech-${route.params.id}`,
  () => $api.getSpeech(route.params.id),
  { getCachedData: getCachedPayload },
);
if (speechError.value || !speech.value) {
  throw createError({ statusCode: 404, statusMessage: 'Intervención no encontrada', fatal: true });
}

// Canonical URL: the numeric Congress intervention id. A speech reached
// through its internal hash id (or any alias) redirects permanently.
if (speech.value.video_id && route.params.id !== speech.value.video_id) {
  await navigateTo(`/intervenciones/${speech.value.video_id}`, {
    redirectCode: 301,
    replace: true,
  });
}

// Debate context (prev/next) + initiative titles. The reference filter is
// array-membership, and a reference can belong to both a solo and a joint
// debate within one sitting — the exact references-tuple is the debate.
const { data: context } = await useAsyncData(
  () => `speech-context-${route.params.id}`,
  async () => {
    const current = speech.value;
    const key = JSON.stringify(current.references);
    const [speechesResponse, initiatives] = await Promise.all([
      current.references.length
        ? $api.getSpeeches({
            session: current.session_id,
            reference: current.references[0],
            per_page: -1,
          })
        : Promise.resolve({ speeches: [current] }),
      Promise.all(
        [...new Set(current.references)].map((reference) =>
          $api.getInitiativeByReference(reference).catch(() => null)
        )
      ),
    ]);
    const debate = (speechesResponse.speeches ?? [])
      .filter((s) => JSON.stringify(s.references) === key)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s) => ({
        id: s.id,
        url: `/intervenciones/${s.video_id ?? s.id}`,
        order: s.order,
        speaker: s.speaker,
      }));
    const initiativesByRef = {};
    for (const initiative of initiatives) {
      if (!initiative) continue;
      initiativesByRef[initiative.reference] = {
        id: initiative.id,
        title: initiative.title,
        type: initiative.initiative_type_alt,
      };
    }
    return { debate, initiativesByRef };
  },
  { getCachedData: getCachedPayload },
);

const initiativesByRef = computed(() => context.value?.initiativesByRef ?? {});
const debate = computed(() => context.value?.debate ?? []);
const debateIndex = computed(() =>
  debate.value.findIndex((s) => s.id === speech.value.id)
);
const prevSpeech = computed(() => debate.value[debateIndex.value - 1] ?? null);
const nextSpeech = computed(() =>
  debateIndex.value === -1 ? null : debate.value[debateIndex.value + 1] ?? null
);

const people = computed(() => [
  ...(speech.value.mentions ?? []),
  ...(speech.value.interruptions ?? []),
]);

// ── Search highlights ─────────────────────────────────────────────────────
// The passages that matched the user's search live in the session store (from
// the results page), never in getSpeech. We locate each in the transcript and
// highlight it in place, with a jump nav. sessionStorage is client-only, so
// this is gated on mount to keep SSR and hydration identical (no marks) before
// the highlights layer in.
//
// The store holds only the 3 passages shown on the result card — too few for a
// full transcript. When there is a query in context we fetch EVERY relevant
// passage of this speech (reranker-floored, no cap) and highlight all of them;
// the store's 3 are the instant fallback shown until that resolves (and if the
// call fails). A cold visit (no query) shows a plain transcript, no nav.
const LANG_LABELS = { es: "Castellano", ca: "Català", eu: "Euskara", gl: "Galego" };
const mounted = useMounted();
const activeLang = ref(null);
const currentHlId = ref(null);
const passageChunks = ref(null); // null = not (yet) fetched → fall back to store

watch(
  mounted,
  async (isMounted) => {
    if (!isMounted || !speech.value || !store.query) return;
    try {
      const { passages } = await $api.getSpeechPassages(
        route.params.id,
        store.query
      );
      passageChunks.value = passages ?? [];
    } catch {
      passageChunks.value = null; // keep the store's 3 as a graceful fallback
    }
  },
  { immediate: true }
);

const highlightModel = computed(() => {
  const blocks = speech.value?.speech ?? [];
  const chunks =
    mounted.value && speech.value
      ? passageChunks.value ?? store.highlightsFor(speech.value.id)
      : [];
  if (!chunks.length || !blocks.length)
    return { ranges: {}, nav: [], orphans: [] };

  // locate per block, then order by document position (block, then offset)
  const located = [];
  blocks.forEach((block, blockIndex) => {
    for (const range of locateHighlights(block.text, chunks)) {
      located.push({ ...range, blockIndex, lang: block.lang });
    }
  });
  located.sort((a, b) => a.blockIndex - b.blockIndex || a.start - b.start);

  const ranges = {}; // lang → [{ start, end, hlId }]
  const nav = []; // doc-ordered [{ hlId, lang, preview }]
  located.forEach((range, hlId) => {
    (ranges[range.lang] ??= []).push({
      start: range.start,
      end: range.end,
      hlId,
    });
    nav.push({
      hlId,
      lang: range.lang,
      preview: chunks[range.chunkIndex].replace(/\s+/g, " ").trim().slice(0, 120),
    });
  });

  // A few chunks may not be locatable when the stored transcript was re-cleaned
  // after Qdrant indexing (data drift, self-heals on re-index). Still surface
  // the passage so the user never loses a match they searched for.
  const locatedIdx = new Set(located.map((r) => r.chunkIndex));
  const orphans = chunks
    .map((text, index) => ({ text, index }))
    .filter((chunk) => !locatedIdx.has(chunk.index))
    .map((chunk) => chunk.text.replace(/\s+/g, " ").trim());

  return { ranges, nav, orphans };
});

const highlightRanges = computed(() => highlightModel.value.ranges);
const navHighlights = computed(() => highlightModel.value.nav);
const orphanHighlights = computed(() => highlightModel.value.orphans);

const speakerDeputy = computed(() => getDeputyByName(speech.value.speaker));

const formattedDate = computed(() => formatDateInt(speech.value?.date));

// session code = the Diario PDF filename stem (same derivation as SpeechCard)
const sessionCode = computed(() => {
  const stem = speech.value?.session_link?.split("/").pop()?.replace(/\.pdf$/i, "");
  return stem || null;
});

// SSR-ready meta — noindex while the feature is dev-only
const speechTitle = `${speech.value.speaker} · ${speech.value.session_name} · ${formattedDate.value}`;
const excerpt = (speech.value.speech?.[0]?.text ?? '')
  .replace(/\s+/g, ' ')
  .slice(0, 157)
  .trimEnd();
const speechDescription = excerpt ? `${excerpt}…` : speechTitle;
useSeoMeta({
  title: speechTitle,
  ogTitle: speechTitle,
  description: speechDescription,
  ogDescription: speechDescription,
  ogType: 'article',
  robots: 'noindex, follow',
});

defineOgImage('Speech', {
  speaker: speech.value.speaker ?? '',
  meta: [speech.value.group, speech.value.role].filter(Boolean).join(' · '),
  session: `${speech.value.session_name ?? ''} · ${formattedDate.value}`,
  code: sessionCode.value ?? '',
});
</script>

<style lang="scss" scoped>
.c-speech {
  h2 {
    margin-bottom: rem(math.div($spacer-unit, 2));
  }

  &__meta {
    @include overline;

    margin: 0;
  }

  &__session {
    @include tbody2;

    color: $secondary-medium;
    margin: 0 0 rem($spacer-unit * 2);

    a {
      color: inherit;

      &:hover {
        color: $secondary-dark;
        text-decoration: underline;
      }
    }
  }

  &__initiative {
    margin-bottom: rem($spacer-unit);
  }

  &__initiative-type {
    @include overline;

    margin: 0;
  }

  &__initiative-title {
    font-size: rem(20px);
    line-height: 1.4;
    color: $secondary-dark;

    &:hover {
      text-decoration: underline;
    }
  }

  &__video video {
    width: 100%;
    max-height: rem(480px);
    background-color: $black;
  }

  &__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem($spacer-unit);
    margin-top: rem($spacer-unit * 2);
    border-top: 1px solid var(--color-brand-200);
    padding-top: rem($spacer-unit);
  }

  &__nav-link {
    @include tbody2;

    display: inline-flex;
    align-items: center;
    gap: rem(math.div($spacer-unit, 4));
    color: $secondary-dark;

    &:hover {
      text-decoration: underline;
    }
  }

  &__nav-position {
    @include overline;

    color: $secondary-medium;
    text-align: center;
  }

  &__people {
    list-style: none;
    margin: 0 0 rem($spacer-unit * 2);
    padding: 0;
  }

  &__person {
    display: flex;
    flex-direction: column;
    margin-bottom: rem($spacer-unit);

    // suppress the global li::before middot from 04_base/_base__lists.scss
    &::before {
      content: none;
    }
  }

  &__person-name {
    @include tbody2;

    color: $secondary-dark;

    &--linked:hover {
      text-decoration: underline;
    }
  }

  &__person-count {
    @include overline;

    color: $secondary-medium;
  }

  &__quote {
    @include tbody2;

    font-style: italic;
    color: $secondary-medium;
    margin: 0;
    padding-left: rem($spacer-unit);
    border-left: 2px solid var(--color-brand-300);
  }

  &__reactions {
    @include overline;

    color: $secondary-medium;
  }
}
</style>
