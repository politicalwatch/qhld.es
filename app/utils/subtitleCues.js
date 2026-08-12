// Turn a speech's WebVTT track back into cues the page can seek with.
//
// The backend renders the track from stored cue offsets — when each subtitle line
// starts, and which characters of the transcript it covers — but WebVTT has nowhere
// to carry the offsets, so what reaches the browser is times and text only. The
// offsets are what makes a search match seekable: `locateHighlights` already gives a
// match's position in the block, and a cue's position is in the same coordinate
// system, so finding the cue that captions a match is a lookup.
//
// We recover them by locating each cue's text back in the block it was sliced from.
// That works because a cue body IS a slice of the block with its whitespace collapsed
// — the same normalisation search passages are located with — and because cues are
// ordered and non-overlapping, so a forward-only cursor cannot be fooled by a phrase
// that repeats later in the speech. Measured on the aligned dev corpus: 187/187,
// 72/72, 209/209 and 152/152 cues located, no misses.
//
// The alternative was reading `video.textTracks[0].cues` rather than fetching the
// track ourselves. Rejected: `TextTrack.cues` is null while the track's mode is
// "disabled", so a reader who turned captions off would lose seeking along with them.

import { normalizeWithMap } from "./highlightMatch.js";

// A cue body is markup, not text: the renderer escapes these three so that a stray
// "<" cannot open a cue span. Undo them before matching against the transcript.
const VTT_UNESCAPES = [
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&amp;/g, "&"],
];

const unescapeVtt = (body) =>
  VTT_UNESCAPES.reduce((text, [entity, char]) => text.replace(entity, char), body);

// "HH:MM:SS.mmm", or "MM:SS.mmm" — WebVTT allows the hours to be dropped. Ours never
// does, but a parser that only understands its own output breaks on the first track
// it did not write.
const parseTimestamp = (stamp) => {
  const parts = stamp.trim().split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  if (parts.some((part) => part === "" || Number.isNaN(Number(part)))) return null;
  const seconds = parts.reduce((total, part) => total * 60 + Number(part), 0);
  return Number.isFinite(seconds) ? seconds : null;
};

const TIMING_RE = /^([\d:.]+)\s*-->\s*([\d:.]+)/;

// Parse a WebVTT track → [{ start, end, text }] in file order.
//
// Deliberately minimal: no regions, no styling blocks, no cue settings — our tracks
// carry none, and a cue we failed to understand is better dropped than guessed at.
export const parseVtt = (vtt) => {
  const cues = [];
  if (!vtt) return cues;
  for (const block of vtt.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/)) {
    const lines = block.split("\n").filter((line) => line.trim());
    const timingIndex = lines.findIndex((line) => TIMING_RE.test(line));
    if (timingIndex === -1) continue; // the WEBVTT header, NOTE comments, a cue id alone
    const [, from, to] = lines[timingIndex].match(TIMING_RE);
    const start = parseTimestamp(from);
    const end = parseTimestamp(to);
    // A cue can be written over two lines; they are one line of transcript again here.
    const text = unescapeVtt(lines.slice(timingIndex + 1).join(" ")).trim();
    if (start === null || end === null || !text) continue;
    cues.push({ start, end, text });
  }
  return cues;
};

// Give each cue its span in `blockText` → [{ start, end, text, charStart, charEnd }].
//
// A cue that cannot be located is dropped rather than approximated: a wrong offset is
// worse than a missing one, because it would caption one passage by seeking to
// another. Dropping costs only the matches that fall inside that cue.
export const locateCues = (blockText, cues = []) => {
  if (!blockText || !cues.length) return [];
  const { normalized, map } = normalizeWithMap(blockText);
  const located = [];
  let cursor = 0;
  for (const cue of cues) {
    // Searching from the end of the previous cue is what keeps a repeated phrase
    // honest: cue order and transcript order are the same order.
    const at = normalized.indexOf(cue.text, cursor);
    if (at === -1) continue;
    located.push({
      ...cue,
      charStart: map[at],
      charEnd: map[at + cue.text.length - 1] + 1,
    });
    cursor = at + cue.text.length;
  }
  return located;
};

// The cue to seek to for a character offset in the block, or null.
//
// A miss means the offset fell between two cues — in the whitespace that belongs to
// neither, or inside a stage direction, which no cue captions because nobody said it.
// Rounding forward to the next cue plays the passage the reader clicked, where
// rounding back would replay the tail of the one before it.
export const cueForOffset = (cues, offset) => {
  if (!cues?.length || !(offset >= 0)) return null;
  let low = 0;
  let high = cues.length - 1;
  let after = null; // the earliest cue starting past the offset, for the miss case
  while (low <= high) {
    const mid = (low + high) >> 1;
    const cue = cues[mid];
    if (offset < cue.charStart) {
      after = cue;
      high = mid - 1;
    } else if (offset >= cue.charEnd) {
      low = mid + 1;
    } else {
      return cue;
    }
  }
  return after;
};

// Seconds → "m:ss", or "h:mm:ss" once an intervention runs past the hour.
export const formatClock = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
};
