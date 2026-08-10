<template>
  <div class="c-speech">
    <div v-if="speech" class="o-container o-section u-margin-bottom-10">
      <div class="c-speech__cols">
        <main>
          <header class="c-speech__head" :style="{ '--grp': speakerColor }">
            <span class="c-speech__av-ring">
              <UAvatar
                :src="speakerDeputy?.image"
                :alt="speech.speaker"
                :text="speakerInitials"
                class="c-speech__av"
              />
            </span>
            <div class="c-speech__identity">
              <h1 class="c-speech__name">{{ speech.speaker }}</h1>
              <p class="c-speech__role">
                <span class="c-speech__role-sq" aria-hidden="true" />
                <template v-if="speech.group">{{ speech.group }} · </template>{{ speech.role }}
              </p>
            </div>
          </header>

          <div class="c-speech__inis">
            <div
              v-for="reference in speech.references"
              :key="reference"
              class="c-speech__ini"
            >
              <p class="c-speech__ini-type">
                <template v-if="initiativesByRef[reference]?.type"
                  >{{ initiativesByRef[reference].type }} · </template
                ><span class="c-speech__ini-ref">{{ reference }}</span>
              </p>
              <NuxtLink
                :to="`/iniciativas/${reference.replace('/', '-')}`"
                class="c-speech__ini-title"
              >
                {{ initiativesByRef[reference]?.title ?? `Iniciativa ${reference}` }}
              </NuxtLink>
            </div>
            <p class="c-speech__ini-sess">
              <NuxtLink
                v-if="sessionCode"
                :to="`/sesiones/${sessionCode}`"
                class="c-speech__ini-sess-link"
              >
                {{ sessionLabel }}
              </NuxtLink>
              <template v-else>{{ sessionLabel }}</template>
              · {{ formattedDate }}
            </p>
          </div>

          <!-- No `crossorigin` here: it would put the video request itself into CORS
               mode, and the Congress CDN sends no allow-origin header. That is also
               why the track is served from our own origin. -->
          <section v-if="speech.video_link" class="c-speech__video">
            <video ref="videoEl" controls preload="metadata" :src="speech.video_link">
              <track
                v-for="track in subtitles"
                :key="track.lang"
                :default="track.lang === captionLang"
                kind="subtitles"
                :src="track.src"
                :srclang="track.lang"
                :label="track.label"
              />
            </video>
          </section>
          <Message v-else type="info" icon>
            El vídeo de esta intervención aún no ha sido publicado por el Congreso.
          </Message>
          <p v-if="speech.video_link" class="c-speech__vhint">
            Fuente: canal audiovisual del Congreso de los Diputados.<template v-if="subtitles.length">
              Los subtítulos reproducen el Diario de Sesiones, sincronizado
              automáticamente con el vídeo.</template><template v-if="hasTranslatedTrack">
              La versión en castellano de una intervención en otra lengua es la
              traducción del Diario, sincronizada con el audio original.</template>
          </p>

          <div class="c-speech__t-bar">
            <h2 class="c-speech__t-title">Transcripción</h2>
            <button
              v-if="speech.mentions.length"
              type="button"
              class="c-speech__mentions-toggle"
              :aria-pressed="showMentions"
              @click="showMentions = !showMentions"
            >
              <Icon
                :name="showMentions ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
                :size="16"
              />
              {{ showMentions ? "Ocultar menciones" : "Mostrar menciones" }}
            </button>
          </div>
          <SpeechTextView
            v-model:active-lang="activeLang"
            :blocks="speech.speech"
            :people="people"
            :highlight-ranges="highlightRanges"
            :current-hl-id="currentHlId"
            :show-mentions="showMentions"
          />

          <nav v-if="debate.length > 1" class="c-speech__dnav">
            <NuxtLink
              v-if="prevSpeech"
              :to="prevSpeech.url"
              class="c-speech__dnav-link"
            >
              <Icon name="mdi:chevron-left" :size="18" />
              {{ prevSpeech.speaker }}
            </NuxtLink>
            <span v-else />
            <span class="c-speech__dnav-pos">
              Intervención {{ debateIndex + 1 }} de {{ debate.length }}
            </span>
            <NuxtLink
              v-if="nextSpeech"
              :to="nextSpeech.url"
              class="c-speech__dnav-link"
            >
              {{ nextSpeech.speaker }}
              <Icon name="mdi:chevron-right" :size="18" />
            </NuxtLink>
            <span v-else />
          </nav>
        </main>

        <aside>
          <template v-if="mentionsView.length">
            <h3 class="c-speech__side-h">Personas mencionadas</h3>
            <ul class="c-speech__plist">
              <li
                v-for="mention in mentionsView"
                :key="mention.key"
                class="c-speech__pitem"
                :style="{ '--grp': mention.color }"
              >
                <span class="c-speech__pav-ring">
                  <UAvatar
                    :src="mention.image"
                    :alt="mention.name"
                    :text="mention.initials"
                    class="c-speech__pav"
                  />
                </span>
                <span class="c-speech__pn">
                  <NuxtLink
                    v-if="mention.personType === 'deputy' && mention.personId"
                    :to="{ name: 'deputy', params: { id: mention.personId } }"
                  >
                    {{ mention.name }}
                  </NuxtLink>
                  <template v-else>{{ mention.name }}</template>
                </span>
                <span v-if="mention.count > 1" class="c-speech__px">
                  ×{{ mention.count }}
                </span>
              </li>
            </ul>
          </template>

          <template v-if="speech.interruptions.length">
            <h3 class="c-speech__side-h">Interrupciones</h3>
            <div
              v-for="(interruption, index) in speech.interruptions"
              :key="index"
              class="c-speech__intr"
            >
              <NuxtLink
                v-if="interruption.person_type === 'deputy' && interruption.person_id"
                :to="{ name: 'deputy', params: { id: interruption.person_id } }"
                class="c-speech__intr-name c-speech__intr-name--link"
              >
                {{ interruption.name }}
              </NuxtLink>
              <span v-else class="c-speech__intr-name">{{ interruption.name }}</span>
              <blockquote
                v-for="quote in interruption.quotes"
                :key="quote"
                class="c-speech__quote"
              >
                «{{ quote }}»
              </blockquote>
              <span v-if="interruption.reactions.length" class="c-speech__rx">
                {{ interruption.reactions.join(" · ") }}
              </span>
            </div>
          </template>

          <!-- sticky, LAST in the aside so it never overlaps the lists above -->
          <ClientOnly>
            <SpeechHighlightNav
              v-if="navHighlights.length || orphanHighlights.length || passagesPending"
              v-model:active-lang="activeLang"
              v-model:current-hl-id="currentHlId"
              :highlights="navHighlights"
              :orphans="orphanHighlights"
              :lang-labels="LANG_LABELS"
              :loading="passagesPending"
            />
          </ClientOnly>
        </aside>
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
// Cached per (speech, query) for the session, so returning to a speech already
// visited for this search shows its highlights instantly instead of paying the
// fetch again — the same payload-cache strategy the speech and context fetches
// above use. Passing getCachedData is what makes it stick: Nuxt purges an
// entry's payload when its last consumer unmounts EXCEPT when a custom one is
// supplied, and this page unmounts on every navigation. The key carries the
// query, so the same speech reached from a different search fetches afresh.
// Client-only: the query lives in web storage, which the server cannot read.
// null = not fetched (or failed) → fall back to the store's card passages;
// an empty array is a real "no passages" answer and is kept as such.
const { data: passageChunks, status: passagesStatus } = useAsyncData(
  () => `speech-passages-${route.params.id}-${store.query}`,
  async () => {
    if (!store.query) return null; // cold visit: nothing to highlight
    // A filters-only query ("intervenciones de Pedro Sánchez") asked for no
    // topic, so no passage of this speech matched anything and none may be
    // marked. An empty array is that answer — null would fall back to the card's
    // preview passages and mark the opening of the speech as if it had matched.
    if (store.queryMeta.browse) return [];
    const { passages } = await $api.getSpeechPassages(
      route.params.id,
      store.query
    );
    return passages ?? [];
  },
  { server: false, default: () => null, getCachedData: getCachedPayload }
);

// The card's highlights are only a preview: the grouped search reranks a small
// per-speech candidate pool (capped at HIGHLIGHTS), while this detail fetch
// re-searches ALL of the speech's passages — so it can surface more or different
// matches at any count, which the preview can't predict. While the fetch is in
// flight we hold back the preview and show a loader, so the panel (and transcript
// marks) never flash the card's passages and then jump to the full set. If it
// fails, the model falls back to the preview.
// A cache hit resolves without ever entering "pending", so a revisit renders the
// highlights immediately and never shows the loader.
const passagesPending = computed(() => passagesStatus.value === "pending");

const highlightModel = computed(() => {
  const blocks = speech.value?.speech ?? [];
  const chunks =
    mounted.value && speech.value && !passagesPending.value
      ? passageChunks.value ?? store.highlightsFor(speech.value.id)
      : [];
  if (!chunks.length || !blocks.length)
    return { ranges: {}, nav: [], orphans: [], matchedLang: null };

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

  // The matched language = the block of the top-ranked passage (chunks arrive in
  // reranked order, so the lowest located chunkIndex is the best match). The page
  // opens on this tab so the highlights panel isn't empty when the best match is
  // in a translation rather than the original block.
  const matchedLang =
    [...located].sort((a, b) => a.chunkIndex - b.chunkIndex)[0]?.lang ?? null;

  return { ranges, nav, orphans, matchedLang };
});

const highlightRanges = computed(() => highlightModel.value.ranges);
// The transcript shows one language block at a time, so the jump nav lists only
// the active language's matches (a passage's other-language twin lives in another
// block and appears when that tab is selected).
const navHighlights = computed(() =>
  highlightModel.value.nav.filter((hl) => hl.lang === activeLang.value)
);
const orphanHighlights = computed(() => highlightModel.value.orphans);

// Open on the best-matching language's tab (once) instead of the as-delivered
// default SpeechTextView picks — otherwise a match found only in a translation
// would leave the panel empty until the user switched tabs. A manual tab change
// afterwards is respected (the one-shot has already fired).
let didAutoSelectLang = false;
watch(
  () => highlightModel.value.matchedLang,
  (lang) => {
    if (lang && !didAutoSelectLang) {
      activeLang.value = lang;
      didAutoSelectLang = true;
    }
  },
  { immediate: true }
);

// ── Subtitles ─────────────────────────────────────────────────────────────
// A track exists only for interventions whose transcript has been timed against their
// video, so the speech itself says which ones to ask for — a `<track>` on a speech
// without cues would just 404. They are served by our own nitro route rather than by
// the backend: see server/api/subtitles/[id].get.js for why.
// A co-official-language intervention carries two, the language it was delivered in
// and its Spanish translation, so a reader who only reads Spanish is not left with
// subtitles they cannot follow.
const subtitles = computed(() => {
  const id = speech.value?.video_id ?? speech.value?.id;
  return (speech.value?.subtitles ?? []).map((track) => ({
    lang: track.lang,
    original: track.original !== false,
    // The translation is named as one: its timings are measured, but its words are the
    // Diario's Spanish reading rather than what was said aloud.
    label: track.original === false
      ? `${LANG_LABELS[track.lang] ?? track.lang} (traducción)`
      : LANG_LABELS[track.lang] ?? track.lang,
    src: `/api/subtitles/${id}?lang=${encodeURIComponent(track.lang)}`,
  }));
});

const hasTranslatedTrack = computed(() =>
  subtitles.value.some((track) => !track.original)
);

// Which track is showing. The transcript tab decides it, but not on its own: during
// server render `activeLang` is still null (SpeechTextView picks the tab on mount), and
// a speech can have a track in one language and not the other while a backfill is only
// half done. Falling back to the as-delivered track keeps captions on by default in
// both cases — the browser's own caption menu remains the way to change it.
const captionLang = computed(() => {
  const available = subtitles.value;
  if (!available.length) return null;
  if (available.some((track) => track.lang === activeLang.value)) {
    return activeLang.value;
  }
  return (available.find((track) => track.original) ?? available[0]).lang;
});

// `default` decides which track the browser shows on first render, but it is inert
// afterwards: switching tabs has to set `mode` on the live TextTrack list. Guarded on
// the element because the video is absent for an intervention whose clip the Congress
// has not published yet.
const videoEl = useTemplateRef("videoEl");

watch([captionLang, subtitles], () => {
  const tracks = videoEl.value?.textTracks;
  if (!tracks?.length) return;
  for (const track of tracks) {
    track.mode = track.language === captionLang.value ? "showing" : "disabled";
  }
});

const speakerDeputy = computed(() => getDeputyByName(speech.value.speaker));
const speakerColor = computed(() => partyColor(speakerDeputy.value?.party_name));

// "Apellido1 Apellido2, Nombre" → "NA" (given initial + first surname).
const initialsFor = (name) => {
  const [surnames = "", given = ""] = (name ?? "").split(",");
  const first = given.trim()[0] ?? "";
  const last = surnames.trim()[0] ?? "";
  return `${first}${last}`.toUpperCase() || surnames.trim()[0]?.toUpperCase() || "?";
};
const speakerInitials = computed(() => initialsFor(speech.value.speaker));

// Toggle for the in-transcript mention highlighting (chips + avatars + tint);
// off by default so the transcript reads clean. The sidebar mentions list
// (which carries the deputy's photo + party colour) is always visible.
const showMentions = ref(false);
const getDeputyById = useDeputyById();
const mentionsView = computed(() =>
  (speech.value.mentions ?? []).map((mention) => {
    const deputy =
      mention.person_type === "deputy" && mention.person_id
        ? getDeputyById(mention.person_id)
        : null;
    return {
      key: mention.person_id ?? mention.name,
      name: mention.name,
      count: mention.count,
      personType: mention.person_type,
      personId: mention.person_id,
      image: deputy?.image,
      color: partyColor(deputy?.party_name),
      initials: initialsFor(mention.name),
    };
  })
);

const formattedDate = computed(() => formatDateInt(speech.value?.date));

// session code = the Diario PDF filename stem (same derivation as SpeechCard)
const sessionCode = computed(() => {
  const stem = speech.value?.session_link?.split("/").pop()?.replace(/\.pdf$/i, "");
  return stem || null;
});

// the code's trailing segment is the sitting number → "Pleno núm. 196"
const sessionLabel = computed(() => {
  const n = sessionCode.value?.split("-").pop();
  return n && /^\d+$/.test(n)
    ? `${speech.value.session_name} núm. ${n}`
    : speech.value.session_name;
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
  &__cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(22px);
    align-items: start;

    @media (min-width: $md) {
      grid-template-columns: 1fr rem(300px);
      gap: rem(48px);
    }

    // The sticky highlights panel can only travel inside its containing block,
    // so the aside must span the full row height — `align-items: start` above
    // would shrink it to its content and pin the panel in place.
    > aside {
      align-self: stretch;
    }
  }

  // ── speaker header (no coloured top border; group reads via the ring) ──
  &__head {
    display: flex;
    align-items: center;
    gap: rem(16px);
    margin-bottom: rem(8px);
  }

  &__av-ring {
    flex: none;
    line-height: 0;
    border-radius: 50%;
    border: 3px solid var(--grp, var(--color-brand-500));
  }

  &__av {
    width: rem(66px) !important;
    height: rem(66px) !important;
    font-family: $font-headline;
    font-size: rem(22px);
    background-color: var(--color-brand-50);
    color: $secondary-dark;
  }

  &__identity {
    min-width: 0;
  }

  &__name {
    font-family: $font-headline;
    font-weight: 400;
    font-size: rem(27px);
    line-height: 1.06;
    letter-spacing: normal;
    text-transform: none;
    color: $black;
    margin: 0;

    @media (min-width: $sm) {
      font-size: rem(32px);
    }
  }

  &__role {
    font-size: rem(14.5px);
    line-height: 1.3;
    color: $secondary-medium;
    margin: rem(8px) 0 0;
  }

  &__role-sq {
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: var(--grp, var(--color-brand-500));
    margin-right: rem(9px);
    vertical-align: middle;
  }

  // ── initiative + session ──────────────────────────────────────────────
  &__inis {
    margin: rem(24px) 0 rem(28px);
  }

  &__ini {
    margin-bottom: rem($spacer-unit);
  }

  &__ini-type {
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: rem(11px);
    line-height: 1.3;
    color: $secondary-medium;
    margin: 0 0 rem(2px);
  }

  &__ini-ref {
    color: var(--color-brand-800);
  }

  &__ini-title {
    display: block;
    font-family: $font-headline;
    font-size: rem(18px);
    line-height: 1.25;
    color: $black;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__ini-sess {
    font-size: rem(13px);
    line-height: 1.4;
    color: $secondary-medium;
    font-variant-numeric: tabular-nums;
    margin: rem(8px) 0 0;
  }

  &__ini-sess-link {
    color: var(--color-brand-700);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  // ── video ─────────────────────────────────────────────────────────────
  &__video video {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: rem(420px);
    background-color: $black;
  }

  &__vhint {
    font-size: rem(12px);
    color: $secondary-medium;
    margin: rem($spacer-unit) 0 0;
  }

  // ── transcript toolbar (heading + in-text mention toggle) ─────────────
  &__t-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem($spacer-unit);
    margin: rem(28px) 0 rem(16px);
    padding-bottom: rem(10px);
    border-bottom: 2px solid $black;
  }

  &__t-title {
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: rem(15px);
    line-height: 1;
    color: $black;
    margin: 0;
  }

  &__mentions-toggle {
    display: inline-flex;
    align-items: center;
    gap: rem(6px);
    flex: none;
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: rem(11px);
    color: $secondary-dark;
    background-color: $white;
    border: 1px solid $neutral;
    padding: rem(6px) rem(10px);
    cursor: pointer;

    &:hover {
      border-color: var(--color-brand-600);
    }

    &[aria-pressed="true"] {
      background-color: var(--color-brand-100);
      border-color: var(--color-brand-500);
    }
  }

  // ── prev/next debate nav ──────────────────────────────────────────────
  &__dnav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(16px);
    margin-top: rem(30px);
    padding-top: rem(16px);
    border-top: 1px solid $neutral;
  }

  &__dnav-link {
    display: inline-flex;
    align-items: center;
    gap: rem(6px);
    font-family: $font-headline;
    font-size: rem(15px);
    color: $secondary-dark;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__dnav-pos {
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: rem(11px);
    color: $secondary-medium;
    text-align: center;
  }

  // ── sidebar ───────────────────────────────────────────────────────────
  &__side-h {
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: rem(13px);
    line-height: 1.2;
    color: $secondary-dark;
    margin: 0 0 rem(12px);
  }

  &__plist {
    list-style: none;
    margin: 0 0 rem(26px);
    padding: 0;
  }

  &__pitem {
    display: flex;
    align-items: center;
    gap: rem(10px);
    padding: rem(7px) 0;
    line-height: 1.3;
    border-bottom: 1px solid $neutral;

    // suppress the global li::before middot from 04_base/_base__lists.scss
    &::before {
      content: none;
    }
  }

  &__pav-ring {
    flex: none;
    line-height: 0;
    border-radius: 50%;
    border: 2px solid var(--grp, var(--color-brand-500));
  }

  &__pav {
    width: rem(34px) !important;
    height: rem(34px) !important;
    font-family: $font-headline;
    font-size: rem(12px);
    background-color: var(--color-brand-50);
    color: $secondary-dark;
  }

  &__pn {
    flex: 1;
    min-width: 0;
    font-size: rem(14px);
    color: $black;

    a {
      color: var(--color-brand-700);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        text-underline-offset: 2px;
      }
    }
  }

  &__px {
    margin-left: auto;
    font-family: $font-headline;
    font-size: rem(11px);
    color: $secondary-medium;
    font-variant-numeric: tabular-nums;
  }

  &__intr {
    padding: rem(10px) 0;
    border-bottom: 1px solid $neutral;
  }

  &__intr-name {
    display: block;
    font-family: $font-headline;
    font-size: rem(14px);
    line-height: 1.2;
    color: $black;
    text-decoration: none;

    &--link:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__quote {
    font-style: italic;
    font-size: rem(13px);
    line-height: 1.4;
    color: $secondary-dark;
    margin: rem(6px) 0 0;
    padding-left: rem(11px);
    border-left: 2px solid var(--color-brand-300);
  }

  &__rx {
    display: block;
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: rem(10.5px);
    color: $secondary-medium;
    margin-top: rem(5px);
  }
}
</style>
