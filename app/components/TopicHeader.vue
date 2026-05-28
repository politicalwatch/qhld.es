<template>
  <div :style="`background-color: ${getColor(topic)}`" class="c-topic-card">
    <div class="o-container">
      <div class="o-grid o-grid--reverse">
        <div class="o-grid__col u-12 u-3@sm u-offset-1@sm">
          <img
            :src="`/img/topics/${getIcon(topic)}`"
            :alt="`Imagen de ${topic.name}`"
            class="c-topic-card__image"
          />
        </div>
        <div class="o-grid__col u-12 u-8@sm">
          <h1 class="c-topic-card__title">{{ topic.name }}</h1>
          <div class="c-topic-card__description">
            <p v-for="d in topic.description" :key="d">
              {{ d }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { topic, topicsStyles } = defineProps({
  topic: {
    type: Object,
    required: true,
  },
  topicsStyles: {
    type: Object,
    default: () => ({}),
  },
});

const getIcon = (topic) => {
  return topicsStyles.hasOwnProperty(topic.name) &&
    topicsStyles[topic.name].image
    ? topicsStyles[topic.name].image
    : topic.icon;
};

const getColor = (topic) => {
  return topicsStyles.hasOwnProperty(topic.name) &&
    topicsStyles[topic.name].color
    ? topicsStyles[topic.name].color
    : "#000";
};
</script>

<style lang="scss" scoped>
.c-topic-card {
  padding: rem($spacer-unit * 8) rem($spacer-unit * 4);
  color: $white;

  @media (min-width: $md) {
    margin-bottom: rem($spacer-unit * 4);
  }

  &__image {
    width: 100%;
    display: block;
    margin-bottom: rem($spacer-unit * 4);
    max-height: 150px;
  }

  &__title {
    @include th2;

    text-transform: uppercase;
    text-align: center;

    @media (min-width: $sm) {
      text-align: left;
    }
  }

  &__description {
    @include subtitle;

    text-align: center;

    @media (min-width: $sm) {
      text-align: left;
    }
  }
}
</style>
