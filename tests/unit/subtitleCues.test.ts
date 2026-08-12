import { describe, expect, it } from 'vitest';

import {
  cueForOffset,
  formatClock,
  locateCues,
  parseVtt,
} from '../../app/utils/subtitleCues.js';

// The shape the backend renders: header, blank line, then numbered cues.
const TRACK = `WEBVTT

1
00:00:03.420 --> 00:00:07.100
Muchas gracias, señora presidenta.

2
00:00:07.500 --> 00:00:12.000
Señorías, el diagnóstico de la silicosis
sigue creciendo.
`;

describe('parseVtt', () => {
  it('reads the cues and skips the header', () => {
    expect(parseVtt(TRACK)).toEqual([
      { start: 3.42, end: 7.1, text: 'Muchas gracias, señora presidenta.' },
      {
        start: 7.5,
        end: 12,
        text: 'Señorías, el diagnóstico de la silicosis sigue creciendo.',
      },
    ]);
  });

  it('undoes the escaping the renderer applies to cue markup', () => {
    const [cue] = parseVtt(
      'WEBVTT\n\n1\n00:00:01.000 --> 00:00:02.000\nPSOE &amp; PP &lt;sic&gt;'
    );
    expect(cue.text).toBe('PSOE & PP <sic>');
  });

  it('accepts a timestamp written without the hours', () => {
    const [cue] = parseVtt('WEBVTT\n\n01:30.500 --> 01:34.000\nUna frase.');
    expect(cue).toEqual({ start: 90.5, end: 94, text: 'Una frase.' });
  });

  it('drops what it cannot read rather than guessing', () => {
    const cues = parseVtt(
      'WEBVTT\n\nNOTE una anotación\n\n1\n00:00:01.000 --> ??\nSin tiempos\n\n' +
        '2\n00:00:05.000 --> 00:00:06.000\n\n\n' +
        '3\n00:00:09.000 --> 00:00:10.000\nLa buena.'
    );
    expect(cues).toEqual([{ start: 9, end: 10, text: 'La buena.' }]);
  });

  it('has nothing to say about an empty track', () => {
    expect(parseVtt('')).toEqual([]);
    expect(parseVtt(null)).toEqual([]);
  });
});

describe('locateCues', () => {
  // The stored transcript keeps the Diario's paragraph breaks; a cue body has had
  // every whitespace run collapsed, so it never matches the block literally.
  const BLOCK =
    'Muchas gracias, señora presidenta.\n\nSeñorías, el diagnóstico de la\nsilicosis sigue creciendo.';

  it('maps a cue back onto the original offsets, breaks and all', () => {
    const located = locateCues(BLOCK, parseVtt(TRACK));
    expect(located).toHaveLength(2);
    expect(BLOCK.slice(located[0].charStart, located[0].charEnd)).toBe(
      'Muchas gracias, señora presidenta.'
    );
    expect(BLOCK.slice(located[1].charStart, located[1].charEnd)).toBe(
      'Señorías, el diagnóstico de la\nsilicosis sigue creciendo.'
    );
    expect(located[0].start).toBe(3.42);
  });

  it('resolves a repeated phrase by where the cue sits, not by first sight', () => {
    const block = 'Gracias, presidenta. Y una cosa más. Gracias, presidenta.';
    const cues = [
      { start: 0, end: 1, text: 'Gracias, presidenta.' },
      { start: 1, end: 2, text: 'Y una cosa más.' },
      { start: 2, end: 3, text: 'Gracias, presidenta.' },
    ];
    const located = locateCues(block, cues);
    expect(located.map((cue) => cue.charStart)).toEqual([0, 21, 37]);
  });

  it('drops a cue whose words are not in this block', () => {
    const located = locateCues(BLOCK, [
      { start: 0, end: 1, text: 'Muchas gracias, señora presidenta.' },
      { start: 1, end: 2, text: 'Eskerrik asko, presidente andrea.' },
    ]);
    expect(located).toHaveLength(1);
  });

  it('has nothing to locate without a block or without cues', () => {
    expect(locateCues('', parseVtt(TRACK))).toEqual([]);
    expect(locateCues(BLOCK, [])).toEqual([]);
  });
});

describe('cueForOffset', () => {
  const CUES = [
    { charStart: 0, charEnd: 10, start: 1 },
    { charStart: 12, charEnd: 20, start: 2 },
    { charStart: 25, charEnd: 30, start: 3 },
  ];

  it('finds the cue covering the offset', () => {
    expect(cueForOffset(CUES, 0)?.start).toBe(1);
    expect(cueForOffset(CUES, 9)?.start).toBe(1);
    expect(cueForOffset(CUES, 15)?.start).toBe(2);
    expect(cueForOffset(CUES, 29)?.start).toBe(3);
  });

  it('rounds forward when the offset falls between two cues', () => {
    // The whitespace between cues belongs to neither, and a stage direction is
    // captioned by nobody — both land here, and both want the passage that follows.
    expect(cueForOffset(CUES, 10)?.start).toBe(2);
    expect(cueForOffset(CUES, 22)?.start).toBe(3);
  });

  it('gives nothing past the last cue', () => {
    expect(cueForOffset(CUES, 30)).toBeNull();
    expect(cueForOffset(CUES, 999)).toBeNull();
  });

  it('is safe with no cues at all', () => {
    expect(cueForOffset([], 5)).toBeNull();
    expect(cueForOffset(null, 5)).toBeNull();
  });
});

describe('formatClock', () => {
  it('reads as a player clock', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(9.9)).toBe('0:09');
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(3725)).toBe('1:02:05');
  });

  it('shows a zero rather than NaN before the metadata lands', () => {
    expect(formatClock(NaN)).toBe('0:00');
    expect(formatClock(Infinity)).toBe('0:00');
  });
});
