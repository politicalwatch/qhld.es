export default defineNuxtPlugin(() => {
  const { cookiesEnabledIds } = useCookieControl()
  const { gtag } = useGtag()

  watch(
    cookiesEnabledIds,
    (current) => {
      const granted = current?.includes("ga") ? "granted" : "denied"
      gtag("consent", "update", {
        ad_storage: granted,
        ad_user_data: granted,
        ad_personalization: granted,
        analytics_storage: granted,
      })
    },
    { deep: true, immediate: true },
  )
})
