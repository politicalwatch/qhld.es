import {
  createError,
  defineEventHandler,
  getRequestIP,
  readValidatedBody,
  useRuntimeConfig,
} from 'nuxt/server';

import { parseRatingBody } from '#shared/utils/searchRating';
import { createRateLimiter } from '../utils/rateLimit.js';

/**
 * Records a user's rating of a speech search.
 *
 * This route exists so the shared secret never reaches the browser. There are no user
 * accounts yet, so the token is the only thing that makes a rating provably ours rather
 * than something posted straight at the backend — which means the browser must not hold
 * it, and this is the one call in the app that cannot go direct (every other one does,
 * see `app/plugins/api.js`).
 *
 * Rate limiting lives here rather than on the backend because this is the last hop that
 * can see the real client; behind it, every rating shares this server's IP.
 */

const limiter = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Per real client IP. `getRequestIP` prefers X-Forwarded-For, which is spoofable —
  // acceptable, because evading this costs an attacker nothing they didn't already have
  // (the token is the real gate) and the honest case needs the header to work behind
  // the reverse proxy at all.
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  if (!limiter.check(ip)) {
    throw createError({
      status: 429,
      statusText: 'Has enviado demasiadas valoraciones',
    });
  }

  const payload = await readValidatedBody(event, parseRatingBody, {
    onError: () => ({
      status: 400,
      statusText: 'Valoración no válida',
      message: 'Valoración no válida',
    }),
  });

  if (!config.searchRatingToken) {
    // Misconfigured deploy, not a user error. Say nothing specific to the client — the
    // absence of a token is not their business — but make it loud in the logs.
    console.warn('[search-rating] NUXT_SEARCH_RATING_TOKEN is not set; rating dropped');
    throw createError({
      status: 503,
      statusText: 'No se han podido enviar las valoraciones',
    });
  }

  try {
    await $fetch('/search-ratings', {
      baseURL: config.public.backendUrl || 'http://localhost:5000',
      method: 'POST',
      headers: { 'X-QHLD-Token': config.searchRatingToken },
      body: payload,
    });
  } catch (err) {
    // Never echo the backend's response: it would confirm to a prober whether the token
    // was accepted. Log the status, return one opaque failure.
    console.warn('[search-rating] Backend rejected the rating:', err?.status ?? err?.message);
    throw createError({
      status: 502,
      statusText: 'No se ha podido guardar la valoración',
    });
  }

  return { ok: true };
});
