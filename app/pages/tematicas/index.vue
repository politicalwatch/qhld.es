<template>
  <div class="o-container o-section u-padding-bottom-10 u-margin-bottom-10">
    <page-header title="Temáticas" />
    <div class="o-grid">
      <div
        class="o-grid__col u-12 u-4@sm"
        v-for="topic in topicsWithStats"
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
</template>

<script setup>
definePageMeta({ name: 'topics' });
import { computed } from "vue";

import PageHeader from "@/components/PageHeader.vue";
import TopicLink from "@/components/TopicLink.vue";
import config from "@/config";

const { $api } = useNuxtApp();

const [{ data: allTopics }, { data: stats }] = await Promise.all([
  useTopics(),
  useAsyncData(
    'topics-overall-stats',
    async () => (await $api.getOverallStats()).topics?.politicas ?? [],
    { default: () => [], getCachedData: getCachedPayload }
  ),
]);

const topicsStyles = config.STYLES.topics;

const topicsWithStats = computed(() => {
  if (!stats.value?.length) return allTopics.value;
  return allTopics.value
    .map((topic) => {
      const stat = stats.value.find((s) => s._id === topic.name);
      return { ...topic, initiatives: stat?.initiatives ?? 0 };
    })
    .sort((a, b) => b.initiatives - a.initiatives);
});
</script>
