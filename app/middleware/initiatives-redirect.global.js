export default defineNuxtRouteMiddleware((to) => {
  const match = to.path.match(/^\/initiatives\/(.+)$/);
  if (match) {
    return navigateTo(`/iniciativas/${match[1]}`, { redirectCode: 301 });
  }
});
