<template>
  <div class="c-not-found o-container">
    <div class="o-grid u-text-center">
      <div class="o-grid__col u-12@sm">
        <Icon404 />
      </div>
      <div class="o-grid__col u-12@sm">
        <h5>{{ message }}</h5>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon404 from "@/assets/svg/not-found.svg";

const { message } = defineProps({
  message: {
    type: String,
    default: "Página no encontrada",
  },
});
</script>

<style scoped lang="scss">
h5 {
  font-size: 16px;
  margin-top: 32px;
}
</style>
