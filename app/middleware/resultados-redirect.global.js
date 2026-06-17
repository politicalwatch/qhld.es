import qs from "qs";

export default defineNuxtRouteMiddleware((to) => {
  const match = to.path.match(/^\/resultados\/(.+)$/);
  if (!match) return;

  let decoded = match[1];
  for (let i = 0; i < 5; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  const query = decoded ? qs.parse(decoded) : {};
  return navigateTo({ path: "/buscar", query }, { replace: true });
});
