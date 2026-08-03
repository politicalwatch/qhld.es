import { describe, expect, it } from 'vitest';

import {
  COMMENT_MAX_LENGTH,
  RATING_REASONS,
  buildRatingPayload,
  isLowRating,
  isSubmittable,
} from '../../shared/utils/searchRating.js';

const RESULTS = [
  { speech: { id: 'sp-1' } },
  { speech: { id: 'sp-2' } },
];

// A realistic meta: the parser resolved a topic but not the person named.
const QUERY_META = {
  semantic_query: 'Sáhara',
  filters: {},
  browse: false,
  unresolved: [{ field: 'speaker', value: 'Tesh Sidi', blocking: true }],
};

const build = (overrides = {}) =>
  buildRatingPayload({
    rating: 2,
    reasons: ['persona_no_reconocida'],
    comment: 'No encuentra a esta diputada',
    query: 'intervenciones de Tesh Sidi sobre el Sáhara',
    queryMeta: QUERY_META,
    results: RESULTS,
    corpus: '2026-08-03T04:12:00',
    ...overrides,
  });

describe('isSubmittable', () => {
  it('needs a star to have been picked', () => {
    expect(isSubmittable({ rating: null })).toBe(false);
    expect(isSubmittable({ rating: 0 })).toBe(false);
    expect(isSubmittable({ rating: 1 })).toBe(true);
    expect(isSubmittable({ rating: 5 })).toBe(true);
  });

  it('rejects scores off the scale', () => {
    expect(isSubmittable({ rating: 6 })).toBe(false);
    expect(isSubmittable({ rating: 2.5 })).toBe(false);
  });
});

describe('isLowRating', () => {
  it('asks what went wrong at three stars and below', () => {
    expect(isLowRating(1)).toBe(true);
    expect(isLowRating(3)).toBe(true);
    expect(isLowRating(4)).toBe(false);
    expect(isLowRating(5)).toBe(false);
  });
});

describe('buildRatingPayload', () => {
  it('passes query_meta through whole', () => {
    // `unresolved` is the reason this is stored at all — flattening or dropping it
    // would leave a complaint with nothing actionable attached.
    expect(build().query_meta).toEqual(QUERY_META);
  });

  it('collects the ids of the results that were on screen', () => {
    expect(build().result_ids).toEqual(['sp-1', 'sp-2']);
  });

  it('skips results with no id rather than sending holes', () => {
    const results = [{ speech: { id: 'sp-1' } }, { speech: {} }, {}];
    expect(build({ results }).result_ids).toEqual(['sp-1']);
  });

  it('does not send a count the backend can derive', () => {
    expect(build()).not.toHaveProperty('results_count');
  });

  it('keeps the reasons picked on a low score', () => {
    expect(build({ rating: 3, reasons: ['fechas_mal'] }).reasons).toEqual(['fechas_mal']);
  });

  it('drops reasons and comment once the score is no longer low', () => {
    // The chips and the box are hidden above the threshold but their state survives, so
    // raising the score after picking a reason must not smuggle it through.
    const payload = build({ rating: 5 });
    expect(payload.reasons).toEqual([]);
    expect(payload).not.toHaveProperty('comment');
  });

  it('ignores reasons it does not recognise', () => {
    const reasons = ['persona_no_reconocida', 'inventado'];
    expect(build({ reasons }).reasons).toEqual(['persona_no_reconocida']);
  });

  it('trims the comment and omits it when blank', () => {
    expect(build({ comment: '  vale  ' }).comment).toBe('vale');
    expect(build({ comment: '   ' })).not.toHaveProperty('comment');
    expect(build({ comment: '' })).not.toHaveProperty('comment');
  });

  it('truncates an overlong comment to the advertised limit', () => {
    const payload = build({ comment: 'x'.repeat(COMMENT_MAX_LENGTH + 50) });
    expect(payload.comment).toHaveLength(COMMENT_MAX_LENGTH);
  });

  it('records the corpus being judged, and omits it when unknown', () => {
    expect(build().corpus).toBe('2026-08-03T04:12:00');
    expect(build({ corpus: null })).not.toHaveProperty('corpus');
  });

  it('tolerates a missing meta and empty results', () => {
    const payload = buildRatingPayload({ rating: 4, query: 'vivienda' });
    expect(payload).toEqual({
      rating: 4,
      query: 'vivienda',
      query_meta: {},
      reasons: [],
      result_ids: [],
    });
  });
});

describe('RATING_REASONS', () => {
  it('has unique slugs', () => {
    const slugs = RATING_REASONS.map((reason) => reason.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('stays within the cap the backend enforces on the list', () => {
    expect(RATING_REASONS.length).toBeLessThanOrEqual(10);
  });
});
