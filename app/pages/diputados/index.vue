<template>
  <div id="deputies" class="o-container o-section u-margin-bottom-10">
    <Callout
      closeId="qhld-birthday"
      :checkClosed="checkCalloutClosedDate"
      :closeCallback="getTodayDate"
    >
      <div v-if="birthdays.length">
        <h3 class="u-uppercase">Hoy es el cumpleaños de...</h3>
        <CardGrid :items="birthdays" type="deputy" layout="large" />
        <p class="u-text-center">
          Puedes consultar el resto de cumpleaños usando nuestro
          <router-link :to="{ name: 'deputies-birthday-search' }">
            buscador.
          </router-link>
        </p>
      </div>
      <div v-else class="c-callout__birthday-message">
        <Icon name="mdi:birthday-cake-outline" size="24" />
        <p class="u-text-center u-margin-0">
          ¡Vaya! Hoy no celebran cumpleaños en el Congreso. Puedes consultar
          nuestro
          <router-link :to="{ name: 'deputies-birthday-search' }">
            buscador de cumpleaños.
          </router-link>
        </p>
      </div>
    </Callout>
    <PageHeader title="Listado de diputados" />
    <DeputiesForm
      :deputies="allDeputies"
      :groups="getGroupsLongNames"
      @setFilters="setFilters"
      :ranking="getRanking"
    />
    <Loader
      v-if="allDeputies.length == 0"
      title="Cargando diputados"
      subtitle="Puede llevar algun tiempo"
    />
    <CardGrid
      :items="getFilteredDeputies"
      type="deputy"
      layout="large"
      :extra="{ footprint: getSelectedFootprint }"
    />
  </div>
</template>

<script setup>
definePageMeta({ name: 'deputies' });
useSeoMeta({
  title: 'Diputados',
  ogTitle: 'Diputados',
  ogType: 'website',
});

import DeputiesForm from "@/components/DeputiesForm.vue";
import PageHeader from "@/components/PageHeader.vue";
import Loader from "@/components/Loader.vue";
import CardGrid from "@/components/CardGrid.vue";
import Callout from "@/components/Callout.vue";

const { data: birthdays } = await useBirthdays();
const [{ data: allDeputies }, { data: allParliamentaryGroups }, { data: allTopics }] =
  await Promise.all([useDeputies(), useParliamentaryGroups(), useTopics()]);

const filters = ref({});

const getGroupsLongNames = computed(() => {
  return allParliamentaryGroups.value.map((group) => group.name || group);
});

const getGroupShortName = (longname) => {
  const group = allParliamentaryGroups.value
    .filter((group) => group["name"] == longname)
    .pop();
  return group["shortname"].toUpperCase();
};

const setFilters = (updatedFilters) => {
  filters.value = updatedFilters;
};

const getFilteredDeputies = computed(() => {
  let filteredDeputies = allDeputies.value;

  if (
    "constituency" in filters.value &&
    filters.value["constituency"] != null
  ) {
    filteredDeputies = filteredDeputies.filter(
      (deputy) => deputy["constituency"] == filters.value["constituency"]
    );
  }

  if ("group" in filters.value && filters.value["group"] != null) {
    filteredDeputies = filteredDeputies.filter(
      (deputy) =>
        deputy["parliamentarygroup"].toUpperCase() ==
        getGroupShortName(filters.value["group"])
    );
  }

  if ("name" in filters.value && filters.value["name"] != null) {
    const regex = new RegExp(".*" + filters.value["name"] + ".*", "i");
    filteredDeputies = filteredDeputies.filter((deputy) =>
      regex.test(deputy["name"])
    );
  }

  if ("footprint" in filters.value && filters.value["footprint"] != undefined) {
    const footprint_sort = filters.value["footprint"];

    const getFootprintScore = (deputy) => {
      const footprint = deputy.footprint_by_topics.find(
        (item) => item.name === footprint_sort
      );
      return footprint ? footprint.score : 0;
    };

    const sortedList = filteredDeputies.sort(
      (a, b) => getFootprintScore(b) - getFootprintScore(a)
    );

    return sortedList;
  }

  return [...filteredDeputies].sort((a, b) => {
    const a_name = prepareForSorting(a.name);
    const b_name = prepareForSorting(b.name);

    return a_name.localeCompare(b_name);
  });
});

const getRanking = computed(() => {
  const ranking = [];
  for (const item of allTopics.value) {
    ranking.push(item.name);
  }

  return ranking;
});

const getSelectedFootprint = computed(() => {
  const footprint_sort = filters.value["footprint"];
  if (footprint_sort == undefined) {
    return "General";
  }
  return footprint_sort;
});

const prepareForSorting = (name) => {
  const clean_name = name
    .toUpperCase()
    .replace("Á", "A")
    .replace("É", "E")
    .replace("Í", "I")
    .replace("Ó", "O")
    .replace("Ú", "U")
    .replace("Ñ", "NZ");

  return clean_name;
};

const checkCalloutClosedDate = () => {
  const savedDate = localStorage.getItem("qhld-birthday-closed");
  if (!savedDate) {
    return false;
  }

  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return savedDate === formattedToday;
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
};
</script>

<style lang="scss" scoped>
.c-callout__birthday-message {
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    margin-right: 10px;
  }
}
</style>
