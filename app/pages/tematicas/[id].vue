<template>
  <div v-if="topic" class="c-topic">
    <div class="o-container c-topic__header">
      <NuxtImg
        v-if="hasImage"
        :src="topicImageSrc(topic.id)"
        alt=""
        :width="1600"
        :height="360"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw"
        loading="eager"
        fetchpriority="high"
        class="c-topic__header__bg"
      />
      <div class="c-topic__header__overlay">
        <div class="c-topic__header__column">
          <h1 class="c-topic__header__name u-uppercase">{{ topic.name }}</h1>
          <h3 class="c-topic__header__stat">{{ topicStat }}</h3>
          <h4 class="c-topic__header__stat u-uppercase">
            iniciativas vinculadas
          </h4>
        </div>
        <div class="c-topic__header__column u-hide u-block@sm">
          <p class="c-topic__header__description">{{ topic.description[0] }}</p>
          <h6 class="u-uppercase c-topic__header__author">
            <a :href="credits[topic.id].url" target="_blank"
              ><Icon name="mdi:camera" />Unsplash:
              {{ credits[topic.id].name }}</a
            >
          </h6>
        </div>
      </div>
    </div>

    <div id="topic" class="o-container o-section">
      <!-- Frequency chart + deputies ranking -->
      <AsyncSection
        :status="deputiesStatus"
        loading-title="Cargando datos"
        loading-subtitle="Puede llevar unos segundos"
        error-message="No se pudieron cargar los datos de esta temática."
        class="u-padding-top-2"
      >
        <template v-if="deputies.length > 0">
          <div class="u-padding-top-2">
            <h2 class="u-uppercase u-margin-bottom-2 c-topic__title">
              Frecuencia de las iniciativas
            </h2>
            <FrequencyChart
              v-if="topicsByWeek"
              :topicsStyles="styles"
              :topic="topic"
              :dataset="topicsByWeek"
              :aggreagatedDataset="allTopicsByWeek"
              @update:showComparativeMode="loadAllTopicsByWeek()"
            />
            <Loader
              v-else-if="weeklyStatus === 'pending'"
              title="Cargando gráfico"
              subtitle="Puede llevar unos segundos"
            />
          </div>
          <div class="u-padding-top-2">
            <h2 class="u-uppercase u-margin-bottom-4 c-topic__title">
              En esta temática destacan...
            </h2>
            <CardGrid
              :items="deputies"
              type="deputy"
              layout="large"
              :footprintByTopic="topic.name"
            />
          </div>
        </template>
      </AsyncSection>

      <!-- Latest initiatives -->
      <AsyncSection
        :status="initiativesStatus"
        loading-title="Cargando iniciativas"
        loading-subtitle="Puede llevar unos segundos"
        error-message="No se pudieron cargar las iniciativas."
        class="u-padding-top-4"
      >
        <div v-if="latestInitiatives.length" class="u-padding-top-4">
          <div class="c-topic__initiatives__header">
            <h2 class="u-uppercase c-topic__title">Últimas iniciativas</h2>
            <router-link
              class="u-border-link u-uppercase u-hide u-inline@sm"
              :to="{ path: '/buscar', query: { topic: topic.name } }"
            >
              Ver todas
            </router-link>
          </div>
          <results :initiatives="latestInitiatives" :topicsStyles="styles" />
          <router-link
            class="u-border-link u-uppercase u-hide@sm"
            :to="{ path: '/buscar', query: { topic: topic.name } }"
          >
            Ver todas
          </router-link>
        </div>
      </AsyncSection>
    </div>

    <save-alert
      v-if="use_alerts"
      :searchparams="{ topic: topic.name }"
      :text="topic.name"
    />
  </div>
</template>

<script setup>
definePageMeta({ name: 'topic' });
import { computed } from "vue";
import { useRoute } from "vue-router";

import Results from "@/components/Results.vue";
import CardGrid from "@/components/CardGrid.vue";
import Loader from "@/components/Loader.vue";
import SaveAlert from "@/components/SaveAlert.vue";
import FrequencyChart from "@/components/FrequencyChart.vue";
import AsyncSection from "@/components/AsyncSection.vue";
import config from "@/config";
import { TOPICS_WITH_IMAGE, topicImageSrc } from "@/composables/useTopicImage.js";

const route = useRoute();
const { $api } = useNuxtApp();

// Deputies list needed to enrich the ranking; load blocking-SSR
const { data: allDeputies } = await useDeputies();

// Fetch the main entity via SSR so meta tags have data during server render
const { data: topic, error: topicError } = await useAsyncData(
  () => `topic-${route.params.id}`,
  () => $api.getTopic(route.params.id),
  { getCachedData: getCachedPayload },
);
if (topicError.value || !topic.value) {
  throw createError({ statusCode: 404, statusMessage: 'Temática no encontrada', fatal: true });
}

const { useAlerts: use_alerts } = useRuntimeConfig().public;
const styles = config.STYLES.topics;
const credits = {
  democracia: {
    name: "Arnaud Jaegers",
    url: "https://unsplash.com/photos/IBWJsMObnnU",
  },
  lgtbi: {
    name: "Stavrielana Gontzou",
    url: "https://unsplash.com/photos/u1AYyQzwJ90",
  },
  "energia-y-clima": {
    name: "Kelly Sikkema",
    url: "https://unsplash.com/photos/_whs7FPfkwQ",
  },
  "comercio-internacional": {
    name: "Maxim Hopman",
    url: "https://unsplash.com/photos/fiXLQXAhCfk",
  },
  adicciones: {
    name: "Nastya Dullhiier",
    url: "https://unsplash.com/photos/V8U4zraWnbg",
  },
  "conflictos-y-paz": {
    name: "Антон Дмитриев",
    url: "https://unsplash.com/photos/WcG7DOyrSoM",
  },
  "cooperacion-al-desarrollo": {
    name: "Mathias P.R. Reding",
    url: "https://unsplash.com/photos/yfXhqAW5X0c",
  },
  "derechos-digitales": {
    name: "NASA",
    url: "https://unsplash.com/photos/Q1p7bh3SHj8",
  },
  dependencia: {
    name: "Jack Finnigan",
    url: "https://unsplash.com/photos/M9EctVUPrp4",
  },
  educacion: {
    name: "NeONBRAND",
    url: "https://unsplash.com/photos/zFSo6bnZJTw",
  },
  empleo: {
    name: "Annie Spratt",
    url: "https://unsplash.com/photos/sggw4-qDD54",
  },
  "espana-vaciada": {
    name: "Marita Mones",
    url: "https://unsplash.com/photos/SLoYKtf9fdI",
  },
  fiscalidad: {
    name: "Ibrahim Boran",
    url: "https://unsplash.com/photos/PXnJeZxMuRY",
  },
  "igualdad-de-genero": {
    name: "Katherine Hanlon",
    url: "https://unsplash.com/photos/bHhEJAXyFOg",
  },
  infancia: {
    name: "Erika Giraud",
    url: "https://unsplash.com/photos/4EFeD-VTgu4",
  },
  migraciones: {
    name: "Brad Neathery",
    url: "https://unsplash.com/photos/XrSzacdYbtQ",
  },
  discapacidad: {
    name: "Josh Appel",
    url: "https://unsplash.com/photos/0nkFvdcM-X4",
  },
  mayores: {
    name: "WJ",
    url: "https://unsplash.com/photos/zmMtb3PtsrE",
  },
  "personas-sin-hogar": {
    name: "Clay LeConey",
    url: "https://unsplash.com/photos/Za9K8pNVepw",
  },
  "poblacion-gitana": {
    name: "Quino Al",
    url: "https://unsplash.com/photos/eE-L2twz0Rg",
  },
  "poblacion-reclusa": {
    name: "Emiliano Bar",
    url: "https://unsplash.com/photos/PaKHbtTDqt0",
  },
  "proteccion-social": {
    name: "Ryoji Iwata",
    url: "ihttps://unsplash.com/photos/IBaVuZsJJTo",
  },
  sanidad: {
    name: "Nguyễn Hiệp",
    url: "https://unsplash.com/photos/sTTeaN4wwrU",
  },
  vivienda: {
    name: "Tom Rumble",
    url: "https://unsplash.com/photos/7lvzopTxjOU",
  },
};

const hasImage = computed(() => topic.value ? TOPICS_WITH_IMAGE.has(topic.value.id) : false);

// SSR-ready meta — topic data is available at server render time
const rawDesc = topic.value.description?.[0] ?? '';
const topicDescription = rawDesc.length > 160
  ? rawDesc.slice(0, 160).replace(/\s+\S*$/, '') + '…'
  : rawDesc;
useSeoMeta({
  title: topic.value.name,
  ogTitle: topic.value.name,
  description: topicDescription || `Temática ${topic.value.name}.`,
  ogDescription: topicDescription || `Temática ${topic.value.name}.`,
  ogType: 'website',
});

defineOgImage('Topic', {
  name: topic.value.name,
  description: topicDescription,
  topicId: topic.value.id,
  topicColor: config.STYLES.topics[topic.value.name]?.color ?? '#A3D5C8',
});

// ── Lazy client-side fetches ────────────────────────────────────────────────

// Stats for the header counter (lazy — header shows '' until loaded, then updates)
const { data: stats } = useAsyncData(
  () => `topic-stats-${route.params.id}`,
  async () => (await $api.getOverallStats()).topics?.politicas ?? [],
  { default: () => [] }
);

const topicStat = computed(() => {
  if (!stats.value?.length) return '';
  const found = stats.value.find((s) => s._id === topic.value?.name);
  return found?.initiatives ?? '';
});

// Deputies ranking — enriched with full deputy data from the cached deputies list
const { data: deputies, status: deputiesStatus } = useAsyncData(
  () => `topic-deputies-${route.params.id}`,
  async () => {
    const ranking = await $api.getDeputiesRanking(topic.value.name, 6);
    return ranking
      .map((d) => {
        const deputy = allDeputies.value?.find((dep) => dep.name === d.name);
        if (!deputy) return null;
        return { ...deputy, footprint: d.score };
      })
      .filter(Boolean);
  },
  { lazy: true, server: false, default: () => [] }
);

// Topics-by-week for the frequency chart
const { data: topicsByWeek, status: weeklyStatus } = useAsyncData(
  () => `topic-by-week-${route.params.id}`,
  () => $api.getTopicsByWeek(topic.value.name),
  { lazy: true, server: false, default: () => null }
);

// All-topics-by-week for the comparative chart overlay; only loaded on demand
const { data: allTopicsByWeek, execute: loadAllTopicsByWeek } = useAsyncData(
  'all-topics-by-week',
  () => $api.getAllTopicsByWeek(),
  { lazy: true, server: false, default: () => null, immediate: false }
);

// Latest initiatives
const { data: latestInitiatives, status: initiativesStatus } = useAsyncData(
  () => `topic-initiatives-${route.params.id}`,
  async () => {
    const response = await $api.getInitiatives({
      topic: topic.value.name,
      per_page: 6,
    });
    return response.initiatives ?? [];
  },
  { lazy: true, server: false, default: () => [] }
);
</script>

<style lang="scss">
.c-topic {
  &__header {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 360px;
    padding: 0;

    &__bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    &__overlay {
      position: absolute;
      inset: 0;
      z-index: 1;

      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      padding-top: 64px;
      padding-left: 64px;
      padding-bottom: 32px;
      padding-right: 32px;
      color: $white;

      background-color: #33333340;
    }

    &__column {
      max-width: 460px;
    }

    &__name {
      margin-bottom: 24px;
    }

    &__description {
      margin-bottom: 52px;
    }

    &__author {
      float: right;

      a {
        text-decoration: none;
        color: $white;

        &:hover {
          text-decoration: underline;
        }

        .c-icon {
          margin-right: 8px;

          svg path {
            fill: $white;
          }
        }
      }
    }

    &__stat {
      display: inline-block;
      margin-bottom: 32px;
      margin-right: 8px;
    }
  }

  &__title {
    text-align: center;
    width: 100%;

    @media (min-width: $sm) {
      text-align: left;
      width: auto;
    }
  }

  &__initiatives {
    &__header {
      display: flex;
      justify-content: space-between;
      margin-bottom: rem(64px);
    }
  }

  .c-save-alert {
    margin-bottom: 180px;
  }
}

.c-topic-card__title {
  color: $secondary-dark;
}
.c-topic-card__description {
  color: $secondary-dark;
}
.c-button--outline {
  border: 2px solid $secondary-dark !important;
  color: $secondary-dark !important;
  &:hover {
    color: $yellow !important;
    background: $secondary-dark !important;
  }
}
.alerts-block {
  margin-top: -6rem;
  padding-top: 0;
  padding-bottom: 4rem !important;
}
@media (max-width: 991px) {
  .alerts-block {
    margin-top: -4rem;
    padding-left: 2rem;
  }
}
@media (max-width: 768px) {
  .alerts-block {
    text-align: center;
    padding-left: 0rem;
  }
}
</style>
