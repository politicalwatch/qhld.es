<template>
  <form
    id="initiatives-form"
    class="c-initiatives-form u-margin-bottom-4 u-border-bottom"
    role="form"
    @submit.prevent="getResults($event)"
  >
    <div class="o-grid">
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="topic">Temática</label>
          <USelectMenu
            v-model="formData.topic"
            :items="allTopics?.map((topic) => topic.name) ?? []"
            placeholder="Todas"
            @update:model-value="handleTopicChange"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <div
          class="c-select-label u-block"
          :class="{ 'c-select-label--disabled': !subtopics.length }"
        >
          <label for="subtopics">Subtemática</label>
          <USelectMenu
            v-model="formData.subtopics"
            multiple
            :items="subtopics"
            :disabled="!subtopicsInputEnabled"
          >
            <template #default>
              <span
                v-if="!formData.subtopics || !formData.subtopics.length"
                class="qhld-select__placeholder"
              >
                {{ subtopicsInputEnabled ? 'Todas' : 'Selecciona previamente una temática' }}
              </span>
              <span v-else class="qhld-select__chips">
                <span
                  v-for="subtopic in formData.subtopics"
                  :key="subtopic"
                  class="qhld-select__chip"
                >
                  {{ subtopic }}
                  <button type="button" aria-label="Quitar" @click.stop="removeSubtopic(subtopic)">
                    <Icon name="mdi:close" />
                  </button>
                </span>
              </span>
            </template>
          </USelectMenu>
        </div>
      </div>
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <div class="c-input-label u-block">
          <label for="text">Título y Contenido</label>
          <input
            v-model="formData.text"
            type="text"
            id="text"
            name="text"
            placeholder="Texto libre"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <div class="c-input-label u-block">
          <label for="reference">Referencia</label>
          <input
            v-model="formData.reference"
            type="text"
            id="reference"
            name="reference"
            placeholder="Ej.: 121/000001"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-4@sm u-padding-bottom-4">
        <div class="c-datepicker-label u-block">
          <label for="startdate">Desde</label>
          <VueDatePicker
            v-model="formData.startdate"
            :locale="es"
            :time-config="{ enableTimePicker: false }"
            :formats="{ input: formatDatepickerDate }"
            placeholder="dd/mm/yyyy"
            auto-apply
            @update:model-value="selectStartDate"
            @cleared="clearStartDate"
            :text-input="textInputOptions"
            :input-attrs="{ name: 'startdate', hideInputIcon: true }"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-4@sm u-padding-bottom-4">
        <div class="c-datepicker-label u-block">
          <label for="enddate">Hasta</label>
          <VueDatePicker
            v-model="formData.enddate"
            :locale="es"
            :time-config="{ enableTimePicker: false }"
            :formats="{ input: formatDatepickerDate }"
            placeholder="dd/mm/yyyy"
            :max-date="new Date()"
            auto-apply
            @update:model-value="selectEndDate"
            @cleared="clearEndDate"
            :text-input="textInputOptions"
            :input-attrs="{ name: 'enddate', hideInputIcon: true }"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-4@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="status">Estado</label>
          <USelectMenu
            v-model="formData.status"
            :items="allStatus ?? []"
            placeholder="Cualquiera"
          />
        </div>
      </div>
    </div>
    <!-- /.o-grid -->
    <div class="o-grid" v-show="advanced">
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="author_deputies">Diputado/a</label>
          <USelectMenu
            v-model="formData.deputy"
            :items="getDeputies()"
            placeholder="Apellidos, Nombre"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="author">Grupo</label>
          <USelectMenu
            v-model="formData.author"
            :items="['Gobierno', ...(allParliamentaryGroups ?? [])].map((group) => group.name || group)"
            placeholder="Todos"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="type">Tipo</label>
          <USelectMenu
            v-model="formData.type"
            multiple
            :items="getTypes()"
          >
            <template #default>
              <span v-if="!formData.type || !formData.type.length" class="qhld-select__placeholder">Cualquiera</span>
              <span v-else class="qhld-select__chips">
                <span v-for="type in formData.type" :key="type" class="qhld-select__chip">
                  {{ type }}
                  <button type="button" aria-label="Quitar" @click.stop="removeType(type)">
                    <Icon name="mdi:close" />
                  </button>
                </span>
              </span>
            </template>
          </USelectMenu>
        </div>
      </div>
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="place">Lugar</label>
          <USelectMenu
            v-model="formData.place"
            :items="allPlaces?.map((p) => p.name) ?? []"
            placeholder="Cualquiera"
          />
        </div>
      </div>
    </div>
    <!-- /.o-grid -->
    <div class="o-grid">
      <div class="o-grid__col u-12 u-6@sm u-padding-bottom-4">
        <a
          href="#"
          class="c-button c-button--advanced u-padding-left-0"
          @click.prevent="toggleAdvanced"
        >
          <Icon name="mdi:mixer-settings" />
          <span v-if="!advanced">Mostrar búsqueda avanzada</span>
          <span v-else>Ocultar búsqueda avanzada</span>
        </a>
      </div>
      <div
        class="c-initiatives-form__actions o-grid__col u-12 u-6@sm u-padding-bottom-4 u-text-right@sm"
      >
        <button
          class="c-button u-padding-left-0 u-margin-right-2"
          @click.prevent="clearInitiatives"
        >
          Limpiar búsqueda
        </button>
        <button class="u-border-link u-uppercase" type="submit">Buscar</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import * as Utils from "@/utils";

const props = defineProps({
  formData: Object,
});

const { formData } = toRefs(props);

const emit = defineEmits(["getResults", "clearInitiatives"]);

const { $api } = useNuxtApp();
const { data: allTopics } = useTopics();
const { data: allStatus } = useStatus();
const { data: allTypes } = useTypes();
const { data: allPlaces } = usePlaces();
const { data: allDeputies } = useDeputies();
const { data: allParliamentaryGroups } = useParliamentaryGroups();
const getGroupByName = useGroupByName();
const getDeputiesByGroupShortname = useDeputiesByGroup();

const textInputOptions = {
  enterSubmit: true,
  tabSubmit: true,
  selectOnFocus: true,
  format: "dd/MM/yyyy",
};

const subtopics = ref([]);
const errors = ref(null);

const subtopicsInputEnabled = computed(() => {
  return formData.value.topic && subtopics.value.length;
});

onMounted(() => {
  nextTick(() => {
    // Populates topic dependant fields on redirection (from topic graphs)
    if (formData.value.topic) {
      fillSubtopics(formData.value.topic);
    }
  });
});

const advanced = ref(
  formData.value &&
    (formData.value.startdate ||
      formData.value.enddate ||
      formData.value.status ||
      formData.value.place ||
      formData.value.type ||
      formData.value.reference ||
      formData.value.text)
);

const formattedStartDate = computed(() => {
  return formData.value.startdate
    ? format(new Date(formData.value.startdate), "dd/MMM/yyyy")
    : undefined;
});

const formattedEndDate = computed(() => {
  return formData.value.enddate
    ? format(new Date(formData.value.enddate), "dd/MMM/yyyy")
    : undefined;
});

const cleanForm = () => {
  clearSubtopics();
};

const getTypes = () => allTypes.value?.map((t) => t.name) ?? [];

const getDeputies = () => {
  const { author } = formData.value;
  if (author === 'Gobierno') return [];
  if (author) {
    const group = getGroupByName(author);
    return getDeputiesByGroupShortname(group?.shortname ?? '')
      .map((d) => d.name);
  }
  return allDeputies.value?.map((d) => d.name) ?? [];
};

const fillSubtopics = (selectedTopic, clearValues) => {
  if (clearValues) {
    formData.value.subtopics = [];
  }
  if (!selectedTopic) return;
  const currentTopic = allTopics.value.find(
    (topic) => topic.name === selectedTopic
  );
  if (!currentTopic) return;
  getSubtopics(currentTopic.id);
};

// Replaces @select / @remove from vue-multiselect: single handler covers
// both select (truthy value) and clear (null/undefined value).
const handleTopicChange = (newTopic) => {
  if (newTopic) {
    formData.value.subtopics = [];
    fillSubtopics(newTopic);
  } else {
    clearSubtopics();
  }
};

// Remove a single chip from multi-value fields (called by the chip × button)
const removeSubtopic = (subtopic) => {
  formData.value.subtopics = (formData.value.subtopics || []).filter(
    (s) => s !== subtopic
  );
};

const removeType = (type) => {
  formData.value.type = (formData.value.type || []).filter((t) => t !== type);
};

const getResults = (event) => {
  emit("getResults", event);
};

const clearInitiatives = (event) => {
  cleanForm();
  emit("clearInitiatives", event);
};

const clearSubtopics = () => {
  subtopics.value = [];
  formData.value.subtopics = [];
};

const clearStartDate = () => {
  formData.value.startdate = "";
};

const clearEndDate = () => {
  formData.value.enddate = "";
};

const selectStartDate = (date) => {
  formData.value.startdate = format(new Date(date), "yyyy-MM-dd");
};

const selectEndDate = (date) => {
  formData.value.enddate = format(new Date(date), "yyyy-MM-dd");
};

const prepareForm = () => {
  if (formData.value.topic) {
    fillSubtopics(formData.value.topic, false);
  }
};

// The topic endpoint returns [{ subtopic, tag }]; the form only needs the
// distinct subtopics of the selected topic.
const getSubtopics = (topicID) => {
  $api
    .getTags(topicID)
    .then((tempTags) => {
      subtopics.value = [...new Set(tempTags.map((tag) => tag.subtopic))].sort(
        Utils.naturalSort
      );
    })
    .catch((error) => (errors.value = error));
};

const formatDatepickerDate = (date) => {
  return format(new Date(date), "dd/MM/yyyy");
};

const toggleAdvanced = () => {
  advanced.value = !advanced.value;
};

watch(allTopics, prepareForm);
</script>

<style lang="scss">
.c-initiatives-form {
  .o-grid {
    align-items: start;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.c-button--advanced {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dp--theme-light {
  --dp-background-color: #ffffff;
  --dp-text-color: #212121;
  --dp-hover-color: #f3f3f3;
  --dp-hover-text-color: #212121;
  --dp-hover-icon-color: #959595;
  --dp-primary-color: #1976d2;
  --dp-primary-text-color: #f8f5f5;
  --dp-secondary-color: #c0c4cc;
  --dp-border-color: #ddd;
  --dp-menu-border-color: #ddd;
  --dp-border-color-hover: #aaaeb7;
  --dp-disabled-color: #f6f6f6;
  --dp-scroll-bar-background: #f3f3f3;
  --dp-scroll-bar-color: #959595;
  --dp-success-color: #76d275;
  --dp-success-color-disabled: #a3d9b1;
  --dp-icon-color: #959595;
  --dp-danger-color: #ff6f60;
  --dp-highlight-color: rgba(25, 118, 210, 0.1);
}
</style>
