<template>
  <a class="c-social-icon" :href="link" target="_blank"
    ><img :src="`/img/${icon}.svg`"
  /></a>
</template>

<script setup>
const { link, icon } = defineProps({
  link: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.c-social-icon {
  border-radius: 50%;
  height: 32px;
  width: 32px;
}
</style>
