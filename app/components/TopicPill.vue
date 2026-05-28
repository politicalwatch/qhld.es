<template>
  <div class="c-topics">
    <a
      v-if="withLinks"
      v-for="(topic, i) in getTopics()"
      :href="`#topic-${i}`"
      class="c-topics__topic c-topics__topic--small"
      :style="`background-color:${topicsStyles[topic]?.color}`"
    >
      {{ topicsStyles[topic]?.shortname }}
    </a>
    <a
      v-else
      v-for="(topic, i) in getTopics()"
      :href="`#topic-${i}`"
      class="c-topics__topic c-topics__topic--small"
      :style="`background-color:${topicsStyles[topic]?.color}`"
    >
      {{ topicsStyles[topic]?.shortname }}
    </a>
    <div
      v-if="limit && limit < topics.length"
      class="c-topics__topic c-topics__topic__small"
      style="background-color: #a3d5c8"
    >
      <icon icon="mdi:dots-horizontal" />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

import * as Utils from "@/utils";

const { topics, topicsStyles, withLinks, limit } = defineProps({
  topics: {
    type: Array,
    default: () => [],
  },
  topicsStyles: {
    type: Object,
  },
  withLinks: {
    type: Boolean,
    default: false,
  },
  limit: {
    type: Number,
  },
});

const getTopics = () => {
  let topicsArray = topics;
  if (limit) {
    topicsArray = topicsArray.slice(0, limit);
  }
  if (topicsStyles && topicsArray.length) {
    return topicsArray.slice().sort(Utils.naturalSort);
  }
  return topicsArray.length ? topicsArray : [];
};
</script>

<style lang="scss" scoped>
.c-topics {
  display: flex;
  flex-wrap: wrap;

  &__topic {
    @include overline;
    @include th6;

    flex: 0 0 auto;
    color: $topic-pill-color;
    padding: rem(calc($spacer-unit / 2));
    text-decoration: none;
    margin: 0 $topic-pill-separator $topic-pill-separator 0;

    &--small {
      margin-left: 1px;
      float: left;
    }

    &:hover {
      text-decoration: underline;
    }
  }
}
.c-icon--type-more {
  svg {
    path {
      fill: $secondary-dark;
    }
  }
}
</style>
