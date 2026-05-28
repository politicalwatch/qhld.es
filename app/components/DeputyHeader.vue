<template>
  <div
    class="c-deputy"
    :class="{ 'c-deputy__birthday': isBirthday }"
    v-if="deputy"
  >
    <div class="o-container">
      <div class="o-grid o-grid--reverse">
        <div class="o-grid__col u-4@sm">
          <div class="c-deputy__image_container">
            <img
              class="c-deputy__image"
              :src="deputy.image"
              :alt="'Foto de ' + deputy.name"
            />
            <party-logo v-if="deputy.party_name" :party="deputy.party_name" />
          </div>
        </div>
        <div class="o-grid__col u-12 u-8@sm">
          <h1 class="c-deputy__name">{{ deputy.name }}</h1>
          <h3 class="c-deputy__group" v-if="parliamentaryGroup">
            <router-link
              :to="{
                name: 'parliamentarygroup',
                params: { id: parliamentaryGroup.id },
              }"
            >
              {{ parliamentaryGroup.name }}
            </router-link>
          </h3>
          <div class="c-deputy__extra">
            <span class="c-deputy__personal"
              ><icon v-if="isBirthday" icon="mdi:birthday-cake-outline" />{{
                getAge()
              }}
              años</span
            >
            <span class="c-deputy__personal">
              <icon icon="mdi:location" color="#2d4252" :width="18" />{{
                getConstituency()
              }}
            </span>
          </div>
          <div class="c-deputy__links">
            <slot />
          </div>
        </div>
        <div class="o-grid__col u-12 u-12@sm c-deputy__more">
          <a href="#" @click="collapse"
            >{{ getCollapseMessage()
            }}<icon :icon="getCollapseIcon()" color="#F00"
          /></a>
        </div>
        <div :class="getCollapsedClass()" class="o-grid__col u-12 u-4@sm">
          <h3>Declaraciones</h3>
          <p v-for="(link, title) in deputy.extra.declarations" :key="title">
            <icon icon="mdi:file-document-outline" /><a :href="link">{{
              title
            }}</a>
          </p>
        </div>
        <div :class="getCollapsedClass()" class="o-grid__col u-12 u-4@sm">
          <h3>Cargos</h3>
          <p v-for="position in deputy.public_position" :key="position">
            {{ position }}
          </p>
        </div>
        <div :class="getCollapsedClass()" class="o-grid__col u-12 u-4@sm">
          <h3>Ficha personal</h3>
          <p v-for="entry in deputy.bio" :key="entry">{{ entry }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";

import PartyLogo from "@/components/PartyLogo.vue";

const { deputy, parliamentaryGroup } = defineProps({
  deputy: { type: Object, required: true },
  parliamentaryGroup: { type: Object },
});

const isCollapsed = ref(true);

const getCollapsedClass = () => {
  return isCollapsed.value ? "c-deputy__hidden" : "c-deputy__info";
};

const getCollapseIcon = () => {
  return isCollapsed.value ? "mdi:plus" : "mdi:minus";
};

const getCollapseMessage = () => {
  return isCollapsed.value ? "Mostrar más" : "Mostrar menos";
};

const collapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const isBirthday = computed(() => {
  const date = new Date(deputy.birthdate);
  const today = new Date();

  return (
    date.getDate() == today.getDate() && date.getMonth() == today.getMonth()
  );
});

const getAge = () => {
  const date = new Date(deputy.birthdate);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  return age;
};

const getConstituency = () => {
  return deputy.constituency;
};
</script>

<style scoped lang="scss"></style>
