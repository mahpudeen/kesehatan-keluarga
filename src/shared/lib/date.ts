// Shared date helpers — always use local YYYY-MM-DD strings, never UTC.

/** Returns today as YYYY-MM-DD in local time. */
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD string as a local Date (midnight local). */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a local date as a human-readable Indonesian string. */
export function formatLocalDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
): string {
  return parseLocalDate(dateStr).toLocaleDateString('id-ID', options);
}

/** Compare two YYYY-MM-DD strings. Returns negative if a < b. */
export function compareDates(a: string, b: string): number {
  return a.localeCompare(b);
}
