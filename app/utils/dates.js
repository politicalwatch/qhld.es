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
