// The "Entendido como" chips: how a parsed query is shown back to the user. Kept out of
// the component, like `sharedNames.js`, so the rule is testable without mounting anything.

// Relative, not "@/utils/…": this module is also imported straight from the unit tests,
// which run without Nuxt's aliases.
import { sharedNameOptions } from "./sharedNames.js";
import { formatDateIntNumeric } from "./dates.js";

// Every filter key the resolver emits (qhld-ai `resolve_entities.py`). "Orador/a", not
// "Diputado/a": the speaker filter also matches ministers, guests and the chair, who are
// not deputies.
const FILTER_LABELS = {
  speaker: "Orador/a",
  group: "Grupo",
  constituency: "Circunscripción",
  legislature: "Legislatura",
  role: "Rol",
  date: "Fecha",
  mentions: "Menciona a",
  entities: "Menciona",
  lang: "Idioma",
};

const LANGUAGES = {
  es: "Castellano",
  ca: "Catalán",
  gl: "Gallego",
  eu: "Euskera",
};

// A filter value as the user should read it. `labels` is the backend's map of the values
// that mean nothing on their own — the person ids a mentions filter holds — to the name
// behind them. Absent (an older backend, or a value that needs no translation) the value
// speaks for itself.
const formatValue = (field, value, labels) => {
  const named = labels?.[field]?.[value];
  if (named) return named;
  if (Array.isArray(value))
    return value.map((item) => formatValue(field, item, labels)).join(", ");
  // `{all: [...]}` — every one of these people must be mentioned.
  if (value && typeof value === "object")
    return Object.values(value)
      .map((item) => formatValue(field, item, labels))
      .join(", ");
  if (field === "lang") return LANGUAGES[value] || String(value);
  return String(value);
};

// The date filter is a bounds object (`{gte, lte}`, either side optional) of yyyymmdd
// integers. The label carries which end is open, so an open-ended range never has to
// invent the bound it does not have.
const dateChip = (bounds) => {
  const from = bounds?.gte ? formatDateIntNumeric(bounds.gte) : null;
  const to = bounds?.lte ? formatDateIntNumeric(bounds.lte) : null;
  if (from && to)
    return { label: "Fecha", value: from === to ? from : `${from} – ${to}` };
  if (from) return { label: "Desde", value: from };
  if (to) return { label: "Hasta", value: to };
  return null;
};

export const searchChips = (queryMeta) => {
  const meta = queryMeta || {};
  if (!meta.semantic_query && !meta.filters) return [];

  // Fields whose value list is long only because a name matched several people. The
  // names are already offered below as pills to narrow with, so the chip counts them
  // instead of printing the same list a second time.
  const ambiguous = new Set(sharedNameOptions(meta).map((item) => item.field));

  const chips = [];
  if (meta.semantic_query) chips.push({ label: "Tema", value: meta.semantic_query });

  Object.entries(meta.filters || {}).forEach(([field, value]) => {
    const label = FILTER_LABELS[field] || field;
    const values = Array.isArray(value) ? value : null;

    // Falls through when the bounds are not the pair we expect, so an unrecognised date
    // is shown as it came rather than silently dropped.
    const dated = field === "date" ? dateChip(value) : null;
    if (dated) {
      chips.push(dated);
      return;
    }
    if (values && ambiguous.has(field)) {
      chips.push({ label, value: `${values.length} personas` });
      return;
    }
    // One chip per value: with several people in a list, the separator would otherwise be
    // the same comma that splits "Apellidos, Nombre".
    if (values) {
      values.forEach((item) =>
        chips.push({ label, value: formatValue(field, item, meta.labels) })
      );
      return;
    }
    chips.push({ label, value: formatValue(field, value, meta.labels) });
  });

  return chips;
};
