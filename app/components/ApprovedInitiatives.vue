<template>
  <div class="c-approved-initiatives">
    <h2>{{ initiatives.length }} Iniciativas Legislativas Aprobadas</h2>
    <nav class="c-approved-initiatives__nav">
      <ul class="c-approved-initiatives__nav-items">
        <li
          v-for="(value, key) in initiativeCategories"
          class="c-approved-initiatives__nav-item"
        >
          <button
            class="c-approved-initiatives__nav-item-button"
            @click="changeCategory(key)"
            :disabled="key == selectedCategory"
          >
            <span class="c-approved-initiatives__nav-item-number">{{
              initiativeCategories[key].initiatives.length
            }}</span>
            <span class="c-approved-initiatives__nav-item-name">{{
              value.name
            }}</span>
          </button>
        </li>
      </ul>
    </nav>
    <div class="c-approved-initiatives__content">
      <Results
        v-if="initiativeCategories[selectedCategory].initiatives.length"
        :initiatives="initiativeCategories[selectedCategory].initiatives || []"
        :topicsStyles="topicsStyles"
      />
      <p v-else>No hay iniciativas en esta categoría.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

import config from "@/config";
import Results from "@/components/Results.vue";

const topicsStyles = config.STYLES.topics;

const { initiatives } = defineProps({
  initiatives: {
    type: Array,
    required: true,
  },
});

const selectedCategory = ref("proyectos");
const changeCategory = (category) => {
  selectedCategory.value = category;
};

const initiativeCategories = computed(() => {
  return {
    proyectos: {
      name: "Proyectos de ley",
      initiatives: initiatives.filter(
        (initiative) => initiative.initiative_type_alt === "Proyecto de ley"
      ),
    },
    decretos: {
      name: "Decretos",
      initiatives: initiatives.filter(
        (initiative) => initiative.initiative_type_alt === "Real Decreto-Ley"
      ),
    },
    proposiciones: {
      name: "Proposiciones de ley",
      initiatives: initiatives.filter(
        (initiative) =>
          initiative.initiative_type_alt ===
          "Proposición de ley de Grupos Parlamentarios del Congreso"
      ),
    },
    ilp: {
      name: "Iniciativas legislativas populares",
      initiatives: initiatives.filter(
        (initiative) =>
          initiative.initiative_type_alt === "Iniciativa legislativa popular"
      ),
    },
    otras: {
      name: "Otras ",
      initiatives: initiatives.filter((initiative) =>
        [
          "Proposición de ley de Diputados",
          "Proposición de ley del Senado",
          "Proposición de ley de Comunidades y Ciudades Autónomas",
          "Propuesta de reforma de Estatuto de Autonomía",
          "Real Decreto legislativo en desarrollo de Ley de Bases",
          "Real Decreto legislativo que aprueba texto refundido",
        ].includes(initiative.initiative_type_alt)
      ),
    },
  };
});
</script>

<style lang="scss" scoped>
.c-approved-initiatives {
  h2 {
    text-transform: uppercase;
    margin-bottom: 2rem;
  }

  &__nav {
    margin-bottom: 2rem;
  }

  &__nav-items {
    display: flex;
    flex-wrap: wrap;
    gap: 3rem;
  }

  &__nav-item {
    display: block;
    max-width: 40%;

    @media (min-width: 768px) {
      max-width: fit-content;
    }

    &::before {
      display: none;
    }

    button {
      display: flex;
      align-items: center;
      gap: 1rem;
      background-color: transparent;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      text-transform: uppercase;

      &:disabled {
        color: white;
        background-color: #bab7b6;
        border-radius: 0.5rem;
      }
    }
  }

  &__nav-item-number {
    font-size: 3rem;
    font-weight: 700;
  }

  &__nav-item-name {
    max-width: 8rem;
    font-size: 1rem;
    text-align: left;
  }
}
</style>
