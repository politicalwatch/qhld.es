<template>
  <div v-if="loaded" class="c-topic">
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
          <h3 class="c-topic__header__stat">{{ getTopicStat(topic) }}</h3>
          <h4 class="c-topic__header__stat u-uppercase">
            iniciativas vinculadas
          </h4>
        </div>
        <div class="c-topic__header__column u-hide u-block@sm">
          <p class="c-topic__header__description">{{ topic.description[0] }}</p>
          <h6 class="u-uppercase c-topic__header__author">
            <a :href="credits[topic.id].url" target="_blank"
              ><icon icon="mdi:camera" />Unsplash:
              {{ credits[topic.id].name }}</a
            >
          </h6>
        </div>
      </div>
    </div>

    <div id="topic" class="o-container o-section">
      <div class="u-padding-top-2" v-if="deputies.length > 0">
        <h2 class="u-uppercase u-margin-bottom-2 c-topic__title">
          Frecuencia de las iniciativas
        </h2>
        <FrequencyChart
          :topicsStyles="styles"
          :topic="topic"
          :dataset="topicsByWeek"
          :aggreagatedDataset="allTopicsByWeek"
          @update:showComparativeMode="getAllTopicsByWeek()"
          v-if="topicsByWeek != null"
        />
      </div>
      <div class="u-padding-top-2" v-if="deputies.length">
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
      <div class="u-padding-top-4" v-if="latestInitiatives">
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
    </div>
    <save-alert
      v-if="use_alerts"
      :searchparams="{ topic: topic.name }"
      :text="topic.name"
    />
  </div>
  <div v-else class="o-container o-section u-margin-bottom-10">
    <loader title="Cargando datos" subtitle="Puede llevar unos segundos" />
  </div>
</template>

<script setup>
definePageMeta({ name: 'topic' });
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

import Results from "@/components/Results.vue";
import CardGrid from "@/components/CardGrid.vue";
import Loader from "@/components/Loader.vue";
import SaveAlert from "@/components/SaveAlert.vue";
import FrequencyChart from "@/components/FrequencyChart.vue";
import api from "@/api";
import config from "@/config";
import { useParliamentStore } from "@/stores/parliament";
import { TOPICS_WITH_IMAGE, topicImageSrc } from "@/composables/useTopicImage.js";

const router = useRouter();
const route = useRoute();
const store = useParliamentStore();

await useAsyncData('deputies', () => store.getDeputies(), {
  getCachedData: (key, nuxtApp) =>
    store.allDeputies.length ? store.allDeputies : nuxtApp.payload.data[key],
});

const use_alerts = config.USE_ALERTS;
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

const topic = ref(null);
const deputies = ref([]);
const latestInitiatives = ref(null);
const topicsByWeek = ref(null);
const allTopicsByWeek = ref(null);
const loaded = ref(false);
const errors = ref([]);
const stats = ref(null);

const headTitle = computed(() => {
  return topic.value?.name
    ? `${topic.value.name} - Qué hacen los diputados`
    : "Qué hacen los diputados";
});

const hasImage = computed(() => topic.value ? TOPICS_WITH_IMAGE.has(topic.value.id) : false);

useHead({
  title: headTitle,
});

const getTopic = () => {
  api
    .getTopic(route.params.id)
    .then((response) => {
      topic.value = response;
      getLatestInitiatives(topic.value.name);
      getDeputiesRanking(topic.value.name);
      getTopicsByWeek(topic.value.name);
    })
    .catch((error) => {
      errors.value = error;
      router.push({ name: "Page404", params: { 0: "404" } });
    });
};

const getDeputiesRanking = (topic) => {
  api
    .getDeputiesRanking(topic, 6)
    .then((response) => {
      const deputies_ranking = response;
      deputies_ranking.forEach((d) => {
        let deputy = store.getDeputyByName(d.name);
        deputy.footprint = d.score;
        deputies.value.push(deputy);
      });
      loaded.value = true;
    })
    .catch((error) => {
      errors.value.push(error);
      console.log(error);
    });
};

const getLatestInitiatives = (topic) => {
  api
    .getInitiatives({ topic: topic, per_page: 6 })
    .then((response) => {
      if (response.initiatives) latestInitiatives.value = response.initiatives;
    })
    .catch((error) => errors.value.push(error));
};

const getStats = () => {
  api
    .getOverallStats()
    .then((response) => {
      stats.value = response.topics.politicas;
    })
    .catch((error) => {
      errors.value.push(error);
      router.push({ name: "Page404", params: { 0: "404" } });
    });
};

const getTopicStat = (topic) => {
  for (const stat of stats.value) {
    if (stat["_id"] == topic["name"]) {
      return stat["initiatives"];
    }
  }
};

const getTopicsByWeek = (topic) => {
  api
    .getTopicsByWeek(topic)
    .then((response) => {
      topicsByWeek.value = response.data;
    })
    .catch((error) => errors.value.push(error));
};

const getAllTopicsByWeek = () => {
  api
    .getAllTopicsByWeek(topic)
    .then((response) => {
      allTopicsByWeek.value = response.data;
    })
    .catch((error) => errors.value.push(error));
};

onMounted(() => {
  getTopic();
  getStats();
});
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
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;

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
