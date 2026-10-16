import type { DayLog } from '@/features/daylog/types';
import type { Member } from '@/features/members/types';

export const pad = (n: number) => String(n).padStart(2, '0');

export interface CalendarDay {
  date: string;
  day: number;
  logs: DayLog[];
  isBlank: false;
}

export interface BlankDay {
  isBlank: true;
  key: string;
}

export type CalendarCell = CalendarDay | BlankDay;

/**
 * Build a grid of calendar cells for a given month.
 * Week starts on Monday (offset computed accordingly).
 */
export function buildCalendarGrid(
  year: number,
  month: number, // 0-indexed
  logs: DayLog[],
  filterMemberId: string | 'all',
): CalendarCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday start

  const filteredLogs = filterMemberId === 'all'
    ? logs
    : logs.filter((l) => l.memberId === filterMemberId);

  const byDate: Record<string, DayLog[]> = {};
  for (const l of filteredLogs) {
    (byDate[l.date] ??= []).push(l);
  }

  const cells: CalendarCell[] = [];

  for (let i = 0; i < offset; i++) {
    cells.push({ isBlank: true, key: `blank-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${pad(month + 1)}-${pad(d)}`;
    cells.push({ date, day: d, logs: byDate[date] ?? [], isBlank: false });
  }

  return cells;
}

/** Get the CSS-compatible color for a day cell based on its logs. */
export function getDayColor(
  logs: DayLog[],
  filterMemberId: string | 'all',
  memberMap: Record<string, Member>,
): { bg: string; dots: Array<{ color: string; memberId: string }> } {
  if (logs.length === 0) return { bg: 'var(--color-unrecorded)', dots: [] };

  if (filterMemberId !== 'all') {
    const log = logs[0];
    if (log.status === 'sehat') return { bg: 'var(--color-sev-sehat)', dots: [] };
    const sevColors: Record<string, string> = {
      ringan: 'var(--color-sev-ringan)',
      sedang: 'var(--color-sev-sedang)',
      parah: 'var(--color-sev-parah)',
    };
    return { bg: sevColors[log.severity ?? 'ringan'], dots: [] };
  }

  // All-member mode: show dots for sick members
  const sickLogs = logs.filter((l) => l.status === 'sakit');
  const hasSehat = logs.some((l) => l.status === 'sehat');
  const bg = hasSehat && sickLogs.length === 0
    ? 'var(--color-sev-sehat)'
    : sickLogs.length > 0
      ? 'var(--color-unrecorded)'
      : 'var(--color-unrecorded)';

  const dots = sickLogs.map((l) => ({
    color: memberMap[l.memberId]?.color ?? '#999',
    memberId: l.memberId,
  }));

  return { bg, dots };
}
