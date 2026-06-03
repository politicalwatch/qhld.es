import { defineEventHandler } from 'h3';

/**
 * Dynamic sitemap URL source for @nuxtjs/sitemap.
 * Returns deputies, parliamentary groups, and topics.
 * Initiatives are excluded due to volume.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const backendUrl = config.public.backendUrl || 'http://localhost:5000';
  const knowledgebase = config.public.knowledgebase || 'politicas';

  const params = `knowledgebase=${knowledgebase}`;
  const urls = [];

  try {
    const [deputies, groups, topics] = await Promise.all([
      $fetch(`${backendUrl}/deputies/?${params}`).catch(() => []),
      $fetch(`${backendUrl}/parliamentary-groups/?${params}`).catch(() => []),
      $fetch(`${backendUrl}/topics/?${params}`).catch(() => []),
    ]);

    for (const deputy of (deputies || [])) {
      if (deputy.id) {
        urls.push({ loc: `/diputados/${deputy.id}` });
      }
    }

    for (const group of (groups || [])) {
      if (group.id) {
        urls.push({ loc: `/grupos/${group.id}` });
      }
    }

    for (const topic of (topics || [])) {
      if (topic.id) {
        urls.push({ loc: `/tematicas/${topic.id}` });
      }
    }
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic URLs:', err?.message);
  }

  return urls;
});
