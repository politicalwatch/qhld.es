<template>
  <div v-if="!isClosed" class="c-callout" role="alert" aria-live="assertive">
    <button
      v-if="canClose"
      class="c-callout__button"
      @click="closeCallout(closeCallback())"
      aria-label="Close"
    >
      <Icon icon="mdi:close" />
    </button>
    <div class="c-callout__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";

const { closeId, checkClosed, closeCallback } = defineProps({
  canClose: { type: Boolean, default: true },
  closeId: { type: String },
  checkClosed: { type: Function },
  closeCallback: { type: Function },
});

const isClosed = ref(false);

const emit = defineEmits(["close"]);

const closeCallout = (callback) => {
  localStorage.setItem(`${closeId}-closed`, callback);
  emit("close");
  isClosed.value = true;
};

onMounted(() => {
  isClosed.value = checkClosed();
});
</script>

<style lang="scss" scoped>
.c-callout {
  border: 1px solid #ccc;
  padding: 3rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  position: relative;
  margin-bottom: 4rem;

  &__button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: #e0e0e0;
    color: #333;
    border: none;
    border-radius: 50%;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;

    &:hover {
      background-color: #333;
      color: #e0e0e0;
    }
  }

  &__content {
    :deep(.c-card_grid__item.c-card_grid__item__deputy.c-card_grid__large) {
      margin-bottom: 0;
    }
  }
}
</style>
