<template>
  <div
    id="parliamentarygroups"
    class="o-container o-section u-margin-bottom-10"
  >
    <page-header title="Grupos parlamentarios" />
    <loader
      v-if="!isLoaded()"
      title="Cargando grupos parlamentarios"
      subtitle="Puede llevar algun tiempo"
    />
    <CardGrid
      :items="allParliamentaryGroups"
      type="parliamentarygroup"
      layout="medium"
    />
  </div>
</template>

<script setup>
definePageMeta({ name: 'parliamentarygroups' });
import CardGrid from "@/components/CardGrid.vue";
import Loader from "@/components/Loader.vue";
import PageHeader from "@/components/PageHeader.vue";

const { data: allParliamentaryGroups } = await useParliamentaryGroups();

const isLoaded = () => allParliamentaryGroups.value?.length > 0;
</script>
