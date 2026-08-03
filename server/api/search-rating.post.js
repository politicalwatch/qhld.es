import { createError, defineEventHandler, getRequestIP, readBody } from 'h3';

import { COMMENT_MAX_LENGTH, RATING_REASONS } from '#shared/utils/searchRating';
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

const REASON_SLUGS = new Set(RATING_REASONS.map((reason) => reason.slug));

const QUERY_MAX_LENGTH = 500;
const MAX_RESULT_IDS = 100;

const limiter = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

const invalid = () =>
  createError({ statusCode: 400, statusMessage: 'Valoración no válida' });

const isStringList = (value, max) =>
  Array.isArray(value)
  && value.length <= max
  && value.every((item) => typeof item === 'string');

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // Per real client IP. `getRequestIP` prefers X-Forwarded-For, which is spoofable —
  // acceptable, because evading this costs an attacker nothing they didn't already have
  // (the token is the real gate) and the honest case needs the header to work behind
  // the reverse proxy at all.
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  if (!limiter.check(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Has enviado demasiadas valoraciones',
    });
  }

  const body = await readBody(event);

  // Re-validated here rather than trusted. The browser's copy of these rules is a UX
  // affordance; this route is reachable on its own. The backend validates again — it is
  // the one that must not be fooled — so these checks are about a clear error, not safety.
  const rating = body?.rating;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw invalid();

  const query = typeof body.query === 'string' ? body.query.trim() : '';
  if (!query || query.length > QUERY_MAX_LENGTH) throw invalid();

  if (body.query_meta != null && typeof body.query_meta !== 'object') throw invalid();
  if (body.reasons != null && !isStringList(body.reasons, RATING_REASONS.length)) throw invalid();
  if (body.result_ids != null && !isStringList(body.result_ids, MAX_RESULT_IDS)) throw invalid();
  if (body.comment != null && typeof body.comment !== 'string') throw invalid();
  if (body.corpus != null && typeof body.corpus !== 'string') throw invalid();

  const payload = {
    rating,
    query,
    query_meta: body.query_meta ?? {},
    reasons: (body.reasons ?? []).filter((slug) => REASON_SLUGS.has(slug)),
    result_ids: body.result_ids ?? [],
  };
  const comment = (body.comment ?? '').trim().slice(0, COMMENT_MAX_LENGTH);
  if (comment) payload.comment = comment;
  if (body.corpus) payload.corpus = body.corpus;

  if (!config.searchRatingToken) {
    // Misconfigured deploy, not a user error. Say nothing specific to the client — the
    // absence of a token is not their business — but make it loud in the logs.
    console.warn('[search-rating] NUXT_SEARCH_RATING_TOKEN is not set; rating dropped');
    throw createError({
      statusCode: 503,
      statusMessage: 'No se han podido enviar las valoraciones',
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
      statusCode: 502,
      statusMessage: 'No se ha podido guardar la valoración',
    });
  }

  return { ok: true };
});
