import config from "@/config";

// Brand colour for a parliamentary party abbreviation (e.g. "PSOE", "VOX").
// Falls back to the mint brand colour when the party is unknown/absent —
// mirrors DeputyCard's default. Used to group-code speaker avatars, rings,
// timeline node dots and card borders across the speeches feature.
export const partyColor = (partyName) =>
  (partyName && config.STYLES.parties[partyName]?.color) || "#a3d5c8";
