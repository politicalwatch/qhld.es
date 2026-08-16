import { describe, expect, it } from 'vitest';

import { errorDescription } from '../../app/utils/searchError.js';

// The message a failed search puts in the toast. It is the only channel the search
// box has, so each failure has to say what to do next.
describe('errorDescription', () => {
  it('tells a user who searched in an unserved language which languages work', () => {
    const message = errorDescription(422, NaN, 'unsupported_language');

    expect(message).toContain('castellano');
    expect(message).toContain('euskera');
    // They did nothing wrong, so they must NOT be told their query was not a search.
    expect(message).not.toContain('no parece una búsqueda');
  });

  it('keeps the intent-gate wording for a query that was not a search', () => {
    expect(errorDescription(422, NaN, 'not_a_speech_search')).toContain(
      'no parece una búsqueda'
    );
  });

  it('falls back to the intent-gate wording when no reason is given', () => {
    // An older backend, or a proxy that dropped the body: the commoner refusal is
    // the safer guess, and it never claims anything about the user's language.
    expect(errorDescription(422, NaN, undefined)).toContain('no parece una búsqueda');
    expect(errorDescription(422, NaN, 'something_new')).toContain('no parece una búsqueda');
  });

  it('still reports rate limits and outages', () => {
    expect(errorDescription(429, 120)).toContain('2 minutos');
    expect(errorDescription(503, NaN)).toContain('no está disponible');
    expect(errorDescription(500, NaN)).toContain('más tarde');
  });

  it('does not let a reason leak into a non-422 message', () => {
    expect(errorDescription(503, NaN, 'unsupported_language')).toContain(
      'no está disponible'
    );
  });
});
