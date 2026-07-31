// Formats backend integer dates (yyyymmdd, e.g. 20241009) as a long Spanish date.
export const formatDateInt = (value) => {
  const raw = String(value ?? "");
  if (raw.length !== 8) return raw;
  const date = new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// Formats an ISO timestamp (e.g. 2026-07-31T08:12:21Z) as a date and time in
// Spanish parliamentary time. The zone is pinned rather than left to the browser
// so the moment shown is the one the Congress works in, wherever it is read.
export const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  })
    .format(date)
    // es-ES separates date and time with a comma; a plain space reads better in
    // the one-line badge.
    .replace(", ", " ");
};
