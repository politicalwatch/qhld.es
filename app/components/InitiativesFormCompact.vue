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
          <multiselect
            selectedLabel="Seleccionado"
            selectLabel=""
            deselectLabel="Pulsa para deseleccionar"
            v-model="formData.topic"
            :options="allTopics.map((topic) => topic.name)"
            :allow-empty="true"
            name="topic"
            id="topic"
            placeholder="Todas"
          >
          </multiselect>
        </div>
      </div>
      <div class="o-grid__col u-12 u-5@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="author">Grupo</label>
          <multiselect
            selectedLabel="Seleccionado"
            selectLabel=""
            deselectLabel="Pulsa para deseleccionar"
            v-model="formData.author"
            :options="
              store.getAllParliamentaryGroupsWithGoverment.map(
                (group) => group.name || group
              )
            "
            :allow-empty="true"
            name="author"
            id="author"
            placeholder="Todos"
          >
          </multiselect>
        </div>
      </div>
      <div class="o-grid__col u-12 u-2@sm u-padding-bottom-4">
        <button class="u-border-link u-uppercase" type="submit">Buscar</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { toRefs } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import Multiselect from "vue-multiselect";
import qs from "qs";

import { useParliamentStore } from "@/stores/parliament";

const props = defineProps({
  formData: Object,
});
const { formData } = toRefs(props);

const router = useRouter();

const store = useParliamentStore();
const { allTopics } = storeToRefs(store);

const getResults = () => {
  router.push({
    name: "results",
    params: {
      data: qs.stringify(formData.value),
    },
  });
};
</script>

<style lang="scss">
.c-initiatives-form {
  .o-grid {
    align-items: center;
  }
  button {
    width: 100%;
  }
}
span.multiselect__option--selected {
  span {
    color: white;
  }
}
</style>
