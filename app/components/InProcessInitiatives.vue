<template>
  <div class="c-in-process-initiatives">
    <h2>Initiativas Legislativas en Proceso</h2>
    <div class="c-in-process-initiatives__content">
      <div
        v-for="initiative in filteredInitiatives"
        :key="initiative.id"
        class="c-in-process-initiatives__initiative"
      >
        <h3>
          <RouterLink
            v-if="initiative.id"
            :to="{ name: 'initiative', params: { id: initiative.id } }"
          >
            {{ showOnlyNCharacters(initiative.title, 140) }}
          </RouterLink>
        </h3>
        <span class="c-in-process-initiatives__initiative-days"
          >{{ daysFromToday(new Date(initiative.created)) }} días</span
        >
      </div>
    </div>
    <div class="c-in-process-initiatives__more">
      <RouterLink
        :to="{
          name: 'results',
          params: {
            data: qs.stringify({
              status: 'En tramitación',
            }),
          },
        }"
        class="u-border-link u-uppercase"
      >
        Ver todas las iniciativas en tramitación
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { differenceInDays } from "date-fns/differenceInDays";
import qs from "qs";

const { initiatives, numInitiatives } = defineProps({
  initiatives: {
    type: Array,
    required: true,
  },
  numInitiatives: {
    type: Number,
    required: false,
    default: 5,
  },
});

const filteredInitiatives = computed(() => {
  return initiatives
    .sort((a, b) => new Date(a.created) - new Date(b.created))
    .slice(0, numInitiatives);
});

const daysFromToday = (date) => {
  return differenceInDays(new Date(), date);
};

const showOnlyNCharacters = (text, maxChars) => {
  if (text.length <= maxChars) return text;
  const words = text.split(" ");
  let result = "";
  for (let word of words) {
    if ((result + word).length > maxChars) break;
    result += (result ? " " : "") + word;
  }
  return result + "…";
};
</script>

<style lang="scss" scoped>
.c-in-process-initiatives {
  h2 {
    text-transform: uppercase;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  &__initiative {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4rem;
    align-items: center;
    h3 {
      font-size: 1.25rem;
      margin-bottom: 0;
      a {
        text-decoration: none;
      }
    }
  }

  &__initiative-days {
    font-weight: 300;
    font-size: 1.25rem;
  }
}
</style>
