<template>
  <div class="c-government_card">
    <div class="c-government_card__wrapper">
      <router-link
        :to="{
          name: 'results',
          params: { data: qs.stringify({ author: 'Gobierno' }) },
        }"
      >
        <h4 class="u-uppercase">Gobierno</h4>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import qs from "qs";
</script>

<style scoped lang="scss">
.c-government_card {
  position: initial;
  width: 256px;
  height: 64px;
  background-image: url("../assets/government-bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  margin-bottom: rem($spacer-unit);

  &__wrapper {
    padding: 20px 32px;

    a {
      color: $white;
      text-decoration: none;
    }
  }
}
</style>
