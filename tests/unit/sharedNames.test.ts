import { describe, expect, it } from 'vitest';

import { sharedNameOptions } from '../../app/utils/sharedNames.js';

// "que ha dicho sánchez" — seven deputies carry Sánchez as a first surname, so the search
// filtered on all of them and only the user can say which they meant.
const SHARED = {
  field: 'speaker',
  value: 'Sánchez',
  chosen: 'Sánchez Pérez-Castejón, Pedro',
  tied: ['Sánchez Pérez-Castejón, Pedro', 'Sánchez Serna, Javier'],
  kept: ['Sánchez Pérez-Castejón, Pedro', 'Sánchez Serna, Javier'],
};

// "Montero" collided but the first surname identified her, so the user never saw a choice.
const SETTLED = {
  field: 'speaker',
  value: 'Montero',
  chosen: 'Montero Cuadrado, María Jesús',
  tied: ['Montero Cuadrado, María Jesús', 'Vaquero Montero, Maribel'],
  kept: ['Montero Cuadrado, María Jesús'],
};

describe('sharedNameOptions', () => {
  it('offers a name the search could not narrow', () => {
    expect(sharedNameOptions({ ambiguous: [SHARED] })).toEqual([SHARED]);
  });

  it('stays quiet when the surname identified one person', () => {
    expect(sharedNameOptions({ ambiguous: [SETTLED] })).toEqual([]);
  });

  it('keeps only the unnarrowed ones when a query has both', () => {
    expect(sharedNameOptions({ ambiguous: [SETTLED, SHARED] })).toEqual([SHARED]);
  });

  it('preserves the order it was given, which puts office holders first', () => {
    const [item] = sharedNameOptions({ ambiguous: [SHARED] });
    expect(item.kept[0]).toBe('Sánchez Pérez-Castejón, Pedro');
  });

  it('tolerates a meta with no ambiguity, and no meta at all', () => {
    expect(sharedNameOptions({ ambiguous: [] })).toEqual([]);
    expect(sharedNameOptions({})).toEqual([]);
    expect(sharedNameOptions(null)).toEqual([]);
  });

  it('ignores an entry with no kept list rather than throwing', () => {
    expect(sharedNameOptions({ ambiguous: [{ field: 'speaker', value: 'X' }] })).toEqual([]);
  });
});
