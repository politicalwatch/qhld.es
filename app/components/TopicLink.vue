<template>
  <div>
    <div class="c-topic-link">
      <router-link
        :to="{ name: 'topic', params: { id: topic.id } }"
        class="c-topic-link__image-link"
      >
        <NuxtImg
          v-if="hasImage"
          :src="topicImageSrc(topic.id)"
          alt=""
          :width="400"
          :height="400"
          sizes="sm:50vw md:25vw"
          loading="lazy"
          class="c-topic-link__bg"
        />
        <div class="c-topic-link__content">
          <h1 class="c-topic-link__name u-uppercase">{{ topic.name }}</h1>
          <h3 class="c-topic-link__name">{{ stat }}</h3>
          <h4 class="c-topic-link__name u-uppercase">
            iniciativas vinculadas
          </h4>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { TOPICS_WITH_IMAGE, topicImageSrc } from "@/composables/useTopicImage.js";

const { topic, stat } = defineProps({
  topic: {
    type: Object,
    required: true,
  },
  stat: {
    type: Number,
    default: 0,
  },
});

const hasImage = computed(() => TOPICS_WITH_IMAGE.has(topic.id));
</script>

<style lang="scss" scoped>
.c-topic-link {
  &__image-link {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: rem($spacer-unit * 2);
    margin-bottom: rem($spacer-unit * 2);
    transition: transform 0.3s ease;
    text-decoration: none;

    // dark tint sits above the image, below the text
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background-color: #33333340;
      z-index: 1;
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

  // full-bleed background image
  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  // text layer on top of tint
  &__content {
    position: relative;
    z-index: 2;
  }

  .c-topic-link__name {
    color: $white;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
