<template>
  <div class="c-otherauthor_card">
    <div class="c-otherauthor_card__wrapper">
      <h4 class="u-uppercase">{{ name }}</h4>
    </div>
  </div>
</template>

<script setup>
const { name } = defineProps({
  name: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.c-otherauthor_card {
  position: initial;
  width: 256px;
  height: auto;
  background-color: $secondary;

  &__wrapper {
    padding: 20px 32px 10px 32px;

    h4 {
      color: $black;
    }
  }
}
</style>
