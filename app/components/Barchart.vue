<template>
  <TransitionGroup v-if="rows" tag="div" class="c-barchart" name="barfade">
    <div class="c-barchart__row" v-for="d in rows" :key="d.name">
      <div class="c-barchart__name u-text-th4 u-uppercase">{{ d.name }}</div>

      <div class="c-barchart__more">
        <RouterLink
          :to="{
            name: 'results',
            params: { data: paramsData(d.name, entity) },
          }"
          class="u-border-link u-uppercase"
        >
          Consultar
        </RouterLink>
      </div>

      <div class="c-barchart__bar">
        <div class="c-barchart__backbar" :style="d.backbarStyle"></div>
        <div class="c-barchart__overbar" :style="d.overbarStyle"></div>
        <div class="c-barchart__score u-text-th3">{{ d.score }}</div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import qs from "qs";

import { useParliamentStore } from "@/stores/parliament";

const {
  result,
  barHeight,
  barGap,
  barColor,
  barBackgroundColor,
  entity,
  entityType,
} = defineProps({
  result: {
    type: Array,
    required: true,
  },
  barHeight: {
    type: Number,
    required: false,
    default: 56,
  },
  barGap: {
    type: Number,
    required: false,
    default: 24,
  },
  barColor: {
    type: String,
    required: false,
    default: "#efca53",
  },
  barBackgroundColor: {
    type: String,
    required: false,
    default: "#f3f3f3",
  },
  entity: {
    type: Object,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
  },
});

const store = useParliamentStore();
const { footprintRange } = storeToRefs(store);

const rows = computed(() => {
  if (!footprintRange.value.length) return [];

  return result.map((d) => {
    const themeMaxFootprint = footprintRange.value.find(
      (footprint) => footprint.name == d.name
    )[entityType].max.score;

    return {
      name: d.name,
      score: d.score,
      backbarStyle: {
        height: `${barHeight}px`,
        backgroundColor: barBackgroundColor,
      },
      overbarStyle: {
        height: `${barHeight}px`,
        width: `${(d.score / themeMaxFootprint) * 100}%`,
        backgroundColor: barColor,
      },
    };
  });
});

const getFieldToSearch = () => {
  if (entityType == "deputy") return "deputy";
  if (entityType == "parliamentarygroup") return "author";
  return "";
};

const paramsData = (topic, entity) => {
  return qs.stringify({
    topic: topic,
    [getFieldToSearch()]: entity["name"],
  });
};
</script>

<style lang="scss" scoped>
.c-barchart {
  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 48px;
    position: relative;
    flex-wrap: wrap;
    margin-bottom: 32px;

    @media (min-width: $sm) {
      flex-wrap: nowrap;
      margin-bottom: 16px;
    }
  }

  &__name {
    margin-right: 6px;
    margin-bottom: 0px !important;
    flex-basis: 20%;
  }

  &__bar {
    flex: 1 1 auto;
    overflow: hidden;
    position: relative;
    flex-basis: 100%;

    @media (min-width: $sm) {
      flex-basis: 70%;
    }
  }

  &__backbar {
    width: 100%;
  }

  &__overbar {
    position: absolute;
    z-index: 9;
    top: 0;
    left: 0;
    transition: width 500ms cubic-bezier(0.59, 0.12, 0.34, 0.95) 350ms;
  }

  &__score {
    position: absolute;
    z-index: 10;
    top: 25%;
    left: 24px;
  }

  &__more {
    margin-left: 6px;

    @media (min-width: $sm) {
      order: 3;
    }
  }
}

/* Animation */
.barfade {
  &-enter-active,
  &-leave-active,
  &-move {
    transition: 350ms cubic-bezier(0.59, 0.12, 0.34, 0.95);
    transition-property: opacity, transform;

    .c-barchart__overbar {
      width: 0 !important;
    }
  }

  &-enter,
  &-leave-to {
    opacity: 0;
    transform: translateX(50px);
  }
}
</style>
