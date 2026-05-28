<template>
  <div
    v-if="loaded"
    class="o-container o-section u-padding-bottom-10 u-margin-bottom-10"
  >
    <page-header title="Temáticas" />
    <div class="o-grid" v-if="stats">
      <div
        class="o-grid__col u-12 u-4@sm"
        v-for="topic in getTopics()"
        :key="topic.id"
      >
        <topic-link
          path="topics"
          :topic="topic"
          :image="topicsStyles[topic.name].image"
          :color="topicsStyles[topic.name].color"
          :stat="topic.initiatives"
        />
      </div>
    </div>
  </div>
  <div v-else class="o-container o-section u-margin-bottom-10">
    <loader title="Cargando datos" subtitle="Puede llevar unos segundos" />
  </div>
</template>

<script setup>
definePageMeta({ name: 'topics' });
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import api from "@/api";
import config from "@/config";
import PageHeader from "@/components/PageHeader.vue";
import TopicLink from "@/components/TopicLink.vue";
import Loader from "@/components/Loader.vue";
import { useParliamentStore } from "@/stores/parliament";

const router = useRouter();

const store = useParliamentStore();
const { allTopics } = storeToRefs(store);

const topicsStyles = config.STYLES.topics;
const stats = ref(null);
const loaded = ref(false);

const getTopics = () => {
  let topics = [];
  for (const topic of allTopics.value) {
    topic.initiatives = getTopicStat(topic);
    topics.push(topic);
  }
  return topics.sort(function (a, b) {
    return b.initiatives - a.initiatives;
  });
};

const getTopicStat = (topic) => {
  for (const stat of stats.value) {
    if (stat["_id"] == topic.name) {
      return stat["initiatives"];
    }
  }
};

onMounted(() => {
  api
    .getOverallStats()
    .then((response) => {
      stats.value = response.topics.politicas;
      loaded.value = true;
    })
    .catch((error) => {
      console.log(error);
      router.push({ name: "Page404", params: { 0: "404" } });
    });
});
</script>
