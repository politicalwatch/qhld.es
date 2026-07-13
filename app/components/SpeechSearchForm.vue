<template>
  <form class="c-ai-search" role="search" @submit.prevent="onSubmit">
    <label class="c-ai-search__label" for="speech-search-input">
      ¿Qué quieres saber?
    </label>
    <div
      class="c-ai-search__box"
      :class="{ 'c-ai-search__box--loading': loading }"
    >
      <Icon name="mdi:creation" class="c-ai-search__icon" />
      <input
        id="speech-search-input"
        v-model="model"
        class="c-ai-search__input"
        type="search"
        placeholder="P. ej. «¿Qué ha dicho Errejón sobre el alquiler?»"
        autocomplete="off"
        :disabled="loading"
      />
      <button class="c-ai-search__submit" type="submit" :disabled="disabled">
        Buscar
      </button>
    </div>
  </form>
</template>

<script setup>
const model = defineModel({ type: String, default: "" });

const { loading } = defineProps({
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["search"]);

const disabled = computed(() => loading || model.value.trim().length < 2);

const onSubmit = () => {
  if (!disabled.value) emit("search");
};
</script>
