import VueScrollTo from "vue-scrollto";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("scroll-to", VueScrollTo);
});
