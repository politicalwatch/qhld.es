<template>
  <div class="o-grid c-card_grid">
    <div :class="classes" v-for="item in items" :key="item.id">
      <ParliamentaryGroupCard
        v-if="isParliamentaryGroup()"
        :parliamentaryGroup="item"
        :layout="layout"
      />
      <DeputyCard
        v-if="isDeputy()"
        :deputy="item"
        :layout="layout"
        :footprint="getDeputyExtra()"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

import ParliamentaryGroupCard from "@/components/ParliamentaryGroupCard.vue";
import DeputyCard from "@/components/DeputyCard.vue";

const { items, type, layout, extra } = defineProps({
  items: { type: Array },
  type: { type: String },
  layout: { type: String },
  extra: { type: Object },
});

const isDeputy = () => type == "deputy";
const isParliamentaryGroup = () => type == "parliamentarygroup";
const getDeputyExtra = () => {
  if (extra === undefined) return "General";
  if ("footprint" in extra) {
    return extra["footprint"];
  }
  return "General";
};

const classes = computed(() => {
  return (
    "o-grid__col u-12 u-4@sm c-card_grid__item c-card_grid__item__" +
    type +
    " c-card_grid__" +
    layout
  );
});
</script>

<style lang="scss" scoped>
.c-card_grid {
  min-height: 160px;
  &__item {
    margin-bottom: 32px;

    &__parliamentarygroup {
      &.c-card_grid__medium {
        height: 350px;
        min-width: 350px;
        padding-bottom: 0px;
        position: relative;

        @media (min-width: $sm) {
          height: 0;
          padding-bottom: 33.33333%;
          float: left;
          overflow: hidden;
        }
      }

      &.c-card_grid__small {
        position: relative;
        height: 64px;

        @media (min-width: $sm) {
          overflow: hidden;
        }
      }
    }

    &__deputy {
      &.c-card_grid__large {
        margin-bottom: 6rem;
      }
    }
  }
}
</style>
