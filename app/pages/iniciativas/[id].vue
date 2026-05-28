<template>
  <div class="c-initiative">
    <div
      v-if="loaded"
      id="initiative"
      class="o-container o-section u-margin-bottom-10"
    >
      <div class="o-grid o-grid--between">
        <div class="o-grid__col u-12 u-8@md">
          <h2>{{ initiative.title }}</h2>
          <div class="o-grid u-margin-bottom-1">
            <div
              class="o-grid__col u-12 u-7@sm u-text-center u-text-left@sm c-initiative__status"
            >
              <InitiativeStatus :initiative="initiative" />
            </div>
            <div
              class="o-grid__col u-12 u-5@sm u-text-left u-text-center u-text-right@sm"
            >
              <ConversationLink
                v-if="showConversation()"
                :id="initiative.id"
                :isAnswer="isAnswer()"
              ></ConversationLink>
              <CongressLink :url="initiative.url"></CongressLink>
            </div>
          </div>

          <div class="o-grid u-padding-top-2 u-margin-bottom-4">
            <div class="o-grid__col o-grid__col--fill">
              <h6 class="u-uppercase">Tipo de acto parlamentario</h6>
              <p class="c-initiative__info">
                {{ initiative.initiative_type_alt }}
              </p>
            </div>
            <div class="o-grid__col u-12 u-3@sm">
              <h6 class="u-uppercase">Referencia</h6>
              <p class="c-initiative__info">{{ initiative.reference }}</p>
            </div>
            <div class="o-grid__col u-12 u-3@sm">
              <h6 class="u-uppercase">Registro</h6>
              <p class="c-initiative__info">
                {{ formattedDate }}
              </p>
            </div>
          </div>

          <TopicsSection
            class="u-hide u-block@md"
            :topicsStyles="styles.topics"
            :initiative="initiative"
          />
        </div>

        <div class="o-grid__col u-12 u-3@md">
          <div class="u-margin-bottom-4">
            <GovernmentCard v-if="isAGovernmentInitiative()" />
            <div v-else-if="isAGroupInitiative()">
              <ParliamentaryGroupCard
                v-for="author in initiative.authors"
                v-bind:key="author"
                :parliamentaryGroup="getGroup(author)"
                layout="small"
              />
            </div>
            <div v-else>
              <OtherAuthorCard
                v-for="author in initiative.authors"
                v-bind:key="author"
                :name="author"
              />
            </div>

            <div class="u-margin-bottom-4"></div>

            <DeputyCard
              v-for="deputyName in initiative.deputies"
              :key="deputyName"
              :deputy="store.getDeputyByName(deputyName)"
              layout="medium"
            />
          </div>
        </div>

        <div class="u-hide@md">
          <TopicsSection
            :topicsStyles="styles.topics"
            :initiative="initiative"
          />
        </div>
      </div>
    </div>
    <div v-else class="o-container o-section u-margin-bottom-10">
      <Loader title="Cargando datos" subtitle="Puede llevar unos segundos" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'initiative' });
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import ParliamentaryGroupCard from "@/components/ParliamentaryGroupCard.vue";
import GovernmentCard from "@/components/GovernmentCard.vue";
import OtherAuthorCard from "@/components/OtherAuthorCard.vue";
import CongressLink from "@/components/CongressLink.vue";
import ConversationLink from "@/components/ConversationLink.vue";
import TopicsSection from "@/components/TopicsSection.vue";
import InitiativeStatus from "@/components/InitiativeStatus.vue";
import DeputyCard from "@/components/DeputyCard.vue";
import Loader from "@/components/Loader.vue";
import api from "@/api";
import config from "@/config";
import { useParliamentStore } from "@/stores/parliament";

import format from "date-fns/format";

const route = useRoute();

const store = useParliamentStore();
const { allParliamentaryGroups, allTopics } = storeToRefs(store);

const styles = config.STYLES;

const initiative = ref({});
const loaded = ref(false);
const errors = ref([]);

const headTitle = computed(() => {
  return initiative.value?.title
    ? `${initiative.value.title} - Qué hacen los diputados`
    : "Qué hacen los diputados";
});

useHead({
  title: headTitle,
});

const dataLoaded = computed(() => {
  return Object.keys(initiative.value).length && allTopics.value.length > 0;
});

const formattedDate = computed(() => {
  return format(new Date(initiative.value.created), "dd/MM/y");
});

const getInitiative = () => {
  api
    .getInitiative(route.params.id)
    .then((response) => {
      initiative.value = response;
      loaded.value = true;
    })
    .catch((error) => {
      errors.value.push(error);
      loaded.value = true;
    });
};

const getGroup = (parliamentary_group) => {
  for (const group of allParliamentaryGroups.value) {
    if (group.name == parliamentary_group) {
      return group;
    }
  }
};

const isAGovernmentInitiative = () => {
  return initiative.value.authors.includes("Gobierno");
};

const isAGroupInitiative = () => {
  if (initiative.value.authors.length == 0) return false;
  else {
    const aPossibleGroup = initiative.value.authors[0];
    for (const group of allParliamentaryGroups.value) {
      if (group.name == aPossibleGroup) return true;
    }
    return false;
  }
};

const showConversation = () => {
  return (
    initiative.value.status == "Respondida" &&
    ["179", "184"].includes(initiative.value.initiative_type)
  );
};

const isAnswer = () => {
  return initiative.value.initiative_type_alt == "Respuesta";
};

onMounted(() => {
  getInitiative();
});

watch(route, () => {
  getInitiative();
});
</script>

<style lang="scss" scoped>
.c-initiative {
  h2 {
    margin-bottom: 32px;
  }

  &__info {
    margin-top: 0px;
  }

  &__status {
    height: 56px;
    padding-top: 16px;
  }
}
</style>
