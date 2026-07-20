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
