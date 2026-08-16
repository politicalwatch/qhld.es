// Locate search-highlight passages within a speech transcript block.
//
// The `/speeches/search` highlights are Qdrant chunks — `" ".join(sentences)`
// of a language block — so every run of whitespace (including the transcript's
// `\n\n` paragraph breaks) is collapsed to a single space. A raw `indexOf`
// therefore fails at paragraph boundaries; we normalise whitespace on both
// sides, match exactly, then map the hit back to original block offsets so the
// caller can wrap the real text (breaks and all).

const isSpace = (ch) => /\s/.test(ch);

// Collapse whitespace runs to single spaces (trimmed), keeping a map back to
// the source: map[i] = index in `text` of the char that produced normalized[i].
export const normalizeWithMap = (text) => {
  const source = text ?? "";
  let normalized = "";
  const map = [];
  let i = 0;
  const n = source.length;

  while (i < n && isSpace(source[i])) i++; // drop leading whitespace
  while (i < n) {
    if (isSpace(source[i])) {
      normalized += " ";
      map.push(i);
      while (i < n && isSpace(source[i])) i++;
    } else {
      normalized += source[i];
      map.push(i);
      i++;
    }
  }
  while (normalized.endsWith(" ")) {
    normalized = normalized.slice(0, -1);
    map.pop();
  }
  return { normalized, map };
};

// Locate each chunk in one block. Returns original-offset ranges for the chunks
// that match this block (chunks belonging to another language block are simply
// not found here); unmatched chunks are skipped.
//
// → [{ chunkIndex, start, end }] where [start, end) indexes into `blockText`.
export const locateHighlights = (blockText, chunks = []) => {
  if (!blockText || !chunks.length) return [];
  const { normalized, map } = normalizeWithMap(blockText);
  const found = [];
  chunks.forEach((chunk, chunkIndex) => {
    const needle = (chunk ?? "").replace(/\s+/g, " ").trim();
    if (!needle) return;
    const at = normalized.indexOf(needle);
    if (at === -1) return;
    found.push({
      chunkIndex,
      start: map[at],
      end: map[at + needle.length - 1] + 1,
    });
  });
  return found;
};

// Which match the panel marks as active as the reader scrolls.
//
// `hlId`s run in document order, so the topmost anchor on screen normally wins.
// A match the reader CHOSE outranks that until they scroll away from it, for two
// reasons that compound: jumping to a match scrolls smoothly, travelling past
// every match in between, and the chunks located above overlap (each carries
// whole sentences of the one before it), so two anchors routinely share the
// viewport. Left to the plain topmost rule, clicking the fifth match lights up
// the fourth — either mid-flight or on arrival.
//
// `pinned` is that choice and `pinnedSeen` records whether it has actually come
// into view yet: until it has, the matches scrolled past are ignored rather than
// allowed to steal the highlight; once it has been seen and left again, the pin
// is dropped and the spy resumes.
//
// Pure so the rule can be tested without a viewport: takes the spy state and the
// anchors on screen, returns the next state.
export const activeHighlight = (state, onScreen = []) => {
  const seen = new Set(onScreen);
  const { current = null, pinned = null, pinnedSeen = false } = state ?? {};
  if (pinned !== null) {
    if (seen.has(pinned)) return { current: pinned, pinned, pinnedSeen: true };
    if (!pinnedSeen) return { current, pinned, pinnedSeen };
  }
  if (!seen.size) return { current, pinned: null, pinnedSeen: false };
  return { current: Math.min(...onScreen), pinned: null, pinnedSeen: false };
};
