<template>
  <div v-if="isTagged()" class="c-topics c-topics--extended" id="tagged">
    <h3 class="c-topics__title u-uppercase">Temáticas destacadas</h3>
    <ul class="c-topics__list">
      <li
        v-for="(topic, i) in getTopics()"
        :key="topic"
        class="c-topics__list-topic"
      >
        <router-link
          :id="`topic-${i}`"
          class="c-topics__topic"
          :style="`background-color:${topicsStyles[topic].color}`"
          :to="{ path: '/buscar', query: paramsData(topic) }"
        >
          {{ topic }}
        </router-link>

        <ul v-if="getSubtopics(topic)" class="c-topics__list-subtopic">
          <li
            v-for="subtopic in getSubtopics(topic)"
            :key="subtopic + ' - ' + topic"
            class="c-topics__subtopic"
          >
            <router-link
              class="c-topics__link"
              :to="{ path: '/buscar', query: paramsData(topic, subtopic) }"
            >
              {{ subtopic }}
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import * as Utils from "@/utils";

const KNOWLEDGEBASE = "politicas";

const { initiative, topicsStyles } = defineProps({
  initiative: {
    type: Object,
    required: true,
  },
  topicsStyles: {
    type: Object,
  },
});

const getTaggedItems = () => {
  return initiative["tagged"].filter(
    (tagged) => tagged["knowledgebase"] == KNOWLEDGEBASE
  );
};

const isTagged = () => {
  return getTaggedItems().some(
    (item) => item.topics.length > 0 || item.tags.length > 0
  );
};

const getTopics = () => {
  let topics = [];
  for (const tagged of getTaggedItems()) {
    topics = topics.concat(tagged["topics"]);
  }
  return topics.slice().sort(Utils.naturalSort);
};

const getTags = () => {
  let tags = [];
  for (const tagged of getTaggedItems()) {
    tags = tags.concat(tagged["tags"]);
  }
  return tags;
};

const getSubtopics = (topic) => {
  const tags = getTags();
  return [
    ...new Set(
      tags.filter((tag) => tag.topic === topic).map((tag) => tag.subtopic)
    ),
  ];
};

const paramsData = (currentTopic, currentSubtopic) => {
  const obj = { topic: currentTopic };
  if (currentSubtopic) obj.subtopics = currentSubtopic;
  return obj;
};
</script>

<style lang="scss" scoped>
.c-topics {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;

  &__topic {
    @include overline;
    @include th6;

    flex: 0 0 auto;
    color: $topic-pill-color;
    padding: rem(math.div($spacer-unit, 2));
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

  &__title {
    margin-bottom: 0;
    padding: 0 0 rem($spacer-unit * 2);
  }

  &--extended {
    display: block;

    .c-topics {
      &__list {

        &-subtopic {
          display: flex;
          flex-wrap: wrap;
          gap: rem($spacer-unit * 0.5);
          margin-top: rem($spacer-unit);

          .c-topics__subtopic {
            &:hover {
              text-decoration: underline;
            }
          }
        }

        &-topic {
          margin-bottom: rem(32px);
        }
      }

      &__subtopic {
        @include overline;
        @include th6;

        padding: 8px;
        background-color: $white;
        display: inline-block;
        text-transform: none;
        flex: 0 auto;

        .c-topics__link {
          color: $secondary-dark;
          text-decoration: none;
        }
      }
    }

    ul {
      margin: 0;
      padding: 0;

      li {
        &::before {
          display: none;
        }
      }
    }
  }
}
</style>
