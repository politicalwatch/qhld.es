<template>
  <div
    :class="'c-parliamentary_group_card c-parliamentary_group_card__' + layout"
  >
    <div
      class="c-parliamentary_group_card__overlay"
      :style="getBackground()"
    ></div>
    <div v-if="layout == 'large'" class="c-parliamentary_group_card__wrapper">
      <h1 class="u-uppercase">{{ getGroupName() }}</h1>
      <h3 class="u-uppercase">
        <Icon icon="mdi:person" class="c-icon--secondary c-icon--white" />{{
          parliamentaryGroup.composition.deputies
        }}
        Diputados/as
      </h3>
      <div class="c-parliamentary_group_card__icons">
        <PartyLogoIcon
          v-for="party in parliamentaryGroup.parties"
          :key="party"
          :party="party"
        />
      </div>
    </div>
    <div v-if="layout == 'medium'" class="c-parliamentary_group_card__wrapper">
      <router-link
        :to="{
          name: 'parliamentarygroup',
          params: { id: parliamentaryGroup.id },
        }"
      >
        <h3 class="u-uppercase">{{ getGroupName() }}</h3>
        <h4 class="u-uppercase">
          <Icon icon="mdi:person" class="c-icon--secondary c-icon--white" />{{
            parliamentaryGroup.composition.deputies
          }}
          Diputados/as
        </h4>
        <div class="c-parliamentary_group_card__icons">
          <PartyLogoIcon
            v-for="party in parliamentaryGroup.parties"
            :key="party"
            :party="party"
          />
        </div>
      </router-link>
    </div>
    <div v-if="layout == 'small'" class="c-parliamentary_group_card__wrapper">
      <router-link
        :to="{
          name: 'parliamentarygroup',
          params: { id: parliamentaryGroup.id },
        }"
      >
        <h4 class="u-uppercase">{{ getGroupName() }}</h4>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

import PartyLogoIcon from "@/components/PartyLogoIcon.vue";

const { parliamentaryGroup, layout } = defineProps({
  parliamentaryGroup: { type: Object },
  layout: { type: String },
});

const getBackground = () => {
  const bg = parliamentaryGroup.color;
  if (bg.length == 7) {
    return "background-color:" + bg;
  }
  return "background-image:" + bg;
};

const getGroupName = () => {
  if (layout == "small") {
    const short_name = parliamentaryGroup.name.replace(
      "Grupo Parlamentario",
      "GP"
    );
    if (short_name.length < 23) {
      return short_name;
    }
    return short_name.substring(0, 24) + "...";
  }

  return parliamentaryGroup.name;
};
</script>

<style lang="scss" scoped>
.c-parliamentary_group_card {
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  color: $white;

  a {
    color: $white;
    text-decoration: none;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    opacity: 0.7;
    position: absolute;
    z-index: 1;
  }

  &__wrapper {
    position: absolute;
    z-index: 2;
    height: 100%;
    width: 100%;

    h4 {
      display: flex;
      justify-content: start;
      align-items: center;
      gap: 8px;
    }
  }

  &__icons {
    position: absolute;
    bottom: 32px;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap-reverse;
    width: 100%;
    padding-right: 80px;
  }

  &__large {
    position: relative;
    background-image: url("../assets/parliamentary-groups-bg-large.jpg");
    height: 368px;
    margin-bottom: 64px;

    h3 {
      position: absolute;
      bottom: 0;
      margin-bottom: 4rem;
    }

    .c-parliamentary_group_card__wrapper {
      padding: 64px;
    }

    .c-parliamentary_group_card__icons {
      bottom: 48px;
      padding-right: 120px;
    }
  }

  &__medium {
    background-image: url("../assets/parliamentary-groups-bg.jpg");

    .c-parliamentary_group_card__wrapper {
      padding: 32px;
    }
  }

  &__small {
    background-image: url("../assets/parliamentary-groups-bg-small.jpg");
    width: 256px;
    height: 64px;
    position: initial;
    margin-bottom: rem($spacer-unit);

    .c-parliamentary_group_card__overlay {
      position: initial;
    }

    .c-parliamentary_group_card__wrapper {
      position: relative;
      top: -62px;
      padding: 20px 32px;
    }
  }
}
</style>
