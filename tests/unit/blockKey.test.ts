import { describe, expect, it } from 'vitest';

import { blockKey } from '../../app/utils/speechText.js';

// A speech given mostly in Spanish whose co-official passage the Diario also printed in
// Spanish: two blocks, both `es`. Everything on the intervention page — the transcript
// tabs, the search highlights, the subtitle tracks — used to key on the language alone,
// which collapses these two into one.
const AS_DELIVERED = { lang: 'es', original: true, langs: ['es', 'eu'] };
const RENDERED = { lang: 'es', original: false, langs: ['es'] };

describe('blockKey', () => {
  it('separates two blocks of the same language', () => {
    expect(blockKey(AS_DELIVERED)).not.toBe(blockKey(RENDERED));
  });

  it('is the same for a speech block and for its subtitle track', () => {
    // The page matches one against the other, so they have to agree exactly — the track
    // carries `lang` and `original` and nothing else of the block.
    expect(blockKey({ lang: 'es', original: false })).toBe(blockKey(RENDERED));
  });

  it('treats a missing flag as as-delivered', () => {
    // What an older stored block looks like: `original` present, `langs` not.
    expect(blockKey({ lang: 'gl' })).toBe(blockKey({ lang: 'gl', original: true }));
  });

  it('has nothing to name when there is no block', () => {
    expect(blockKey(null)).toBeNull();
    expect(blockKey(undefined)).toBeNull();
    expect(blockKey({})).toBeNull();
  });

  it('still separates the ordinary co-official pair', () => {
    expect(blockKey({ lang: 'gl', original: true })).not.toBe(
      blockKey({ lang: 'es', original: false })
    );
  });
});
