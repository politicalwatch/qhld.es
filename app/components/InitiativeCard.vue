<template>
  <div>
    <article class="c-initiative-card" :id="`initiative-card-${initiative.id}`">
      <h2 class="c-initiative-card__title">
        <RouterLink
          v-if="initiative.id"
          :to="{ name: 'initiative', params: { id: initiative.id } }"
          >{{ initiative.title }}</RouterLink
        >
        <span v-else>{{ initiative.title }}</span>
      </h2>
      <div
        class="c-initiative-card__groups-gov-others"
        v-if="hasAuthors(initiative) && extendedLayout"
      >
        <h5 v-if="hasAuthors(initiative)" v-html="getAuthors(initiative)"></h5>
      </div>
      <div
        class="c-initiative-card__deputies"
        v-if="initiative.deputies.length > 0 && extendedLayout"
      >
        <DeputyCard
          v-for="deputyName in getDeputies(initiative)"
          v-bind:key="deputyName"
          :deputy="store.getDeputyByName(deputyName)"
          layout="small"
        />
        <Icon
          v-if="initiative.deputies.length > 10"
          icon="mdi:dots-horizontal"
        />
      </div>
      <RouterLink
        v-if="initiative.id"
        :to="{ name: 'initiative', params: { id: initiative.id } }"
        v-slot="{ href }"
      >
        <a :href="href" target="_blank">
          <TopicPill
            class="c-initiative-card__topics"
            :topicsStyles="topicsStyles"
            :topics="getTopics(initiative)"
            :limit="3"
            v-if="hasTopics(initiative)"
          />
        </a>
      </RouterLink>
      <InitiativeStatus :initiative="initiative" />
    </article>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

import { useParliamentStore } from "@/stores/parliament";
import TopicPill from "@/components/TopicPill.vue";
import InitiativeStatus from "@/components/InitiativeStatus.vue";
import DeputyCard from "@/components/DeputyCard.vue";

const { initiative, topicsStyles, extendedLayout } = defineProps({
  initiative: { type: Object, required: true },
  topicsStyles: { type: Object },
  extendedLayout: { type: Boolean },
});

const store = useParliamentStore();

const __cleansIfItsAGroup = (value) => {
  return value.replace("Grupo Parlamentario", "GP");
};

const hasAuthors = (initiative) => {
  return initiative.authors.length > 0;
};

const getAuthors = (initiative) => {
  return initiative.authors
    .map((author) => `<span>${__cleansIfItsAGroup(author)}</span>`)
    .join("");
};

const getTopics = (initiative) => {
  return initiative["tagged"].map((tagged) => tagged["topics"]).flat();
};

const hasTopics = (initiative) => {
  return initiative["tagged"].length == 0 ||
    initiative["tagged"][0].topics.length == 0
    ? false
    : true;
};

const getDeputies = (initiative) => {
  return initiative.deputies.length < 10
    ? initiative.deputies
    : initiative.deputies.slice(0, 10);
};
</script>

<style scoped lang="scss">
.c-initiative-card {
  @include tbody2;

  padding-bottom: rem($spacer-unit * 3);

  &__topics {
    margin-bottom: rem($spacer-unit);
  }

  &__title {
    font-size: rem(20px);
    line-height: 1.67;
    text-transform: none;
    margin-bottom: rem($spacer-unit);

    a {
      color: $secondary-dark;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__groups-gov-others {
    @include tbody2;
    margin-bottom: rem($spacer-unit);

    h5 {
      display: flex;
      align-items: flex-start;
      flex-direction: column;

      :deep(span) {
        margin-bottom: rem(calc($spacer-unit / 2));
      }
    }
  }

  &__deputies {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: rem($spacer-unit);

    .c-deputy-card__small-layout {
      img {
        margin: 0;
      }
    }
  }

  &__label {
    @include overline;

    margin: 0;
  }
}
</style>
