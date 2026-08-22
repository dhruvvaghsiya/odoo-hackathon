const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Format date as "12 JUN 2026" (editorial travel style)
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format date as "12 June" (no year)
 */
export function formatDateDay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_FULL[d.getMonth()]}`;
}

/**
 * Format date range as "12 JUN — 18 JUN"
 */
export function formatDateRange(startStr, endStr) {
  if (!startStr && !endStr) return '';
  if (!startStr) return formatDateShort(endStr);
  if (!endStr) return formatDateShort(startStr);
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getDate()} — ${e.getDate()} ${MONTH_SHORT[s.getMonth()]} ${s.getFullYear()}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} ${MONTH_SHORT[s.getMonth()]} — ${e.getDate()} ${MONTH_SHORT[e.getMonth()]} ${s.getFullYear()}`;
  }
  return `${formatDateShort(startStr)} — ${formatDateShort(endStr)}`;
}

/**
 * Format date as "15 JUNE" for timeline headers
 */
export function formatDateEditorial(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_FULL[d.getMonth()].toUpperCase()}`;
}

/**
 * Days until a date from today
 */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

/**
 * Format time string "HH:MM:SS" → "09:00"
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

/**
 * Format as input date value "YYYY-MM-DD"
 */
export function toInputDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}
