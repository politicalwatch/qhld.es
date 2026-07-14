<template>
  <div class="c-session">
    <div v-if="session" class="o-container o-section u-margin-bottom-10">
      <div class="o-grid o-grid--between">
        <div class="o-grid__col u-12 u-8@md">
          <h2>{{ session.name }} · {{ formattedDate }}</h2>
          <div class="o-grid u-padding-top-2 u-margin-bottom-4">
            <div class="o-grid__col o-grid__col--fill">
              <h6 class="u-uppercase">Diario de sesiones</h6>
              <p class="c-session__info">{{ session.code }}</p>
            </div>
            <div class="o-grid__col u-12 u-8@sm c-session__actions">
              <CongressLink v-if="congressUrl" :url="congressUrl" />
              <a
                v-if="pdfUrl"
                :href="pdfUrl"
                class="u-uppercase u-border-link c-session__pdf-link"
                target="_blank"
                title="Descargar el Diario de Sesiones (PDF)"
              >
                Descargar Diario de Sesiones
                <Icon name="mdi:file-download-outline" style="color: #2d4252" :size="20" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <section v-if="session.video_link" class="c-session__video u-margin-bottom-4">
        <video controls preload="metadata" :src="session.video_link" />
      </section>
      <Message v-else type="info" icon>
        El vídeo de esta sesión aún no ha sido publicado por el Congreso.
      </Message>

      <div class="o-grid o-grid--between">
        <div class="o-grid__col u-12 u-8@md">
          <h4 class="u-uppercase">Orden del día</h4>
          <SessionDebateSection
            v-for="debate in debates"
            :key="debate.key"
            :debate="debate"
            :initiativesByRef="initiativesByRef"
          />
        </div>

        <div class="o-grid__col u-12 u-3@md">
          <h4 class="u-uppercase">Intervinientes</h4>
          <ul class="c-session__speakers">
            <li
              v-for="speaker in speakers"
              :key="speaker.name"
              class="c-session__speaker"
            >
              <DeputyCard
                v-if="speaker.deputy"
                :deputy="speaker.deputy"
                layout="medium"
              />
              <template v-else>
                <span class="c-session__speaker-name">{{ speaker.name }}</span>
                <span class="c-session__speaker-meta">
                  <template v-if="speaker.group">{{ speaker.group }} · </template>{{ speaker.role }}
                </span>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="o-container o-section u-margin-bottom-10">
      <Loader title="Cargando datos" subtitle="Puede llevar unos segundos" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'session' });

import SessionDebateSection from "@/components/SessionDebateSection.vue";
import DeputyCard from "@/components/DeputyCard.vue";
import CongressLink from "@/components/CongressLink.vue";
import Message from "@/components/Message.vue";
import Loader from "@/components/Loader.vue";

const route = useRoute();
const { $api } = useNuxtApp();

await useDeputies();
const getDeputyByName = useDeputyByName();

// Fetch the session via SSR so meta tags have data during server render
const { data: session, error: sessionError } = await useAsyncData(
  () => `session-${route.params.code}`,
  () => $api.getSessionByCode(route.params.code),
  { getCachedData: getCachedPayload },
);
if (sessionError.value || !session.value) {
  throw createError({ statusCode: 404, statusMessage: 'Sesión no encontrada', fatal: true });
}

// Speeches + initiative titles for the agenda (blocking too: the timeline and
// counts feed the SSR meta). Individual initiative lookups may fail — the
// section then falls back to the bare reference code.
const { data: details } = await useAsyncData(
  () => `session-details-${route.params.code}`,
  async () => {
    const current = session.value;
    const [speechesResponse, initiatives] = await Promise.all([
      $api.getSpeeches({ session: current.id, per_page: -1 }),
      Promise.all(
        [...new Set(current.references)].map((reference) =>
          $api.getInitiativeByReference(reference).catch(() => null)
        )
      ),
    ]);
    const initiativesByRef = {};
    for (const initiative of initiatives) {
      if (!initiative) continue;
      initiativesByRef[initiative.reference] = {
        id: initiative.id,
        title: initiative.title,
        type: initiative.initiative_type_alt,
      };
    }
    return { speeches: speechesResponse.speeches ?? [], initiativesByRef };
  },
  { getCachedData: getCachedPayload },
);

const initiativesByRef = computed(() => details.value?.initiativesByRef ?? {});

// Timeline: `order` restarts per debate, so speeches group by their exact
// reference-set (a joint debate shares one set); sections follow agenda order
// (first appearance of the set's references in session.references).
const debates = computed(() => {
  const groups = new Map();
  for (const speech of details.value?.speeches ?? []) {
    const key = JSON.stringify(speech.references);
    if (!groups.has(key)) {
      groups.set(key, { key, references: speech.references, speeches: [] });
    }
    groups.get(key).speeches.push(speech);
  }
  const agendaIndex = (references) =>
    Math.min(
      ...references.map((reference) => {
        const index = session.value.references.indexOf(reference);
        return index === -1 ? Infinity : index;
      })
    );
  return [...groups.values()]
    .map((group) => ({
      ...group,
      speeches: [...group.speeches].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .sort((a, b) => agendaIndex(a.references) - agendaIndex(b.references));
});

// Unique speakers in order of first intervention; deputies link to their profile
const speakers = computed(() => {
  const seen = new Map();
  for (const speech of details.value?.speeches ?? []) {
    if (!speech.speaker || seen.has(speech.speaker)) continue;
    seen.set(speech.speaker, {
      name: speech.speaker,
      group: speech.group,
      role: speech.role,
      deputy: getDeputyByName(speech.speaker),
    });
  }
  return [...seen.values()];
});

const formattedDate = computed(() => formatDateInt(session.value?.date));

const pdfUrl = computed(() =>
  session.value?.session_link
    ? `https://www.congreso.es${session.value.session_link}`
    : null
);

// Official Congress page for the sitting (the audiovisual detail view).
// Needs codSesion + codOrgano + fechaSesion + legislature; the organ code is
// only stored inside the video URL path (…/leg15/400/…), so no video → no link.
const congressUrl = computed(() => {
  const current = session.value;
  const organ = current?.video_link?.match(/\/leg\d+\/(\d+)\//)?.[1];
  const raw = String(current?.date ?? '');
  if (!current?.congress_session_id || !current.legislature || !organ || raw.length !== 8) {
    return null;
  }
  const fecha = `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`;
  return (
    'https://app.congreso.es/AudiovisualCongreso/audiovisualdetalledisponible' +
    `?codSesion=${current.congress_session_id}&codOrgano=${organ}` +
    `&fechaSesion=${encodeURIComponent(fecha)}&idLegislaturaElegida=${current.legislature}`
  );
});

// SSR-ready meta — noindex while the feature is dev-only (like buscar-intervenciones)
const sessionTitle = `${session.value.name} · ${formattedDate.value}`;
const sessionDescription = `Sesión ${session.value.code} del Congreso de los Diputados: ${details.value?.speeches.length ?? 0} intervenciones sobre ${session.value.references.length} iniciativas.`;
useSeoMeta({
  title: sessionTitle,
  ogTitle: sessionTitle,
  description: sessionDescription,
  ogDescription: sessionDescription,
  ogType: 'article',
  robots: 'noindex, follow',
});

defineOgImage('Session', {
  name: session.value.name ?? '',
  date: formattedDate.value,
  code: session.value.code ?? '',
  speechesCount: details.value?.speeches.length ?? 0,
  referencesCount: session.value.references.length,
});
</script>

<style lang="scss" scoped>
.c-session {
  h2 {
    margin-bottom: 32px;
  }

  &__info {
    margin-top: 0px;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: rem($spacer-unit);
  }

  &__pdf-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  &__video video {
    width: 100%;
    max-height: rem(480px);
    background-color: $black;
  }

  &__speakers {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__speaker {
    display: flex;
    flex-direction: column;
    margin-bottom: rem($spacer-unit);

    // suppress the global li::before middot from 04_base/_base__lists.scss
    &::before {
      content: none;
    }
  }

  &__speaker-name {
    @include tbody2;

    color: $secondary-dark;

    &--linked:hover {
      text-decoration: underline;
    }
  }

  &__speaker-meta {
    @include overline;

    color: $secondary-medium;
  }
}
</style>
