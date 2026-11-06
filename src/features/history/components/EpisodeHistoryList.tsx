import { SearchX, Stethoscope } from 'lucide-react';
import { Avatar } from '@/shared/ui/Avatar';
import { EmptyState } from '@/shared/ui/EmptyState';
import type { Episode } from '@/features/episodes/types';
import type { Member } from '@/features/members/types';

interface EpisodeHistoryListProps {
  episodes: Episode[];
  members: Member[];
  filtered: boolean;
  loading: boolean;
  onOpen: (episodeId: string) => void;
}

export function EpisodeHistoryList({
  episodes,
  members,
  filtered,
  loading,
  onOpen,
}: EpisodeHistoryListProps) {
  const memberMap = new Map(members.map((member) => [member.id, member]));

  if (loading) {
    return <p className="py-8 text-center text-sm text-ink-muted">Mencari riwayat...</p>;
  }
  if (episodes.length === 0) {
    return (
      <EmptyState
        message={
          filtered
            ? 'Tidak ada riwayat yang cocok. Ubah pencarian atau filter.'
            : 'Belum ada riwayat penyakit.'
        }
        icon={filtered ? <SearchX size={34} /> : <Stethoscope size={36} />}
      />
    );
  }

  return (
    <div className="space-y-2">
      {episodes.map((episode) => {
        const member = memberMap.get(episode.memberId);
        return (
          <button
            key={episode.id}
            id={`ep-${episode.id}`}
            onClick={() => onOpen(episode.id)}
            className={
              'flex w-full items-center gap-3 rounded-[var(--radius-card)] bg-surface p-3 '
              + 'text-left shadow-sm transition-all active:scale-98'
            }
          >
            {member && <Avatar name={member.name} color={member.color} size="sm" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{episode.illness}</p>
              <p className="text-xs text-ink-muted">
                {member?.name} · {episode.startDate}
                {episode.endDate && episode.endDate !== episode.startDate
                  ? ` – ${episode.endDate}`
                  : ''}
              </p>
              {(episode.visits?.length ?? 0) > 0 && (
                <p className="text-xs text-ink-muted">
                  {episode.visits?.length} kunjungan dokter
                </p>
              )}
            </div>
            <span
              className={
                `flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  episode.endDate === null
                    ? 'bg-sev-parah/10 text-sev-parah'
                    : 'bg-sev-sehat/10 text-sev-sehat'
                }`
              }
            >
              {episode.endDate === null ? 'Berlangsung' : 'Sembuh'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
