<template>
  <span class="c-icon" :class="`c-icon--type-${icon}`">
    <component :is="svg" :style="{ fill: customColor }" />
  </span>
</template>

<script setup>
import { toRefs, computed, defineAsyncComponent } from "vue";

const props = defineProps({
  icon: { type: String },
  color: { type: String },
});

const { icon, color } = toRefs(props);

const svg = computed(() => {
  let svg = "";
  try {
    svg = defineAsyncComponent(
      () => import(`@/assets/svg/icon-${icon.value}.svg`)
    );
  } catch (error) {
    svg = icon.value;
  }
  return svg;
});

const customColor = computed(() => color.value || "#2d4252");
</script>
