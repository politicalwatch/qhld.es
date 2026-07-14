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
