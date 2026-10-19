import { formatLocalDate } from '@/shared/lib/date';
import { SeverityBadge } from '@/shared/ui/SeverityBadge';
import type { DayLog } from '@/features/daylog/types';

interface DailyLogSummaryProps {
  logs: DayLog[];
}

export function DailyLogSummary({ logs }: DailyLogSummaryProps) {
  return (
    <section>
      <h2 className="text-base font-bold text-ink mb-3">Catatan harian</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ada catatan harian untuk episode ini.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {logs.map((log) => (
            <div key={log.id} className="py-3 text-sm print-avoid-break">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">{formatLocalDate(log.date)}</p>
                {log.severity && <SeverityBadge severity={log.severity} />}
              </div>
              {log.symptoms && log.symptoms.length > 0 && (
                <p className="mt-1 text-ink">Gejala: {log.symptoms.join(', ')}</p>
              )}
              {log.note && <p className="mt-1 text-ink-muted">Catatan: {log.note}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
