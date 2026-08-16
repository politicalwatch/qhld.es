import { describe, expect, it } from 'vitest';

import { activeHighlight } from '../../app/utils/highlightMatch.js';

// Which match the highlights panel marks as active while the reader scrolls.
// `hlId`s run in document order, and only the active transcript's anchors are in
// the DOM. `pinned` is a match the reader jumped to deliberately.

const spy = (over = {}) => ({
  current: null,
  pinned: null,
  pinnedSeen: false,
  ...over,
});

describe('activeHighlight', () => {
  it('marks the topmost match on screen', () => {
    expect(activeHighlight(spy(), [3, 4, 5]).current).toBe(3);
  });

  it('keeps the current match when nothing is on screen', () => {
    // Between two matches the panel should not go blank.
    expect(activeHighlight(spy({ current: 4 }), []).current).toBe(4);
  });

  it('has no active match before anything has been seen', () => {
    expect(activeHighlight(spy(), []).current).toBe(null);
  });

  describe('a match the reader jumped to', () => {
    it('is ignored while it is still scrolling into view', () => {
      // The bug this guards, part one: the smooth scroll travels past the
      // matches in between, and any of them would otherwise grab the highlight.
      const next = activeHighlight(spy({ current: 4, pinned: 4 }), [1, 2]);
      expect(next.current).toBe(4);
      expect(next.pinnedSeen).toBe(false);
    });

    it('wins over the topmost once it arrives', () => {
      // Part two: passages overlap, so the fourth match shares the viewport with
      // the fifth. Plain "topmost wins" answered a click on the fifth with the
      // fourth.
      const next = activeHighlight(spy({ current: 4, pinned: 4 }), [3, 4]);
      expect(next.current).toBe(4);
      expect(next.pinnedSeen).toBe(true);
    });

    it('stays active while the reader lingers on it', () => {
      const next = activeHighlight(
        spy({ current: 4, pinned: 4, pinnedSeen: true }),
        [3, 4]
      );
      expect(next.current).toBe(4);
    });

    it('lets go once the reader scrolls past it', () => {
      const next = activeHighlight(
        spy({ current: 4, pinned: 4, pinnedSeen: true }),
        [5, 6]
      );
      expect(next.current).toBe(5);
      expect(next.pinned).toBe(null);
    });

    it('does not strand the panel when the pin leaves with nothing else in view', () => {
      const next = activeHighlight(
        spy({ current: 4, pinned: 4, pinnedSeen: true }),
        []
      );
      expect(next.current).toBe(4);
      expect(next.pinned).toBe(null);
    });
  });
});
