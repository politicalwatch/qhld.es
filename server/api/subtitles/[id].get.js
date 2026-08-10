import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  setResponseHeader,
} from 'h3';

/**
 * The subtitle track of one intervention, in one language, served from our own origin.
 *
 * This is the one call that cannot go direct to the backend (`app/plugins/api.js` sends
 * every other one straight there), and the reason is CORS rather than secrecy. A
 * `<track>` on another origin is only loaded when that origin allows it, and the
 * attribute that would enable it — `crossorigin` on the `<video>` — also puts the
 * *video* request into CORS mode. The videos come from static.congreso.es, which sends
 * no `Access-Control-Allow-Origin`, so switching that on would trade missing subtitles
 * for a video that never loads. Same-origin subtitles avoid the choice entirely.
 *
 * The backend renders the VTT per request from the stored cue offsets, so there is no
 * file anywhere and a corrected transcript reaches the subtitles on its own.
 */

// A Congress intervention id (all digits) or an internal speech id (hex). Anything else
// is not an id we could have issued, and this way none of it reaches the backend URL.
const SPEECH_ID = /^[a-z0-9]{1,64}$/i;

// A co-official intervention has a track per language, so which one is asked for is part
// of the request. Guarded like the id: only a short language code reaches the backend.
const LANG = /^[a-z-]{2,8}$/i;

// Matches the backend's own cache header: cues change only when a speech is re-aligned.
const CACHE_CONTROL = 'public, max-age=3600';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const id = getRouterParam(event, 'id');
  const { lang } = getQuery(event);

  if (!id || !SPEECH_ID.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Intervención no válida' });
  }
  if (lang !== undefined && (typeof lang !== 'string' || !LANG.test(lang))) {
    throw createError({ statusCode: 400, statusMessage: 'Idioma no válido' });
  }

  let track;
  try {
    track = await $fetch(`/speeches/${id}/subtitles.vtt`, {
      baseURL: config.public.backendUrl || 'http://localhost:5000',
      // Omitted rather than sent empty: no language means the as-delivered track, which
      // is the only one a speech given in Spanish has.
      query: lang ? { lang } : undefined,
    });
  } catch (err) {
    // A speech with no subtitles is the ordinary case, not a fault: only aligned
    // interventions have a track, and the page only asks for one when the speech says
    // it has it. Anything else is worth a line in the log.
    if (err?.status !== 404) {
      console.warn('[subtitles] Backend refused the track:', err?.status ?? err?.message);
    }
    throw createError({ statusCode: 404, statusMessage: 'Sin subtítulos' });
  }

  // Players are strict about this one: a track served as anything but text/vtt is
  // dropped without a word.
  setResponseHeader(event, 'content-type', 'text/vtt; charset=utf-8');
  setResponseHeader(event, 'cache-control', CACHE_CONTROL);
  return track;
});
