import { createGtag } from "vue-gtag";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const router = useRouter();

  nuxtApp.vueApp.use(
    createGtag({
      tagId: config.public.gaId,
      pageTracker: { router },
      initMode: "manual",
    })
  );
});
