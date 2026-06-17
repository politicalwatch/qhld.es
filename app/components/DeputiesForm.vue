<template>
  <form
    id="deputies-form"
    class="u-margin-bottom-8"
    role="form"
    @submit.prevent=""
  >
    <div class="o-grid">
      <div class="o-grid__col u-12 u-4@sm">
        <div class="c-input-label u-block">
          <label for="name">Nombre</label>
          <input
            v-model="form.name"
            type="text"
            name="name"
            id="name"
            @update:model-value="emitFilters()"
            placeholder="Busca por nombre y apellidos"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-4@sm">
        <div class="c-select-label u-block">
          <label for="group">Grupo</label>
          <USelectMenu
            v-model="form.group"
            :items="groups"
            placeholder="Selecciona uno"
            @update:model-value="emitFilters()"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-4@sm">
        <div class="c-select-label u-block">
          <label for="constituency">Provincia</label>
          <USelectMenu
            v-model="form.constituency"
            :items="getConstituencies()"
            placeholder="Selecciona una"
            @update:model-value="emitFilters()"
          />
        </div>
      </div>
    </div>
    <div class="o-grid u-margin-top-1">
      <div class="o-grid__col u-12 u-6@sm">
        <div class="c-select-label u-block">
          <label for="footprint">Ordenar por temática</label>
          <USelectMenu
            v-model="form.footprint"
            :items="ranking"
            placeholder="Selecciona una"
            @update:model-value="emitFilters()"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-6@sm">
        <footprint-info :withLabel="true" />
      </div>
    </div>
    <div class="o-grid" v-if="isFormDirty">
      <div class="o-grid__col u-8 u-12@sm u-text-right@sm">
        <button class="c-button u-padding-right-0" @click.prevent="cleanForm">
          Limpiar búsqueda
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import FootprintInfo from "@/components/FootprintInfo.vue";

const { deputies, groups, ranking } = defineProps({
  deputies: Array,
  groups: Array,
  ranking: Array,
});

const emit = defineEmits(["setFilters"]);

const form = ref({
  group: null,
  constituency: null,
  name: "",
  footprint: null,
});

const isFormDirty = computed(() => {
  return (
    form.value.group ||
    form.value.constituency ||
    form.value.name ||
    form.value.footprint
  );
});

const cleanForm = () => {
  form.value = {
    group: null,
    constituency: null,
    name: "",
    footprint: null,
  };
  emitFilters();
};

const emitFilters = () => {
  emit("setFilters", form.value);
};

const getConstituencies = () => {
  const constituencies = {};
  for (const deputy of deputies) {
    constituencies[deputy["constituency"]] = deputy["constituency"];
  }
  return Object.keys(constituencies).sort(Intl.Collator().compare);
};
</script>
