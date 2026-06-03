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

      <!-- Latest initiatives (lazy-loaded) -->
      <AsyncSection
        :status="initiativesStatus"
        loading-title="Cargando iniciativas"
        loading-subtitle="Puede llevar unos segundos"
        error-message="No se pudieron cargar las iniciativas."
        class="o-container o-section"
      >
        <div v-if="latestInitiatives.length" class="o-container o-section">
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
      </AsyncSection>

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
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useElementSize } from "@vueuse/core";

import CardGrid from "@/components/CardGrid.vue";
import ParliamentaryGroupCard from "@/components/ParliamentaryGroupCard.vue";
import Results from "@/components/Results.vue";
import Gender from "@/components/Gender.vue";
import Loader from "@/components/Loader.vue";
import SaveAlert from "@/components/SaveAlert.vue";
import FootprintRangeChart from "@/components/FootprintRangeChart.vue";
import AsyncSection from "@/components/AsyncSection.vue";
import config from "@/config";

const route = useRoute();
const { $api } = useNuxtApp();

// Reference data (blocking SSR)
const { data: allTopics } = await useTopics();
const { data: allDeputies } = await useDeputies();
const { data: footprintRange } = await useFootprintRange();

// Fetch the main entity via SSR so meta tags have data during server render
const { data: parliamentarygroup, error: groupError } = await useAsyncData(
  () => `group-${route.params.id}`,
  () => $api.getGroup(route.params.id),
  { getCachedData: getCachedPayload },
);
if (groupError.value || !parliamentarygroup.value) {
  throw createError({ statusCode: 404, statusMessage: 'Grupo parlamentario no encontrado', fatal: true });
}

const use_alerts = config.USE_ALERTS;
const topicsStyles = config.STYLES.topics;
const initiativesToShow = 6;

const footprintRangeWrapper = ref(null);
const { width: parentWidth } = useElementSize(footprintRangeWrapper);

const deputies = computed(() => {
  if (!parliamentarygroup.value) return [];
  return allDeputies.value
    .filter(
      (d) =>
        d.parliamentarygroup === parliamentarygroup.value.shortname && d.active
    );
});

const footprintByTopics = computed(() => {
  if (!parliamentarygroup.value) return [];
  return parliamentarygroup.value.footprint_by_topics
    .filter((item) => allTopics.value.some((t) => t.name === item.name))
    .filter((item) => item.score > 0)
    .slice(0, 5)
    .map((item) => {
      const topic = footprintRange.value.find((t) => t.name === item.name);
      return {
        ...item,
        max: topic?.parliamentarygroup?.max.score ?? 100,
        min: topic?.parliamentarygroup?.min.score ?? 0,
      };
    });
});

// SSR-ready meta
const deputyCount = parliamentarygroup.value.composition?.deputies ?? 0;
useSeoMeta({
  title: parliamentarygroup.value.name,
  ogTitle: parliamentarygroup.value.name,
  description: `Grupo parlamentario ${parliamentarygroup.value.name}. ${deputyCount} diputados/as. Consulta su actividad en el Congreso de los Diputados.`,
  ogDescription: `Grupo parlamentario ${parliamentarygroup.value.name}. ${deputyCount} diputados/as. Consulta su actividad en el Congreso de los Diputados.`,
  ogType: 'website',
});

defineOgImage('Group', {
  name: parliamentarygroup.value.name,
  groupId: parliamentarygroup.value.id,
  deputyCount,
});

const calculatePercentage = (value) =>
  Math.round((value / parliamentarygroup.value.composition.deputies) * 100);

// ── Lazy client-side fetch ───────────────────────────────────────────────────

const { data: initiativesData, status: initiativesStatus } = useAsyncData(
  () => `group-initiatives-${route.params.id}`,
  async () => {
    const response = await $api.getInitiatives({
      author: parliamentarygroup.value.name,
      per_page: initiativesToShow,
    });
    return {
      initiatives: response.initiatives ?? [],
      total: response.query_meta?.total ?? 0,
    };
  },
  { lazy: true, server: false, default: () => ({ initiatives: [], total: 0 }) }
);

const latestInitiatives = computed(() => initiativesData.value.initiatives);
const totalInitiatives = computed(() => initiativesData.value.total);
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
