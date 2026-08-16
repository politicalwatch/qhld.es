// What to tell the user when a speech search fails.
//
// Extracted from SpeechSearchContent.vue so the branching is testable: the
// component only wires this to the toast. Every message here is the ONLY thing a
// user gets — the search box has no other channel — so each failure needs words
// that say what to do next, not just what went wrong.

// Rate limited. The backend caps searches per minute, per hour and per day, and its
// Retry-After reports the window that actually filled up — so the wait can be named
// instead of hinted at. A missing value (an intermediary stripping the header, or CORS
// not exposing it) falls back to the vague wording rather than inventing a number.
export const rateLimitDescription = (retryAfter) => {
  if (!Number.isFinite(retryAfter) || retryAfter <= 0)
    return "Has hecho muchas búsquedas en poco tiempo. Espera un rato antes de volver a buscar.";
  if (retryAfter > 3600)
    // Only the daily cap reaches this far. Not "mañana": the windows are counted from the
    // first search, not from midnight, so the wait can end well before tomorrow.
    return "Has alcanzado el límite de búsquedas por hoy. Vuelve a intentarlo más tarde.";
  const minutes = Math.ceil(retryAfter / 60);
  return `Has hecho muchas búsquedas en poco tiempo. Vuelve a intentarlo en ${minutes} ${
    minutes === 1 ? "minuto" : "minutos"
  }.`;
};

// The backend refuses a search before retrieving anything for two different reasons
// and returns 422 for both, telling them apart with `reason`. They need different
// words: someone who searched in Italian did nothing wrong and their topic may well
// be covered, so answering "this doesn't look like a search" would be both wrong and
// unhelpful. An unknown or absent reason falls back to the intent-gate wording, which
// is the older behaviour and still the commoner case.
const refusalDescription = (reason) => {
  if (reason === "unsupported_language")
    return "Solo podemos buscar en castellano, catalán, gallego o euskera. Prueba a escribir tu búsqueda en uno de esos idiomas.";
  return "Esto no parece una búsqueda de intervenciones parlamentarias. Prueba a describir un tema, orador, grupo o fecha.";
};

export const errorDescription = (status, retryAfter, reason) => {
  switch (status) {
    case 422:
      return refusalDescription(reason);
    case 429:
      return rateLimitDescription(retryAfter);
    case 503:
      return "El buscador inteligente no está disponible en este momento";
    default:
      return "Inténtalo de nuevo más tarde";
  }
};
