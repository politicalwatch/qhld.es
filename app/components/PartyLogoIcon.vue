<template>
  <div v-if="parties[party]" class="c-party_logo_icon" :style="getBackground">
    <figure class="c-party_logo_icon__image" :alt="'Logo de ' + getName">
      <inline-svg :src="svg" />
    </figure>
  </div>
</template>

<script setup>
import { computed } from "vue";
import InlineSvg from "vue-inline-svg";

import config from "@/config";

const { party } = defineProps({
  party: { type: String },
});

const parties = config.STYLES.parties;

const svg = computed(() => {
  let svg = "";
  try {
    if (party in parties) {
      svg = `../assets/party_logos/icon/${parties[party].logo}.svg`;
    } else {
      svg = "../assets/svg/icon-error.svg";
    }
  } catch (error) {
    svg = this.icon;
  }
  return svg;
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
