<template>
  <div>
    <div
      v-if="parliamentarygroup"
      id="group"
      class="o-container o-section u-margin-bottom-10"
    >
      <ParliamentaryGroupCard
        :parliamentaryGroup="parliamentarygroup"
        layout="large"
      />

      <div class="o-container" v-if="parliamentarygroup">
        <h2 class="u-uppercase u-margin-bottom-4 u-text-center u-text-left@md">
          Radiografía
        </h2>
        <div class="o-grid">
          <div class="o-grid__col u-12 u-4@md">
            <gender
              gender="female"
              :percentage="
                calculatePercentage(
                  parliamentarygroup.composition.gender.female
                )
              "
            />
            <gender
              gender="male"
              :percentage="
                calculatePercentage(parliamentarygroup.composition.gender.male)
              "
            />
          </div>
          <div class="o-grid__col u-12 u-8@md">
            <h3 class="u-uppercase u-text-center u-text-left@md">
              Distribución por edades
            </h3>
            <div class="u-text-center u-text-left@md">
              <span class="u-text-th3"
                >{{
                  calculatePercentage(
                    parliamentarygroup.composition.ages.under35
                  )
                }}%</span
              >
              con menos de 35 años
            </div>
            <div class="u-text-center u-text-left@md">
              <span class="u-text-th3"
                >{{
                  calculatePercentage(
                    parliamentarygroup.composition.ages.between35and49
                  )
                }}%</span
              >
              entre 35 y 49 años
            </div>
            <div class="u-text-center u-text-left@md">
              <span class="u-text-th3"
                >{{
                  calculatePercentage(
                    parliamentarygroup.composition.ages.between50and65
                  )
                }}%</span
              >
              entre 50 y 65 años
            </div>
            <div class="u-text-center u-text-left@md">
              <span class="u-text-th3"
                >{{
                  calculatePercentage(
                    parliamentarygroup.composition.ages.over65
                  )
                }}%</span
              >
              con más de 65 años
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="footprintByTopics.length > 0"
        class="o-container o-section"
        ref="footprintRangeWrapper"
      >
        <h2 class="u-margin-bottom-4 u-uppercase u-text-center u-text-left@md">
          Temáticas destacadas
        </h2>
        <FootprintRangeChart
          :dataset="footprintByTopics"
          :defaultWidth="parentWidth"
          entityType="parliamentarygroup"
          :entityName="parliamentarygroup.name"
          :entityImage="`/assets/gp/${parliamentarygroup.id}.png`"
        />
        <p>
          El tamaño de la barra es relativo al valor máximo del índice parlamentario
          para cada temática.
          <router-link
            :to="{ name: 'footprint' }"
            target="_blank"
            style="text-decoration: none !important"
            >Consulta aquí cómo funciona nuestro índice
            parlamentario.</router-link
          >
        </p>
      </div>

      <div
        v-if="latestInitiatives && latestInitiatives.length"
        class="o-container o-section"
      >
        <div class="c-parliamentarygroup__initiatives-header">
          <h2 class="c-parliamentarygroup__title u-margin-bottom-4 u-uppercase">
            Últimas iniciativas
          </h2>
          <router-link
            v-if="totalInitiatives > initiativesToShow"
            :to="{
              path: '/buscar',
              query: { author: parliamentarygroup.name },
            }"
            class="c-parliamentarygroup__initiatives-more u-border-link u-hide u-block@sm u-uppercase"
            >Ver todas
          </router-link>
        </div>
        <results
          layout="extended"
          :initiatives="latestInitiatives"
          :topicsStyles="topicsStyles"
        />
        <router-link
          v-if="totalInitiatives > initiativesToShow"
          :to="{
            path: '/buscar',
            query: { author: parliamentarygroup.name },
          }"
          class="c-parliamentarygroup__initiatives-more u-border-link u-hide@sm u-uppercase"
          >Ver todas
        </router-link>
      </div>

      <save-alert
        v-if="use_alerts"
        :searchparams="{ author: parliamentarygroup.name }"
        :text="parliamentarygroup.name"
      />

      <h2
        class="u-uppercase u-margin-top-6 u-margin-bottom-4 u-text-center u-text-left@sm"
      >
        Diputados/as
      </h2>
      <CardGrid
        :items="deputies"
        type="deputy"
        layout="medium"
        :extra="undefined"
      />
    </div>

    <div v-else class="o-container o-section u-margin-bottom-10">
      <loader title="Cargando datos" subtitle="Puede llevar unos segundos" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'parliamentarygroup' });
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useElementSize } from "@vueuse/core";

import CardGrid from "@/components/CardGrid.vue";
import ParliamentaryGroupCard from "@/components/ParliamentaryGroupCard.vue";
import Results from "@/components/Results.vue";
import Gender from "@/components/Gender.vue";
import Loader from "@/components/Loader.vue";
import SaveAlert from "@/components/SaveAlert.vue";
import FootprintRangeChart from "@/components/FootprintRangeChart.vue";
import api from "@/api";
import config from "@/config";
import { useParliamentStore } from "@/stores/parliament";

const route = useRoute();
const router = useRouter();

const store = useParliamentStore();
const { allTopics, footprintRange } = storeToRefs(store);

const use_alerts = config.USE_ALERTS;
const topicsStyles = config.STYLES.topics;

const parliamentarygroup = ref(null);
const latestInitiatives = ref([]);
const totalInitiatives = ref(null);
const initiativesToShow = 6;
const errors = ref([]);

const footprintRangeWrapper = ref(null);
const { width: parentWidth } = useElementSize(footprintRangeWrapper);

const headTitle = computed(() => {
  return parliamentarygroup.value?.name
    ? `${parliamentarygroup.value.name} - Qué hacen los diputados`
    : "Qué hacen los diputados";
});

useHead({
  title: headTitle,
});

const deputies = computed(() => {
  if (parliamentarygroup.value) {
    return store
      .getDeputiesByParliamentaryGroup(parliamentarygroup.value.shortname)
      .filter((deputy) => deputy.active)
      .map((deputy) => deputy);
  }
  return [];
});

const footprintByTopics = computed(() => {
  if (parliamentarygroup.value) {
    const parliamentarygroupFootprintByTopic =
      parliamentarygroup.value.footprint_by_topics
        .filter((item) =>
          allTopics.value.some((topic) => topic.name === item.name)
        )
        .filter((item) => item.score > 0)
        .slice(0, 5)
        .map((item) => {
          const topic = footprintRange.value.find(
            (topic) => topic.name === item.name
          );
          return {
            ...item,
            max: topic?.parliamentarygroup?.max.score ?? 100,
            min: topic?.parliamentarygroup?.min.score ?? 0,
          };
        });

    return parliamentarygroupFootprintByTopic;
  }
  return [];
});

const getParliamentaryGroup = () => {
  api
    .getGroup(route.params.id)
    .then((response) => {
      parliamentarygroup.value = response;
      getLatestInitiatives();
    })
    .catch((error) => {
      errors.value.push(error);
      router.push({ name: "Page404", params: { 0: "404" } });
    });
};

const getLatestInitiatives = () => {
  api
    .getInitiatives({
      author: parliamentarygroup.value.name,
      per_page: initiativesToShow,
    })
    .then((response) => {
      if (response.initiatives) {
        latestInitiatives.value = response.initiatives;
        totalInitiatives.value = response.query_meta.total;
      }
    })
    .catch((error) => errors.value.push(error));
};

const calculatePercentage = (value) => {
  return Math.round(
    (value / parliamentarygroup.value.composition.deputies) * 100
  );
};

onMounted(() => {
  getParliamentaryGroup();
});

watch(route, () => {
  getParliamentaryGroup();
});
</script>

<style lang="scss" scoped>
.c-parliamentarygroup {
  &__initiatives-header {
    display: flex;
    justify-content: space-between;
  }

  &__initiatives-more {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  &__title {
    text-align: center;
    width: 100%;

    @media (min-width: $sm) {
      text-align: left;
      width: auto;
    }
  }
}

.alerts-block {
  text-align: left;
  margin-top: -4rem;
  padding-top: 0;
  padding-bottom: 4rem;
  .o-container {
    padding-left: -16px;
  }
}
@media (max-width: 768px) {
  .alerts-block {
    text-align: left;
    margin-top: -2rem;
  }
}
</style>
