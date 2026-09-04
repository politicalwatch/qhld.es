<template>
  <div id="home" class="o-container u-margin-bottom-10 u-padding-top-4 c-home">
    <!-- Hero / related initiatives block -->
    <div v-if="home" class="o-grid u-margin-bottom-6 u-border-bottom">
      <div class="o-grid__col u-12">
        <ImageHeader
          :home="home"
          :imageSrcset="getHomeImageSrcset()"
          imageSizes="(min-width: 1000px) 1000px, (min-width: 750px) 750px, 500px"
          :imageSrc="getHomeImage()"
          class="u-margin-bottom-4"
        />

        <div
          class="o-section c-home__initiatives"
          v-if="relatedInitiatives.length"
        >
          <h1 class="u-uppercase c-home__initiatives_title">
            Iniciativas relacionadas
          </h1>
          <a
            class="c-home__more u-border-link u-hide u-block@sm u-uppercase"
            :href="home.RelatedInitiativesSearch"
            >Más iniciativas</a
          >
        </div>
        <Results
          v-if="relatedInitiatives.length"
          :initiatives="relatedInitiatives"
          :topicsStyles="topicsStyles"
        />
      </div>
    </div>

    <div class="o-grid u-margin-bottom-4">
      <div class="o-grid__col u-12">
        <div class="c-home__cta">
          <h2 class="c-home__cta-title">
            Qué hacen los diputados: el Congreso fácil
          </h2>
          <h3 class="c-home__cta-subtitle">
            Consulta todas las iniciativas y sé parte del debate democrático
          </h3>
        </div>
      </div>
      <div class="o-grid__col u-12">
        <InitiativesFormCompact v-model:formData="formData" />
      </div>
    </div>

    <!-- Initiative status chart -->
    <div class="o-grid u-margin-bottom-6">
      <div class="o-grid__col u-12">
        <AsyncSection
          :status="initiativesStatus"
          loading-title="Cargando estado de las iniciativas"
          loading-subtitle="Puede llevar algun tiempo"
          error-message="No se pudo cargar el estado de las iniciativas."
        >
          <InitiativeStatusChart :initiativesStats="initiativesStats" />
        </AsyncSection>
      </div>
    </div>

    <!-- Approved initiatives -->
    <div class="o-grid u-margin-bottom-4">
      <div class="o-grid__col u-12">
        <AsyncSection
          :status="approvedStatus"
          loading-title="Cargando iniciativas legislativas aprobadas"
          loading-subtitle="Puede llevar algun tiempo"
          error-message="No se pudieron cargar las iniciativas aprobadas."
        >
          <ApprovedInitiatives
            v-if="approvedInitiatives.length"
            :initiatives="approvedInitiatives"
          />
        </AsyncSection>
      </div>
    </div>

    <!-- Group thematic priorities -->
    <div class="o-grid u-margin-bottom-4">
      <div class="o-grid__col u-12">
        <AsyncSection
          :status="groupsStatus"
          loading-title="Cargando prioridades temáticas"
          loading-subtitle="Puede llevar algun tiempo"
          error-message="No se pudieron cargar las prioridades temáticas."
        >
          <GroupThematicPriorities v-if="allParliamentaryGroups.length && allTopics.length" />
        </AsyncSection>
      </div>
    </div>

    <!-- Last days activity -->
    <div class="o-grid u-margin-bottom-4">
      <div class="o-grid__col u-12">
        <AsyncSection
          :status="lastdaysStatus"
          loading-title="Cargando evolución de los últimos días"
          loading-subtitle="Puede llevar algun tiempo"
          error-message="No se pudo cargar la actividad reciente."
        >
          <LastActivity v-if="lastdays" :lastdays="lastdays" />
        </AsyncSection>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'home' });
useSeoMeta({
  title: 'Inicio',
  ogTitle: 'Inicio',
  ogType: 'website',
});

import config from "@/config";
import ImageHeader from "@/components/ImageHeader.vue";
import Results from "@/components/Results.vue";
import InitiativesFormCompact from "@/components/InitiativesFormCompact.vue";
import GroupThematicPriorities from "@/components/GroupThematicPriorities.vue";
import ApprovedInitiatives from "@/components/ApprovedInitiatives.vue";
import InitiativeStatusChart from "@/components/InitiativeStatusChart.vue";
import LastActivity from "@/components/LastActivity.vue";
import AsyncSection from "@/components/AsyncSection.vue";

const { $api } = useNuxtApp();
const topicsStyles = config.STYLES.topics;

// Reference data — blocking SSR so GroupThematicPriorities has data immediately
const { data: allParliamentaryGroups, status: groupsStatus } = await useParliamentaryGroups();
const { data: allTopics } = await useTopics();
await Promise.all([useDeputies(), useFootprintRange()]);

const formData = ref({ topic: '', author: '', page: 1 });

// ── Lazy client-side fetches ────────────────────────────────────────────────

// Home block + related initiatives (combined to avoid a waterfall)
const { data: homeBlock } = useAsyncData(
  'home-block',
  async () => {
    const homeObj = await $api.getHome();
    if (!homeObj) return { home: null, relatedInitiatives: [] };

    // Parse the flat Initiative1..N fields into a RelatedInitiativesIds array
    if (homeObj.RelatedInitiativesIds === undefined) {
      const RELATED = 6;
      homeObj.RelatedInitiativesIds = [...Array(RELATED).keys()]
        .map((i) => homeObj[`Initiative${i + 1}`])
        .filter(Boolean);
    }

    const relatedInitiatives = await Promise.all(
      homeObj.RelatedInitiativesIds.map((id) => $api.getInitiative(id))
    );
    return { home: homeObj, relatedInitiatives };
  },
  { lazy: true, server: false, default: () => ({ home: null, relatedInitiatives: [] }) }
);

const home = computed(() => homeBlock.value.home);
const relatedInitiatives = computed(() => homeBlock.value.relatedInitiatives);

const getHomeImageSrcset = () => {
  if (!home.value?.Image) return null;
  return [
    `${$api.getHomeResourceUrl(home.value.Image.formats.small.url)} 500w`,
    `${$api.getHomeResourceUrl(home.value.Image.formats.medium.url)} 750w`,
    `${$api.getHomeResourceUrl(home.value.Image.formats.large.url)} 1000w`,
  ].join(', ');
};
const getHomeImage = () =>
  home.value?.Image
    ? $api.getHomeResourceUrl(home.value.Image.formats.large.url)
    : null;

// Legislative-type initiative lists (approved, in-process, rejected)
const legislativeTypeNames = [
  'Iniciativa legislativa popular',
  'Proyecto de ley',
  'Proposición de ley de Grupos Parlamentarios del Congreso',
  'Proposición de ley de Diputados',
  'Proposición de ley del Senado',
  'Proposición de ley de Comunidades y Ciudades Autónomas',
  'Propuesta de reforma de Estatuto de Autonomía',
  'Real Decreto-Ley',
  'Real Decreto legislativo en desarrollo de Ley de Bases',
  'Real Decreto legislativo que aprueba texto refundido',
];
const per_page = 1000;

const { data: approvedInitiatives, status: approvedStatus } = useAsyncData(
  'home-approved',
  async () => {
    const [approvedResp, ratifiedResp] = await Promise.all([
      $api.getInitiatives({ per_page, type: legislativeTypeNames, status: 'Aprobada' }),
      $api.getInitiatives({ per_page, type: 'Real Decreto-Ley', status: 'Convalidada' }),
    ]);
    return [
      ...(approvedResp.initiatives ?? []),
      ...(ratifiedResp.initiatives ?? []),
    ];
  },
  { lazy: true, server: false, default: () => [] }
);

const { data: inProcessInitiatives, status: initiativesStatus } = useAsyncData(
  'home-in-process',
  async () => {
    const resp = await $api.getInitiatives({
      per_page,
      type: legislativeTypeNames,
      status: 'En tramitación',
    });
    return resp.initiatives ?? [];
  },
  { lazy: true, server: false, default: () => [] }
);

const { data: rejectedInitiatives } = useAsyncData(
  'home-rejected',
  async () => {
    const [rejectedResp, notDebatedResp] = await Promise.all([
      $api.getInitiatives({ per_page, type: legislativeTypeNames, status: 'Rechazada' }),
      $api.getInitiatives({ per_page, type: legislativeTypeNames, status: 'No debatida' }),
    ]);
    return [
      ...(rejectedResp.initiatives ?? []),
      ...(notDebatedResp.initiatives ?? []),
    ];
  },
  { lazy: true, server: false, default: () => [] }
);

// Each section gets its own status — no watch, no shared "initiativesLoaded" flag
const initiativesStats = computed(() => ({
  approved: approvedInitiatives.value.length,
  inProcess: inProcessInitiatives.value.length,
  rejected: rejectedInitiatives.value.length,
}));

const { data: lastdays, status: lastdaysStatus } = useAsyncData(
  'home-lastdays',
  () => $api.getLastdaysStats(),
  { lazy: true, server: false, default: () => null }
);
</script>

<style lang="scss" scoped>
.c-home {
  &__cta {
    margin-bottom: 4rem;
  }

  &__cta-title {
    color: $secondary-dark;
    font-size: 2.6rem;
    margin-bottom: 1rem;
    margin-top: 0;
    font-weight: 700;
    text-transform: uppercase;
  }
  &__cta-subtitle {
    color: $secondary-dark;
    opacity: 0.9;
    font-size: 1.6rem;
    font-weight: 200;
    margin-bottom: 2rem;
  }

  &__initiatives {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &_title {
      margin: 0 auto;

      @media (min-width: $sm) {
        margin: 0;
      }
    }
  }
}
</style>
