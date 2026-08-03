// Assembling a rating of a search. Kept out of the component, like `app/utils/status.js`,
// so the rules — which reasons apply, what gets trimmed, what is left out — are testable
// without mounting anything.
//
// Lives in `shared/` rather than `app/utils/` because the nitro route validates against
// the same vocabulary, and it is one contract: a route reaching into `app/` breaks
// Nitro's module resolution, and duplicating the slugs would let the two drift.
//
// The slugs are the stored contract: renaming one splits the analysis of that problem
// into two buckets, silently. The labels are only ever displayed, so they are safe to
// reword.

export const COMMENT_MAX_LENGTH = 500;

// At or below this we ask what went wrong; above it we don't interrupt.
export const LOW_RATING_THRESHOLD = 3;

export const RATING_REASONS = [
  { slug: "persona_no_reconocida", label: "No ha reconocido a la persona" },
  { slug: "falta_alguien", label: "Falta alguien que debería aparecer" },
  { slug: "tema_equivocado", label: "Ha entendido otro tema" },
  { slug: "fechas_mal", label: "Las fechas no cuadran" },
  { slug: "resultados_irrelevantes", label: "Los resultados no son relevantes" },
  { slug: "otro", label: "Otro motivo" },
];

const REASON_SLUGS = new Set(RATING_REASONS.map((reason) => reason.slug));

const isValidRating = (rating) =>
  Number.isInteger(rating) && rating >= 1 && rating <= 5;

/** Whether this score is low enough to ask for reasons and a comment. */
export const isLowRating = (rating) =>
  isValidRating(rating) && rating <= LOW_RATING_THRESHOLD;

/** Nothing to send until a star has been picked. */
export const isSubmittable = ({ rating }) => isValidRating(rating);

/**
 * Build the body posted to `/api/search-rating`.
 *
 * `query_meta` is passed through whole and deliberately: `unresolved` is the list of
 * people the parser couldn't identify, so a low rating sitting next to a non-empty
 * `unresolved` is a NER candidate rather than a vague complaint.
 *
 * Reasons and comment are dropped unless the score is low. They are only ever asked for
 * on a low score, so this keeps a raised score from carrying the chips the user picked
 * while it was still low — and keeps an empty `reasons` on a 5 meaning "not asked"
 * rather than "nothing was wrong".
 *
 * `results_count` is not sent: the backend derives it from `result_ids`, so there is no
 * way for the two to disagree.
 */
export const buildRatingPayload = ({
  rating,
  reasons = [],
  comment = "",
  query = "",
  queryMeta = {},
  results = [],
  corpus = null,
}) => {
  const low = isLowRating(rating);
  const trimmed = low ? (comment ?? "").trim().slice(0, COMMENT_MAX_LENGTH) : "";

  const payload = {
    rating,
    query,
    query_meta: queryMeta ?? {},
    reasons: low ? reasons.filter((slug) => REASON_SLUGS.has(slug)) : [],
    // Mirrors `excludeIds` in the store: a result with no id is no use to us.
    result_ids: results.map((result) => result?.speech?.id).filter(Boolean),
  };
  if (trimmed) payload.comment = trimmed;
  if (corpus) payload.corpus = corpus;
  return payload;
};
