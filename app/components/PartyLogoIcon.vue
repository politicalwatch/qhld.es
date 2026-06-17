<template>
  <div v-if="parties[party]" class="c-party_logo_icon" :style="getBackground">
    <figure class="c-party_logo_icon__image" :alt="'Logo de ' + getName">
      <component :is="LogoComponent" />
    </figure>
  </div>
</template>

<script setup>
import IconError from "@/assets/svg/icon-error.svg?component";

import config from "@/config";

const { party } = defineProps({
  party: { type: String },
});

const parties = config.STYLES.parties;

// Compile-time inline SVG map — keyed by filename stem (e.g. "bng", "psoe")
// so we don't depend on Vite's alias-resolved key format.
const svgModules = import.meta.glob("@/assets/party_logos/icon/*.svg", {
  query: "?component",
  import: "default",
  eager: true,
});
const logoComponents = Object.fromEntries(
  Object.entries(svgModules).map(([path, component]) => [
    path.split("/").pop().replace(".svg", ""),
    component,
  ])
);

const LogoComponent = computed(() => {
  const logo = parties[party]?.logo;
  return (logo && logoComponents[logo]) || IconError;
});

const getBackground = computed(() => {
  const bg = parties[party]?.color ? parties[party].color : "";
  if (bg.length == 7) {
    return "background-color:" + bg;
  }
  return "background-image:" + bg;
});

const getName = computed(() => {
  return parties[party]?.name ? parties[party].name : "";
});
</script>

<style scoped lang="scss">
.c-party_logo_icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 8px;
  margin-top: 8px;
  position: relative;

  &__image {
    display: flex;
    max-width: 100%;
    vertical-align: middle;
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    justify-content: center;
    align-items: center;

    svg {
      width: 65%;
    }
  }
}
</style>
