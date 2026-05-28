<template>
  <form
    id="deputies-form"
    class="u-margin-bottom-8"
    role="form"
    @submit.prevent=""
  >
    <div class="o-grid">
      <div class="o-grid__col u-12 u-5@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="month">Mes</label>
          <VueMultiselect
            selectedLabel="Seleccionado"
            selectLabel=""
            deselectLabel="Pulsa para deseleccionar"
            v-model="selectedMonth"
            :options="monthOptions"
            :allow-empty="true"
            @update:model-value="emitFilters()"
            name="month"
            id="month"
            :placeholder="selectedMonth?.text ?? 'Selecciona mes'"
            label="text"
            track-by="value"
          />
        </div>
      </div>
      <div class="o-grid__col u-12 u-5@sm u-padding-bottom-4">
        <div class="c-select-label u-block">
          <label for="day">Día</label>
          <VueMultiselect
            selectedLabel="Seleccionado"
            selectLabel=""
            deselectLabel="Pulsa para deseleccionar"
            v-model="form.day"
            :options="dayOptions"
            :disabled="!form.month"
            :allow-empty="true"
            @update:model-value="emitFilters()"
            name="day"
            id="day"
            :placeholder="form.day?.text ?? 'Selecciona día'"
          />
        </div>
      </div>
      <div class="o-grid__col u-8 u-2@sm u-text-right@sm">
        <button class="c-button u-padding-right-0" @click.prevent="cleanForm">
          Limpiar búsqueda
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import VueMultiselect from "vue-multiselect";

const emit = defineEmits(["setFilters"]);

const emitFilters = () => {
  emit("setFilters", form.value);
};

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentDay = today.getDate();

const form = ref({
  month: currentMonth,
  day: currentDay,
});

const dayOptions = computed(() => {
  if (form.value.month) {
    const daysInMonth = getDaysInMonth(form.value.month);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }
  return [];
});

const getDaysInMonth = (month) => {
  if (month === 2) {
    return 29;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
};

const monthOptions = [
  { value: 1, text: "Enero" },
  { value: 2, text: "Febrero" },
  { value: 3, text: "Marzo" },
  { value: 4, text: "Abril" },
  { value: 5, text: "Mayo" },
  { value: 6, text: "Junio" },
  { value: 7, text: "Julio" },
  { value: 8, text: "Agosto" },
  { value: 9, text: "Septiembre" },
  { value: 10, text: "Octubre" },
  { value: 11, text: "Noviembre" },
  { value: 12, text: "Diciembre" },
];

const selectedMonth = computed({
  get: () => {
    return monthOptions.find((month) => {
      return month?.value ? month.value === form.value.month : "";
    });
  },
  set: (value) => {
    form.value.month = value?.value ? value.value : value;
    form.value.day = null;
  },
});

const cleanForm = () => {
  form.value = {
    month: null,
    day: null,
  };
  emitFilters();
};

onMounted(() => {
  emitFilters();
});
</script>
