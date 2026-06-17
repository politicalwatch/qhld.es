<template>
  <div id="page404" class="o-container o-section u-margin-bottom-6">
    <div class="o-grid">
      <div
        class="o-grid__col u-12 u-6@sm u-offset-3@sm u-text-center u-padding-top-4 u-padding-bottom-4"
      >
        <not-found
          message="El Congreso es muy grande y todos alguna vez nos perdemos."
          class="u-margin-bottom-2"
        />
        <router-link :to="{ name: 'search' }" class="u-border-link u-uppercase"
          >Volver al inicio</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import NotFound from "@/components/NotFound.vue";
</script>

<style scoped lang="scss">
.container {
  padding: 80px 15px;
}
p {
  font-size: 1.2em;
}
</style>
