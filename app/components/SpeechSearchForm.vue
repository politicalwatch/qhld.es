<template>
  <form class="c-ai-search" role="search" @submit.prevent="onSubmit">
    <label class="c-ai-search__label" for="speech-search-input">
      ¿Qué quieres saber?
    </label>
    <div
      class="c-ai-search__box"
      :class="{ 'c-ai-search__box--loading': loading }"
    >
      <span class="c-ai-search__icon" aria-hidden="true">
        <Icon name="mdi:creation" />
      </span>
      <input
        id="speech-search-input"
        v-model="model"
        class="c-ai-search__input"
        type="search"
        placeholder="P. ej. «¿Qué ha dicho Pedro Sánchez sobre el alquiler?»"
        autocomplete="off"
        :disabled="loading"
      />

      <!-- History lives in client-only web storage, so render it only after mount
           to avoid a hydration mismatch (server has no entries). -->
      <ClientOnly>
        <UPopover
          v-if="entries.length"
          v-model:open="historyOpen"
          :ui="{ content: 'c-speech-history__popover' }"
        >
          <button
            type="button"
            class="c-ai-search__history"
            :disabled="loading"
            aria-label="Búsquedas recientes"
            title="Búsquedas recientes"
          >
            <Icon name="mdi:history" />
          </button>

          <template #content>
            <div class="c-speech-history">
              <div class="c-speech-history__header">
                <span class="c-speech-history__title">Búsquedas recientes</span>
                <button
                  type="button"
                  class="c-speech-history__clear"
                  @click="onClear"
                >
                  Limpiar
                </button>
              </div>
              <ul class="c-speech-history__list">
                <li
                  v-for="entry in entries"
                  :key="entry.query"
                  class="c-speech-history__item"
                >
                  <button
                    type="button"
                    class="c-speech-history__recall"
                    @click="onRecall(entry.query)"
                  >
                    <span class="c-speech-history__query">{{ entry.query }}</span>
                    <span class="c-speech-history__meta">
                      {{ entry.results.length }}
                      {{ entry.results.length === 1 ? "resultado" : "resultados" }}
                      · {{ relativeTime(entry.ts) }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="c-speech-history__remove"
                    aria-label="Eliminar del historial"
                    @click="emit('remove', entry.query)"
                  >
                    <Icon name="mdi:close" />
                  </button>
                </li>
              </ul>
            </div>
          </template>
        </UPopover>
      </ClientOnly>

      <button class="c-ai-search__submit" type="submit" :disabled="disabled">
        Buscar
      </button>
    </div>
  </form>
</template>

<script setup>
const model = defineModel({ type: String, default: "" });

const { loading, entries } = defineProps({
  loading: { type: Boolean, default: false },
  entries: { type: Array, default: () => [] },
});

const emit = defineEmits(["search", "recall", "remove", "clear"]);

const historyOpen = ref(false);

const disabled = computed(() => loading || model.value.trim().length < 2);

const onSubmit = () => {
  if (!disabled.value) emit("search");
};

const onRecall = (query) => {
  historyOpen.value = false;
  emit("recall", query);
};

const onClear = () => {
  historyOpen.value = false;
  emit("clear");
};

// History is day-scoped, so timestamps are at most a day old — minutes/hours
// cover every case.
const relativeTime = (ts) => {
  const minutes = Math.floor((Date.now() - ts) / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours} h`;
};
</script>
