<template>
  <div class="o-section c-last-activity">
    <h2 class="u-uppercase">Iniciativas en los últimos 15 días</h2>
    <h4 class="u-uppercase u-hide u-inline@sm">
      Últimas iniciativas presentadas en el Congreso de los Diputados
    </h4>
    <div v-for="type in types" class="c-last-activity__stat">
      <h1 class="c-last-activity__number">
        <icon :icon="getIcon(type)" :color="getIconColor(type)" />{{
          lastdays[type].initiatives
        }}
      </h1>
      <h4 class="c-last-activity__type u-uppercase">{{ titles[type] }}</h4>
      <span class="c-last-activity__description">{{ descriptions[type] }}</span>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { lastdays } = defineProps({
  lastdays: {
    type: Object,
    required: true,
  },
});

const getIcon = (type) => {
  const map = {
    up: "mdi:arrow-up-bold",
    down: "mdi:arrow-down-bold",
    equal: "mdi:equal",
  };
  return map[lastdays[type].trend];
};

const getIconColor = (type) => {
  const map = {
    up: "#4DCA7F",
    down: "#E50047",
    equal: "#1D1D1B",
  };
  return map[lastdays[type].trend];
};

const types = ["legislative", "orientation", "oversight"];
const titles = {
  legislative: "legislativas",
  orientation: "de orientación política",
  oversight: "de control",
};
const descriptions = {
  legislative:
    "Los diputados y diputadas tienen la capacidad de proponer y aprobar leyes, así como de ratificar y convalidar leyes a propuesta del Gobierno.",
  orientation:
    "Los grupos parlamentarios orientan políticamente al Gobierno a través de la aprobación de iniciativas, como Proposiciones No de Ley.",
  oversight:
    "Los grupos parlamentarios controlan la labor del Gobierno a través de preguntas y de la solicitud de informes y comparecencias.",
};
</script>

<style lang="scss" scoped>
.c-last-activity {
  h1 {
    text-align: center;

    @media (min-width: $sm) {
      text-align: left;
    }
  }

  &__stat {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-bottom: 4rem;

    @media (min-width: $sm) {
      flex-wrap: nowrap;
    }

    &:first-of-type {
      margin-top: 4rem;
    }
  }

  &__number {
    font-size: rem(64px);
    line-height: rem(80px);
    width: 100%;
    display: flex;
    align-items: center;

    @media (min-width: $sm) {
      width: auto;
    }

    .c-icon svg {
      margin-bottom: 14px;
    }
  }

  &__type {
    width: 100%;
    text-align: center;

    @media (min-width: $sm) {
      text-align: left;
      width: auto;
    }
  }

  &__description {
    width: 100%;
    text-align: center;

    @media (min-width: $sm) {
      text-align: left;
      max-width: 544px;
      width: auto;
    }
  }
}
</style>
