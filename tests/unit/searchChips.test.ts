import { describe, expect, it } from 'vitest';

import { groupChipLabels, searchChips } from '../../app/utils/searchChips.js';

// "que ha dicho sánchez" — the surname named seven people and the search kept them all.
const AMBIGUOUS = {
  semantic_query: '',
  filters: {
    speaker: [
      'Sánchez Pérez-Castejón, Pedro',
      'Sánchez Díaz, María Carmen',
      'Sánchez Serna, Javier',
    ],
  },
  ambiguous: [
    {
      field: 'speaker',
      value: 'sánchez',
      kept: [
        'Sánchez Pérez-Castejón, Pedro',
        'Sánchez Díaz, María Carmen',
        'Sánchez Serna, Javier',
      ],
    },
  ],
};

describe('searchChips', () => {
  it('counts the people a shared surname matched instead of listing them', () => {
    expect(searchChips(AMBIGUOUS)).toEqual([{ label: 'Orador/a', value: '3 personas' }]);
  });

  it('gives every value of a plain list its own chip, so the separator is not a comma', () => {
    const chips = searchChips({ filters: { group: ['Grupo Socialista', 'Grupo Mixto'] } });
    expect(chips).toEqual([
      { label: 'Grupo', value: 'Grupo Socialista' },
      { label: 'Grupo', value: 'Grupo Mixto' },
    ]);
  });

  it('names the speaker filter without calling them a deputy', () => {
    // Ministers, guests and the chair are speakers too, and none of them is a deputy.
    const [chip] = searchChips({ filters: { speaker: 'Robles Fernández, Margarita' } });
    expect(chip).toEqual({ label: 'Orador/a', value: 'Robles Fernández, Margarita' });
  });

  it('labels every filter the resolver emits', () => {
    const labels = searchChips({
      filters: {
        constituency: 'Sevilla',
        legislature: 15,
        role: 'Ministra de Defensa',
        mentions: 'isabel-diaz-ayuso',
        entities: 'sanidad publica',
        lang: 'gl',
      },
    }).map((chip) => chip.label);
    expect(labels).toEqual([
      'Circunscripción',
      'Legislatura',
      'Rol',
      'Menciona a',
      'Menciona',
      'Idioma',
    ]);
  });

  it('says the language rather than its code', () => {
    expect(searchChips({ filters: { lang: 'eu' } })[0].value).toBe('Euskera');
  });

  it('says a date range in digits a Spanish reader can read', () => {
    const [chip] = searchChips({ filters: { date: { gte: 20240805, lte: 20260805 } } });
    expect(chip).toEqual({ label: 'Fecha', value: '05/08/2024 – 05/08/2026' });
  });

  it('puts the open end of a half-bounded range in the label', () => {
    expect(searchChips({ filters: { date: { gte: 20240805 } } })).toEqual([
      { label: 'Desde', value: '05/08/2024' },
    ]);
    expect(searchChips({ filters: { date: { lte: 20260805 } } })).toEqual([
      { label: 'Hasta', value: '05/08/2026' },
    ]);
  });

  it('says a single day once, not as a range from itself', () => {
    const [chip] = searchChips({ filters: { date: { gte: 20240805, lte: 20240805 } } });
    expect(chip).toEqual({ label: 'Fecha', value: '05/08/2024' });
  });

  it('shows a date it cannot read as it came rather than dropping it', () => {
    expect(searchChips({ filters: { date: 20240805 } })).toEqual([
      { label: 'Fecha', value: '20240805' },
    ]);
  });

  it('names the person behind a mention id', () => {
    // The filter stays the id — only the chip changes. Unslugging it here would lose the
    // accent (Díaz → Diaz), which is why the backend sends the name.
    const chips = searchChips({
      filters: { mentions: 'isabel-diaz-ayuso' },
      labels: { mentions: { 'isabel-diaz-ayuso': 'Díaz Ayuso, Isabel' } },
    });
    expect(chips).toEqual([{ label: 'Menciona a', value: 'Díaz Ayuso, Isabel' }]);
  });

  it('names every person of a several-mention filter, in either mode', () => {
    const labels = {
      mentions: { 'dep-montero': 'Montero Cuadrado, María Jesús', 'dep-abascal': 'Abascal Conde, Santiago' },
    };
    expect(
      searchChips({ filters: { mentions: ['dep-montero', 'dep-abascal'] }, labels })
    ).toEqual([
      { label: 'Menciona a', value: 'Montero Cuadrado, María Jesús' },
      { label: 'Menciona a', value: 'Abascal Conde, Santiago' },
    ]);
    // `all` — every one of them has to be mentioned, so it is one chip, not two searches.
    expect(
      searchChips({ filters: { mentions: { all: ['dep-montero', 'dep-abascal'] } }, labels })
    ).toEqual([
      {
        label: 'Menciona a',
        value: 'Montero Cuadrado, María Jesús, Abascal Conde, Santiago',
      },
    ]);
  });

  it('falls back to the raw value when the backend sent no name for it', () => {
    // An older backend (or a value that needs no translation) — the chip still renders.
    expect(searchChips({ filters: { mentions: 'isabel-diaz-ayuso' } })).toEqual([
      { label: 'Menciona a', value: 'isabel-diaz-ayuso' },
    ]);
  });

  it('puts the topic first, ahead of the filters', () => {
    const chips = searchChips({ semantic_query: 'vivienda', filters: { group: 'Grupo Mixto' } });
    expect(chips[0]).toEqual({ label: 'Tema', value: 'vivienda' });
  });

  it('lists the people when the name was ambiguous but the search narrowed to one', () => {
    // `kept` of one means the surname identified somebody, so nothing is being counted.
    const chips = searchChips({
      filters: { speaker: ['Montero Cuadrado, María Jesús'] },
      ambiguous: [{ field: 'speaker', value: 'montero', kept: ['Montero Cuadrado, María Jesús'] }],
    });
    expect(chips).toEqual([{ label: 'Orador/a', value: 'Montero Cuadrado, María Jesús' }]);
  });

  it('falls back to the raw key for a filter it does not know', () => {
    expect(searchChips({ filters: { future_field: 'x' } })).toEqual([
      { label: 'future_field', value: 'x' },
    ]);
  });

  it('says which group a code means', () => {
    const groups = [{ shortname: 'GS', name: 'Grupo Parlamentario Socialista' }];
    const chips = searchChips({ filters: { group: 'GS' } }, { group: groupChipLabels(groups) });
    expect(chips).toEqual([{ label: 'Grupo', value: 'Socialista' }]);
  });

  it('keeps the code when the groups have not loaded yet', () => {
    // The records arrive with the rest of the reference data; until then, the truth is
    // the code the search actually filters on.
    expect(searchChips({ filters: { group: 'GS' } }, { group: {} })).toEqual([
      { label: 'Grupo', value: 'GS' },
    ]);
  });

  it('lets the backend name a value the client also knows', () => {
    // The backend resolved the filter, so its reading wins over anything looked up here.
    const chips = searchChips(
      { filters: { group: 'GS' }, labels: { group: { GS: 'Socialistas' } } },
      { group: { GS: 'Socialista' } }
    );
    expect(chips).toEqual([{ label: 'Grupo', value: 'Socialistas' }]);
  });

  it('has nothing to show for an empty, absent or malformed meta', () => {
    expect(searchChips({ semantic_query: '', filters: {} })).toEqual([]);
    expect(searchChips({})).toEqual([]);
    expect(searchChips(null)).toEqual([]);
  });
});

describe('groupChipLabels', () => {
  it('drops the prefix the chip label already says', () => {
    // "GRUPO · GRUPO PARLAMENTARIO SOCIALISTA" reads as a stutter.
    expect(
      groupChipLabels([
        { shortname: 'GS', name: 'Grupo Parlamentario Socialista' },
        { shortname: 'GSUMAR', name: 'Grupo Parlamentario Plurinacional SUMAR' },
        { shortname: 'GV (EAJ-PNV)', name: 'Grupo Parlamentario Vasco (EAJ-PNV)' },
      ])
    ).toEqual({
      GS: 'Socialista',
      GSUMAR: 'Plurinacional SUMAR',
      'GV (EAJ-PNV)': 'Vasco (EAJ-PNV)',
    });
  });

  it('leaves a name that does not carry the prefix alone', () => {
    expect(groupChipLabels([{ shortname: 'GX', name: 'Agrupación Independiente' }])).toEqual({
      GX: 'Agrupación Independiente',
    });
  });

  it('ignores rows it cannot use, and no rows at all', () => {
    expect(
      groupChipLabels([{ shortname: 'GS' }, { name: 'Grupo Parlamentario Mixto' }, null])
    ).toEqual({});
    expect(groupChipLabels(undefined)).toEqual({});
  });
});
