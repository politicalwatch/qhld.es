<template>
  <div>
    <div class="c-topic-link">
      <div :class="'u-topic-bg__' + topic.id">
        <!-- <router-link :to="{name: 'topic', params: {id: topic.id }}" :class="'c-topic-link__image-link u-topic-bg__' + topic.id"> -->
        <router-link
          :to="{ name: 'topic', params: { id: topic.id } }"
          class="c-topic-link__image-link"
        >
          <div>
            <h1 class="c-topic-link__name u-uppercase">{{ topic.name }}</h1>
            <h3 class="c-topic-link__name">{{ stat }}</h3>
            <h4 class="c-topic-link__name u-uppercase">
              iniciativas vinculadas
            </h4>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const { topic, stat, color, image } = defineProps({
  topic: {
    type: Object,
    required: true,
  },
  stat: {
    type: Number,
    default: 0,
  },
  color: {
    type: String,
    default: "#000",
  },
  image: {
    type: String,
  },
});

const topicImage = computed(() => {
  return `/img/topics/${image}` || `/img/topics/${topic?.icon}`;
});
</script>

<style lang="scss" scoped>
.c-topic-link {
  &__image-link {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem($spacer-unit * 2);
    margin-bottom: rem($spacer-unit * 2);
    transition: transform 0.3s ease;
    background-color: #33333340;
    align-items: flex-end;
    justify-content: flex-start;

    &::after {
      content: "";
      display: block;
      padding-bottom: 100%;
    }

    h3,
    h4 {
      display: inline-block;
      margin-bottom: 0;
    }

    h3 {
      margin-right: 8px;
    }
  }

  &__image {
    max-width: 80%;
    max-height: 80%;
  }

  a {
    text-decoration: none;

    .c-topic-link__name {
      color: $white;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
