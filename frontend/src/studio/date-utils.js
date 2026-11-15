export const parseDay = (value) => new Date(`${value}T12:00:00Z`);
export const formatDay = (date) => date.toISOString().slice(0, 10);
export function addDays(value, amount) {
  const date = parseDay(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDay(date);
}
export function shiftMonth(value, amount) {
  const date = parseDay(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12)).getUTCDate();
  date.setUTCDate(Math.min(day, end));
  return formatDay(date);
}
export function monthCells(month) {
  const first = `${month.slice(0, 7)}-01`;
  const offset = (parseDay(first).getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => addDays(first, index - offset));
}
export const clampDay = (value, min, max) => min && value < min ? min : max && value > max ? max : value;
