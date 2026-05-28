<template>
  <div id="home" class="o-container u-margin-bottom-10 u-padding-top-4 c-home">
    <div v-if="home" class="o-grid u-margin-bottom-6 u-border-bottom">
      <div class="o-grid__col u-12">
        <ImageHeader
          :home="home"
          :imageSrcset="getHomeImageSrcset()"
          imageSizes="(min-width: 1000px) 1000px, (min-width: 750px) 750px, 500px"
          :imageSrc="getHomeImage()"
          class="u-margin-bottom-4"
        />

        <loader
          v-if="!homeLoaded"
          title="Cargando datos"
          subtitle="Puede llevar algun tiempo"
        />

        <div
          class="o-section c-home__initiatives"
          v-if="home && relatedInitiatives.length"
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
          v-if="home && relatedInitiatives.length"
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

    <div class="o-grid u-margin-bottom-6">
      <div class="o-grid__col u-12">
        <InitiativeStatusChart
          v-if="initiativesLoaded"
          :initiativesStats="initiativesStats"
        />
        <Loader
          v-else
          title="Cargando estado de las iniciativas"
          subtitle="Puede llevar algun tiempo"
        />
      </div>
    </div>

    <div class="o-grid u-margin-bottom-4">
      <div class="o-grid__col u-12">
        <ApprovedInitiatives
          v-if="approvedInitiatives.length > 0 && initiativesLoaded"
          :initiatives="approvedInitiatives"
        />
        <Loader
          v-else
          title="Cargando iniciativas legislativas aprobadas"
          subtitle="Puede llevar algun tiempo"
        />
      </div>
    </div>

    <div class="o-grid u-margin-bottom-4">
      <div class="o-grid__col u-12">
        <GroupThematicPriorities
          v-if="allParliamentaryGroups.length && allTopics.length"
        />
        <loader
          v-else
          title="Cargando prioridades temáticas"
          subtitle="Puede llevar algun tiempo"
        />
      </div>
    </div>

    <div class="o-grid u-margin-bottom-4">
      <div class="o-grid__col u-12">
        <LastActivity v-if="lastdays" :lastdays="lastdays" />
        <Loader
          v-else
          title="Cargando evolución de los últimos días"
          subtitle="Puede llevar algun tiempo"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'home' });
import { ref, onMounted, watch, computed } from "vue";
import { storeToRefs } from "pinia";

import api from "@/api";
import config from "@/config";
import { useParliamentStore } from "@/stores/parliament";
import ImageHeader from "@/components/ImageHeader.vue";
import Results from "@/components/Results.vue";
import InitiativesFormCompact from "@/components/InitiativesFormCompact.vue";
import GroupThematicPriorities from "@/components/GroupThematicPriorities.vue";
import ApprovedInitiatives from "@/components/ApprovedInitiatives.vue";
import InProcessInitiatives from "@/components/InProcessInitiatives.vue";
import InitiativeStatusChart from "@/components/InitiativeStatusChart.vue";
import LastActivity from "@/components/LastActivity.vue";
import Loader from "@/components/Loader.vue";

const topicsStyles = config.STYLES.topics;
const store = useParliamentStore();
const { allParliamentaryGroups, allTopics } = storeToRefs(store);

const homeLoaded = ref(false);
const initiativesLoaded = ref(false);
const errors = ref(null);

const formData = ref({
  topic: "",
  author: "",
  page: 1,
});

const home = ref(null);
const relatedInitiatives = ref([]);

const approvedInitiatives = ref([]);
const inProcessInitiatives = ref([]);
const rejectedInitiatives = ref([]);
const initiativesStats = computed(() => {
  return {
    approved: approvedInitiatives.value.length,
    inProcess: inProcessInitiatives.value.length,
    rejected: rejectedInitiatives.value.length,
  };
});
const lastdays = ref(null);

const getHome = () => {
  api
    .getHome()
    .then((response) => {
      home.value = response;
      if (home.value) {
        _parseRelatedInitiatives();
        getRelatedInitiatives();
      }
    })
    .catch((error) => (errors.value = error));
};

const getHomeImageSrcset = () => {
  return home.value.Image
    ? `${api.getHomeResourceUrl(home.value.Image.formats.small.url)} 500w, ${api.getHomeResourceUrl(home.value.Image.formats.medium.url)} 750w, ${api.getHomeResourceUrl(home.value.Image.formats.large.url)} 1000w`
    : null;
};
const getHomeImage = () => {
  return home.value.Image
    ? api.getHomeResourceUrl(home.value.Image.formats.large.url)
    : null;
};
const getRelatedInitiatives = () => {
  home.value.RelatedInitiativesIds.forEach((id) => {
    api
      .getInitiative(id, false)
      .then((initiative) => {
        relatedInitiatives.value.push(initiative);
        homeLoaded.value = true;
      })
      .catch((error) => (errors.value = error));
  });
};
const _parseRelatedInitiatives = () => {
  if (home.value.RelatedInitiativesIds !== undefined) {
    return;
  }
  const RELATED_INITIATIVES = 6;
  home.value.RelatedInitiativesIds = [...Array(RELATED_INITIATIVES).keys()]
    .map((el) => el + 1)
    .map((el) => home.value["Initiative" + el])
    .filter((element) => element !== null);
  // for (let i=1; i<=RELATED_INITIATIVES; i++) delete this.home['Initiative'+i];
};

const per_page = 1000;
const legislativeTypeIds = [
  "120",
  "121",
  "122",
  "123",
  "124",
  "125",
  "127",
  "130",
  "131",
  "132",
];
const legislativeTypeNames = [
  "Iniciativa legislativa popular",
  "Proyecto de ley",
  "Proposición de ley de Grupos Parlamentarios del Congreso",
  "Proposición de ley de Diputados",
  "Proposición de ley del Senado",
  "Proposición de ley de Comunidades y Ciudades Autónomas",
  "Propuesta de reforma de Estatuto de Autonomía",
  "Real Decreto-Ley",
  "Real Decreto legislativo en desarrollo de Ley de Bases",
  "Real Decreto legislativo que aprueba texto refundido",
];

const getApprovedInitiatives = () => {
  const newInitiatives = [];

  const paramsApproved = {
    per_page,
    type: legislativeTypeNames,
    status: "Aprobada",
  };

  const paramsRatified = {
    per_page,
    type: "Real Decreto-Ley",
    status: "Convalidada",
  };

  Promise.all([
    api.getInitiatives(paramsApproved),
    api.getInitiatives(paramsRatified),
  ])
    .then((responses) => {
      responses.forEach((response) => {
        newInitiatives.push(...response.initiatives);
      });
      approvedInitiatives.value = newInitiatives;
    })
    .catch((error) => (errors.value = error));
};

const getInProcessInitiatives = () => {
  const params = {
    per_page,
    type: legislativeTypeNames,
    status: "En tramitación",
  };

  api
    .getInitiatives(params)
    .then((response) => (inProcessInitiatives.value = response.initiatives))
    .catch((error) => (errors.value = error));
};

const getRejectedInitiatives = () => {
  const newInitiatives = [];

  const paramsRejected = {
    per_page,
    type: legislativeTypeNames,
    status: "Rechazada",
  };

  const paramsNotDebated = {
    per_page,
    type: legislativeTypeNames,
    status: "No debatida",
  };

  Promise.all([
    api.getInitiatives(paramsRejected),
    api.getInitiatives(paramsNotDebated),
  ])
    .then((responses) => {
      responses.forEach((response) => {
        newInitiatives.push(...response.initiatives);
      });
      rejectedInitiatives.value = newInitiatives;
    })
    .catch((error) => (errors.value = error));
};

const getLastdays = () => {
  api
    .getLastdaysStats()
    .then((response) => (lastdays.value = response))
    .catch((error) => (errors.value = error));
};

onMounted(() => {
  getHome();
  getApprovedInitiatives();
  getInProcessInitiatives();
  getRejectedInitiatives();
  getLastdays();
});

watch(
  () => initiativesStats.value,
  (newValue) => {
    if (newValue.approved && newValue.inProcess && newValue.rejected)
      initiativesLoaded.value = true;
  }
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
