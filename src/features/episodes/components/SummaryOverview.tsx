import { RELATION_LABELS } from '@/shared/constants/labels';
import { formatLocalDate } from '@/shared/lib/date';
import type { Episode } from '../types';
import type { Member } from '@/features/members/types';

interface SummaryOverviewProps {
  familyName: string;
  member: Member;
  episode: Episode;
  effectiveEndDate: string;
  durationDays: number;
}

export function SummaryOverview({
  familyName,
  member,
  episode,
  effectiveEndDate,
  durationDays,
}: SummaryOverviewProps) {
  return (
    <section className="border-b border-line pb-5">
      <p className="text-sm text-ink-muted">{familyName}</p>
      <h1 className="mt-1 text-2xl font-bold text-ink">Ringkasan kesehatan</h1>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <p className="text-xs text-ink-muted">Pasien</p>
          <p className="font-semibold text-ink">{member.name}</p>
          <p className="text-xs text-ink-muted">{RELATION_LABELS[member.relation]}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Keluhan/penyakit</p>
          <p className="font-semibold text-ink">{episode.illness}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-ink-muted">Periode</p>
          <p className="font-medium text-ink">
            {formatLocalDate(episode.startDate)} –{' '}
            {episode.endDate ? formatLocalDate(episode.endDate) : 'masih berlangsung'}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            {durationDays} hari sampai {formatLocalDate(effectiveEndDate)}
          </p>
        </div>
      </div>
    </section>
  );
}
