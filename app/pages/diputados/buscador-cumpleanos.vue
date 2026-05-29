<template>
  <div id="deputies" class="o-container o-section u-margin-bottom-10">
    <PageHeader title="Buscador de cumpleaños" />
    <DeputiesBirthdayForm @setFilters="setFilters" />
    <Loader
      v-if="allDeputies.length == 0"
      title="Cargando diputados"
      subtitle="Puede llevar algun tiempo"
    />
    <CardGrid
      v-if="getFilteredDeputies.length > 0"
      :items="getFilteredDeputies"
      type="deputy"
      layout="large"
    />
    <p class="u-text-center" v-else>
      No hay diputados que cumplan años ese día.
    </p>
  </div>
</template>

<script setup>
definePageMeta({ name: 'deputies-birthday-search' });
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

import DeputiesBirthdayForm from "@/components/DeputiesBirthdayForm.vue";
import PageHeader from "@/components/PageHeader.vue";
import Loader from "@/components/Loader.vue";
import CardGrid from "@/components/CardGrid.vue";
import { useParliamentStore } from "@/stores/parliament";

const store = useParliamentStore();
const { allDeputies } = storeToRefs(store);

await useAsyncData('deputies', () => store.getDeputies(), {
  getCachedData: (key, nuxtApp) =>
    store.allDeputies.length ? store.allDeputies : nuxtApp.payload.data[key],
});

const filters = ref({});

const setFilters = (updatedFilters) => {
  filters.value = updatedFilters;
};

const getFilteredDeputies = computed(() => {
  let filteredDeputies = allDeputies.value;

  if ("month" in filters.value && filters.value["month"] != null) {
    filteredDeputies = filteredDeputies.filter((deputy) => {
      const birthMonth = new Date(deputy["birthdate"]).getMonth() + 1;
      return birthMonth === parseInt(filters.value["month"]);
    });
  }

  if ("day" in filters.value && filters.value["day"] != null) {
    filteredDeputies = filteredDeputies.filter((deputy) => {
      const birthDay = new Date(deputy["birthdate"]).getDate();
      return birthDay === parseInt(filters.value["day"]);
    });
  }

  return [...filteredDeputies].sort((a, b) => {
    const a_name = prepareForSorting(a.name);
    const b_name = prepareForSorting(b.name);

    return a_name.localeCompare(b_name);
  });
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
