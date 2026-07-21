<template>
  <div class="c-session">
    <div v-if="session" class="o-container o-section u-margin-bottom-10">
      <header class="c-session__head">
        <h1 class="c-session__title">{{ sessionHeading }}</h1>
        <p class="c-session__sub">
          <b>{{ formattedDate }}</b> · {{ session.code }}
        </p>
      </header>

      <div class="c-session__topgrid">
        <div>
          <section v-if="session.video_link" class="c-session__video">
            <video controls preload="metadata" :src="session.video_link" />
          </section>
          <Message v-else type="info" icon>
            El vídeo de esta sesión aún no ha sido publicado por el Congreso.
          </Message>
          <p v-if="session.video_link" class="c-session__vhint">
            Fuente: canal audiovisual del Congreso de los Diputados.
          </p>
        </div>

        <div class="c-session__actions">
          <a
            v-if="pdfUrl"
            :href="pdfUrl"
            class="c-session__a-link c-session__a-link--strong"
            target="_blank"
            title="Descargar el Diario de Sesiones (PDF)"
          >
            Descargar Diario
            <Icon name="mdi:file-download-outline" :size="16" />
          </a>
          <a
            v-if="congressUrl"
            :href="congressUrl"
            class="c-session__a-link"
            target="_blank"
            title="Ver en el Congreso.es"
          >
            Ver en el Congreso
            <Icon name="mdi:open-in-new" :size="14" />
          </a>
        </div>
      </div>

      <div class="c-session__cols">
        <main>
          <h2 class="c-session__sect-h">Orden del día</h2>
          <SessionDebateSection
            v-for="(debate, index) in debates"
            :key="debate.key"
            :debate="debate"
            :initiativesByRef="initiativesByRef"
            :number="index + 1"
          />
        </main>

        <aside>
          <h2 class="c-session__sect-h">Intervinientes</h2>
          <ul class="c-session__people">
            <li
              v-for="speaker in speakers"
              :key="speaker.name"
              class="c-session__person"
              :style="{ '--grp': speaker.color }"
            >
              <span class="c-session__av-ring">
                <UAvatar
                  :src="speaker.image"
                  :alt="speaker.name"
                  :text="speaker.initials"
                  class="c-session__av"
                />
              </span>
              <div class="c-session__person-body">
                <NuxtLink
                  v-if="speaker.deputy"
                  :to="{ name: 'deputy', params: { id: speaker.deputy.id } }"
                  class="c-session__nm c-session__nm--link"
                >
                  {{ speaker.name }}
                </NuxtLink>
                <span v-else class="c-session__nm">{{ speaker.name }}</span>
                <span class="c-session__gr">
                  <template v-if="speaker.group">
                    <i class="c-session__gr-dot" aria-hidden="true" />{{ speaker.group }}
                  </template>
                  <template v-else>{{ speaker.role }}</template>
                </span>
              </div>
            </li>
          </ul>
        </aside>
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

// "Apellido1 Apellido2, Nombre" → "NA" (given initial + first surname).
const initialsFor = (name) => {
  const [surnames = "", given = ""] = name.split(",");
  const first = given.trim()[0] ?? "";
  const last = surnames.trim()[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
};

// Unique speakers, sorted alphabetically by first surname; each carries the
// matched deputy (photo + party colour + profile link) when one exists.
const speakers = computed(() => {
  const seen = new Map();
  for (const speech of details.value?.speeches ?? []) {
    if (!speech.speaker || seen.has(speech.speaker)) continue;
    const deputy = getDeputyByName(speech.speaker);
    seen.set(speech.speaker, {
      name: speech.speaker,
      surname:
        speech.speaker_surname || speech.speaker.split(",")[0] || speech.speaker,
      group: speech.group,
      role: speech.role,
      deputy,
      image: deputy?.image,
      color: partyColor(deputy?.party_name),
      initials: initialsFor(speech.speaker),
    });
  }
  return [...seen.values()].sort((a, b) =>
    a.surname.localeCompare(b.surname, "es")
  );
});

const formattedDate = computed(() => formatDateInt(session.value?.date));

// The code's trailing segment is the sitting number → "Pleno núm. 196".
const sessionHeading = computed(() => {
  const n = session.value?.code?.split("-").pop();
  return n && /^\d+$/.test(n)
    ? `${session.value.name} núm. ${n}`
    : session.value?.name ?? "";
});

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
const sessionTitle = `${sessionHeading.value} · ${formattedDate.value}`;
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
  &__head {
    margin-bottom: rem(28px);
  }

  &__title {
    font-family: $font-headline;
    font-weight: 400;
    font-size: rem(30px);
    line-height: 1.12;
    text-transform: uppercase;
    color: $black;
    margin: 0 0 rem(10px);

    @media (min-width: $sm) {
      font-size: rem(38px);
    }
  }

  &__sub {
    font-size: rem(14px);
    line-height: 1.4;
    color: $secondary-medium;
    font-variant-numeric: tabular-nums;
    margin: 0;

    b {
      font-weight: 500;
      color: $secondary-dark;
    }
  }

  &__topgrid {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(22px);
    align-items: start;
    margin-bottom: rem(44px);

    @media (min-width: $md) {
      grid-template-columns: 1fr rem(300px);
      gap: rem(48px);
    }
  }

  &__video video {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: rem(460px);
    background-color: $black;
  }

  &__vhint {
    font-size: rem(12px);
    color: $secondary-medium;
    margin: rem($spacer-unit) 0 0;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: rem(10px);
    width: fit-content;
  }

  &__a-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: rem(8px);
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: rem(12px);
    color: $secondary-dark;
    background-color: $white;
    border: 1px solid $neutral;
    padding: rem(12px) rem(14px);
    white-space: nowrap;
    text-decoration: none;

    &:hover {
      border-color: var(--color-brand-600);
    }

    &--strong {
      border: 3px solid $black;
      padding: rem(9px) rem(16px);

      &:hover {
        background-color: $black;
        color: $white;
        border-color: $black;
      }
    }
  }

  &__cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(22px);
    align-items: start;

    @media (min-width: $md) {
      grid-template-columns: 1fr rem(300px);
      gap: rem(48px);
    }
  }

  &__sect-h {
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: rem(15px);
    line-height: 1;
    color: $black;
    margin: 0 0 rem(20px);
    padding-bottom: rem(10px);
    border-bottom: 2px solid $black;
  }

  &__people {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__person {
    display: flex;
    align-items: center;
    gap: rem(11px);
    padding: rem(14px) 0;
    border-bottom: 1px solid $neutral;

    // suppress the global li::before middot from 04_base/_base__lists.scss
    &::before {
      content: none;
    }
  }

  &__av-ring {
    flex: none;
    line-height: 0;
    border-radius: 50%;
    border: 2px solid var(--grp, var(--color-brand-500));
  }

  &__av {
    width: rem(40px) !important;
    height: rem(40px) !important;
    font-family: $font-headline;
    font-size: rem(14px);
    background-color: var(--color-brand-50);
    color: $secondary-dark;
  }

  &__person-body {
    min-width: 0;
  }

  &__nm {
    display: block;
    font-family: $font-headline;
    font-size: rem(16px);
    line-height: 1.1;
    color: $black;
    text-decoration: none;

    &--link:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__gr {
    display: flex;
    align-items: center;
    gap: rem(6px);
    margin-top: rem(2px);
    font-size: rem(11.5px);
    line-height: 1.3;
    color: $secondary-medium;
  }

  &__gr-dot {
    width: 8px;
    height: 8px;
    flex: none;
    display: inline-block;
    background-color: var(--grp, var(--color-brand-500));
  }
}
</style>
