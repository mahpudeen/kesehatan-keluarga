import { MONTHS, WEEKDAYS_SHORT } from '@/shared/constants/labels';
import { IconButton } from '@/shared/ui/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildCalendarGrid, getDayColor, pad } from '../calendar';
import { cn } from '@/shared/lib/cn';
import type { DayLog } from '@/features/daylog/types';
import type { Member } from '@/features/members/types';

interface CalendarGridProps {
  year: number;
  month: number;
  logs: DayLog[];
  filterMemberId: string;
  members: Member[];
  selected: string | null;
  onSelectDate: (date: string) => void;
  onShift: (delta: number) => void;
  today: string;
}

export function CalendarGrid({
  year,
  month,
  logs,
  filterMemberId,
  members,
  selected,
  onSelectDate,
  onShift,
  today,
}: CalendarGridProps) {
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
  const cells = buildCalendarGrid(year, month, logs, filterMemberId);

  return (
    <div className="bg-surface rounded-[var(--radius-card)] shadow-sm overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <IconButton label="Bulan sebelumnya" onClick={() => onShift(-1)}>
          <ChevronLeft size={20} />
        </IconButton>
        <p className="font-semibold text-ink text-sm">
          {MONTHS[month]} {year}
        </p>
        <IconButton label="Bulan berikutnya" onClick={() => onShift(1)}>
          <ChevronRight size={20} />
        </IconButton>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-2 pt-2 text-center">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="text-xs text-ink-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 px-2 pb-3">
        {cells.map((cell) => {
          if (cell.isBlank) return <div key={cell.key} aria-hidden="true" />;

          const { bg, dots } = getDayColor(cell.logs, filterMemberId, memberMap);
          const isToday = cell.date === today;
          const isSelected = cell.date === selected;
          const isFuture = cell.date > today;

          return (
            <button
              key={cell.date}
              id={`cal-day-${cell.date}`}
              onClick={() => !isFuture && onSelectDate(cell.date)}
              disabled={isFuture}
              aria-label={`${cell.date}${isToday ? ', hari ini' : ''}`}
              aria-pressed={isSelected}
              className={cn(
                'relative flex flex-col items-center justify-center aspect-square rounded-lg text-xs transition-all',
                isFuture ? 'opacity-30 cursor-default' : 'cursor-pointer active:scale-90',
                isSelected && 'ring-2 ring-primary ring-offset-1',
                isToday && !isSelected && 'ring-2 ring-ink ring-offset-1',
              )}
              style={{ backgroundColor: bg }}
            >
              <span
                className={cn(
                  'font-medium leading-none',
                  bg === 'var(--color-unrecorded)' || bg === 'var(--color-sev-ringan)'
                    ? 'text-ink'
                    : 'text-white',
                )}
              >
                {cell.day}
              </span>
              {/* Dots for sick members in all-member mode */}
              {dots.length > 0 && (
                <span className="flex gap-0.5 mt-0.5">
                  {dots.slice(0, 4).map((dot) => (
                    <span
                      key={dot.memberId}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: dot.color }}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted border-t border-line pt-3">
        {[
          { color: 'var(--color-sev-sehat)', label: 'Sehat' },
          { color: 'var(--color-sev-ringan)', label: 'Ringan' },
          { color: 'var(--color-sev-sedang)', label: 'Sedang' },
          { color: 'var(--color-sev-parah)', label: 'Parah' },
          { color: 'var(--color-unrecorded)', label: 'Belum dicatat', border: true },
        ].map(({ color, label, border }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className={cn('w-3 h-3 rounded-sm flex-shrink-0', border && 'border border-line')}
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export { pad };
