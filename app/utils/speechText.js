// Turns a raw speech transcript into renderable segments.
//
// The backend delivers each speech as one unbroken string that mixes the
// spoken words with inline stenographer annotations — "(Aplausos)", "(Un señor
// diputado: A ver)" — and the API separately provides the people detected in
// the text (mentions + interruptions) with their literal `surface_forms`.
//
// parseSpeechText(text, people) → [
//   { type: 'text',       text },
//   { type: 'annotation', text },                        // includes the parens
//   { type: 'mention',    text, personId, isDeputy },
// ]
//
// Annotations are split off first; surface forms are only matched in the
// spoken segments, so a name inside an annotation never double-wraps.

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ANNOTATION_RE = /\([^)]+\)/g;

export const parseSpeechText = (text, people = []) => {
  if (!text) return [];

  // surface form → person, longest form first so "Sánchez Pérez-Castejón"
  // wins over "Sánchez"
  const forms = [];
  for (const person of people) {
    for (const form of person.surface_forms ?? []) {
      if (form) forms.push({ form, person });
    }
  }
  forms.sort((a, b) => b.form.length - a.form.length);

  // \b misbehaves around accented letters, so use letter-lookarounds instead
  const mentionRe = forms.length
    ? new RegExp(
        `(?<![\\p{L}])(${forms.map((f) => escapeRegex(f.form)).join("|")})(?![\\p{L}])`,
        "gu"
      )
    : null;
  const personByForm = new Map(forms.map(({ form, person }) => [form, person]));

  const spokenSegments = (chunk) => {
    if (!mentionRe || !chunk) {
      return chunk ? [{ type: "text", text: chunk }] : [];
    }
    const out = [];
    let last = 0;
    for (const match of chunk.matchAll(mentionRe)) {
      if (match.index > last) {
        out.push({ type: "text", text: chunk.slice(last, match.index) });
      }
      const person = personByForm.get(match[0]);
      out.push({
        type: "mention",
        text: match[0],
        personId: person?.person_id ?? null,
        isDeputy: person?.person_type === "deputy",
      });
      last = match.index + match[0].length;
    }
    if (last < chunk.length) {
      out.push({ type: "text", text: chunk.slice(last) });
    }
    return out;
  };

  const segments = [];
  let last = 0;
  for (const match of text.matchAll(ANNOTATION_RE)) {
    segments.push(...spokenSegments(text.slice(last, match.index)));
    segments.push({ type: "annotation", text: match[0] });
    last = match.index + match[0].length;
  }
  segments.push(...spokenSegments(text.slice(last)));
  return segments;
};

// Build the per-paragraph render model for a transcript block, layering search
// highlights on top of the existing mention/annotation segments.
//
// `ranges` are original-block offsets [{ start, end, hlId }] (from
// locateHighlights, tagged with a document-order id); they may overlap and may
// span `\n\n` paragraph breaks. Each segment from parseSpeechText is subdivided
// at every range boundary so a piece is uniformly inside or outside a
// highlight, and the first piece of each range gets its `anchorId` (the scroll
// target for the jump nav).
//
// buildSpeechParagraphs(blockText, people, ranges) → [
//   [ { type, text, charStart, personId, isDeputy, highlighted, hlIds, anchorId }, ... ],
//   ...
// ]
// `hlIds` lists every range covering the piece (a piece can sit under overlapping
// chunks); `highlighted` is a convenience for `hlIds.length > 0`.
//
// With no ranges this yields one piece per segment (highlighted:false), i.e. the
// same content the plain renderer produced.
export const buildSpeechParagraphs = (blockText, people = [], ranges = []) => {
  const text = blockText ?? "";
  if (!text) return [];

  // paragraph spans (offset-preserving split on blank lines)
  const paras = [];
  const splitRe = /\n{2,}/g;
  let cursor = 0;
  let match;
  while ((match = splitRe.exec(text)) !== null) {
    if (match.index > cursor) paras.push([cursor, match.index]);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) paras.push([cursor, text.length]);

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const idsAt = (pos) =>
    sorted.filter((r) => pos >= r.start && pos < r.end).map((r) => r.hlId);
  const anchorAt = new Map(); // offset → hlId, first range starting there wins
  for (const r of sorted) if (!anchorAt.has(r.start)) anchorAt.set(r.start, r.hlId);

  const result = [];
  for (const [pStart, pEnd] of paras) {
    const paraText = text.slice(pStart, pEnd);
    if (!paraText.trim()) continue;

    const segments = parseSpeechText(paraText, people);
    const pieces = [];
    let offset = pStart;
    for (const segment of segments) {
      const segStart = offset;
      const segEnd = offset + segment.text.length;
      offset = segEnd;

      // cut points inside this segment: its own bounds + any range edge within
      const cuts = new Set([segStart, segEnd]);
      for (const r of sorted) {
        if (r.start > segStart && r.start < segEnd) cuts.add(r.start);
        if (r.end > segStart && r.end < segEnd) cuts.add(r.end);
      }
      const points = [...cuts].sort((a, b) => a - b);
      for (let k = 0; k < points.length - 1; k++) {
        const a = points[k];
        const b = points[k + 1];
        const hlIds = idsAt(a);
        pieces.push({
          type: segment.type,
          text: text.slice(a, b),
          // where this piece starts in the block — the coordinate subtitle cues use,
          // so a click on it can play the video from these words rather than from
          // the start of the passage they belong to
          charStart: a,
          personId: segment.personId ?? null,
          isDeputy: segment.isDeputy ?? false,
          highlighted: hlIds.length > 0,
          hlIds,
          anchorId: anchorAt.has(a) ? anchorAt.get(a) : null,
        });
      }
    }
    result.push(pieces);
  }
  return result;
};
