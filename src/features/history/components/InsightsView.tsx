import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { calculateHealthInsights } from '../insights';
import { EmptyState } from '@/shared/ui/EmptyState';
import type { DayLog } from '@/features/daylog/types';
import type { Episode } from '@/features/episodes/types';
import type { Member } from '@/features/members/types';

interface InsightsViewProps {
  logs: DayLog[];
  episodes: Episode[];
  members: Member[];
  today: string;
  loading: boolean;
  error: Error | null;
}

function trendText(current: number, previous: number): string {
  const difference = current - previous;
  if (difference === 0) return 'Sama dengan 30 hari sebelumnya.';
  const direction = difference > 0 ? 'lebih banyak' : 'lebih sedikit';
  return `${Math.abs(difference)} ${direction} dari 30 hari sebelumnya.`;
}

export function InsightsView({
  logs,
  episodes,
  members,
  today,
  loading,
  error,
}: InsightsViewProps) {
  const insight = useMemo(
    () => calculateHealthInsights(logs, episodes, members, today),
    [episodes, logs, members, today],
  );

  if (loading) {
    return <p className="py-8 text-center text-sm text-ink-muted">Menghitung insight...</p>;
  }
  if (error) {
    return <p className="py-8 text-center text-sm text-sev-parah">Insight gagal dimuat.</p>;
  }
  if (
    insight.sickDays90 === 0
    && insight.recentEpisodes === 0
    && insight.openEpisodes === 0
  ) {
    return (
      <EmptyState
        message="Belum ada catatan sakit dalam 90 hari terakhir."
        icon={<Activity size={32} />}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius-card)] bg-primary-soft p-5">
        <p className="text-sm font-semibold text-primary">30 hari terakhir</p>
        <p className="mt-1 text-3xl font-bold text-ink">{insight.sickDays30}</p>
        <p className="text-sm text-ink">catatan sakit</p>
        <p className="mt-2 text-xs text-ink-muted">
          {trendText(insight.sickDays30, insight.previousSickDays30)}
        </p>
      </section>

      <section
        className={
          'grid grid-cols-2 overflow-hidden rounded-[var(--radius-card)] '
          + 'bg-surface shadow-sm'
        }
      >
        <div className="border-b border-r border-line p-4">
          <p className="text-2xl font-bold text-ink">{insight.sickDays90}</p>
          <p className="text-xs text-ink-muted">Catatan sakit · 90 hari</p>
        </div>
        <div className="border-b border-line p-4">
          <p className="text-2xl font-bold text-ink">{insight.recentEpisodes}</p>
          <p className="text-xs text-ink-muted">Episode baru · 90 hari</p>
        </div>
        <div className="border-r border-line p-4">
          <p className="text-2xl font-bold text-ink">
            {insight.averageDurationDays ?? '–'}
          </p>
          <p className="text-xs text-ink-muted">Rata-rata hari per episode selesai</p>
        </div>
        <div className="p-4">
          <p className="text-2xl font-bold text-ink">{insight.openEpisodes}</p>
          <p className="text-xs text-ink-muted">Sedang berlangsung</p>
        </div>
      </section>

      <section
        className="divide-y divide-line rounded-[var(--radius-card)] bg-surface px-4 shadow-sm"
      >
        <div className="py-4">
          <p className="text-xs text-ink-muted">Paling banyak catatan sakit</p>
          <p className="mt-0.5 font-semibold text-ink">{insight.topMemberName ?? 'Belum ada'}</p>
        </div>
        <div className="py-4">
          <p className="text-xs text-ink-muted">Gejala paling sering</p>
          <p className="mt-0.5 font-semibold text-ink">{insight.topSymptom ?? 'Belum ada'}</p>
        </div>
      </section>

      <p className="text-xs text-ink-muted">
        Insight bersifat deskriptif berdasarkan catatan keluarga, bukan diagnosis medis.
      </p>
    </div>
  );
}
