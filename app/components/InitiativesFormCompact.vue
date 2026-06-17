<template>
  <form
    id="initiatives-form"
    class="c-initiatives-form u-margin-bottom-4 u-padding-bottom-2 u-border-bottom"
    role="form"
    @submit.prevent="getResults()"
  >
    <div class="o-grid">
      <div class="o-grid__col u-12 u-5@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="topic">Temática</label>
          <USelectMenu
            v-model="formData.topic"
            :items="allTopics?.map((topic) => topic.name) ?? []"
            placeholder="Todas"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-5@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="author">Grupo</label>
          <USelectMenu
            v-model="formData.author"
            :items="['Gobierno', ...(allParliamentaryGroups ?? [])].map((group) => group.name || group)"
            placeholder="Todos"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-2@sm u-padding-bottom-4">
        <button class="u-border-link u-uppercase" type="submit">Buscar</button>
      </div>
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  formData: Object,
});
const { formData } = toRefs(props);

const router = useRouter();

const { data: allTopics } = useTopics();
const { data: allParliamentaryGroups } = useParliamentaryGroups();

const getResults = () => {
  router.push({ path: "/buscar", query: { ...formData.value } });
};
</script>

<style lang="scss" scoped>
.c-initiatives-form {
  .o-grid {
    align-items: center;
  }
  button[type="submit"] {
    width: 100%;
  }
}
</style>
