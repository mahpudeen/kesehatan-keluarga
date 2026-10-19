import type { Episode } from '@/features/episodes/types';
import type { Member } from '@/features/members/types';
import type { EpisodeFilters } from './types';

export const EMPTY_EPISODE_FILTERS: EpisodeFilters = {
  search: '',
  memberId: 'all',
  status: 'all',
  symptom: '',
  startDate: '',
  endDate: '',
};

function matchesSearch(episode: Episode, memberName: string, search: string): boolean {
  if (!search) return true;
  const visitText = (episode.visits ?? [])
    .flatMap((visit) => [visit.doctorName, visit.facility, visit.diagnosis, visit.note])
    .join(' ');
  const searchableText = `${episode.illness} ${memberName} ${visitText}`;
  return searchableText.toLocaleLowerCase('id-ID').includes(search);
}

export function filterEpisodes(
  episodes: Episode[],
  members: Member[],
  filters: EpisodeFilters,
  symptomEpisodeIds: Set<string>,
  today: string,
): Episode[] {
  const memberNames = new Map(members.map((member) => [member.id, member.name]));
  const search = filters.search.trim().toLocaleLowerCase('id-ID');

  return episodes
    .filter((episode) => {
      if (filters.memberId !== 'all' && episode.memberId !== filters.memberId) return false;
      if (filters.status === 'open' && episode.endDate !== null) return false;
      if (filters.status === 'closed' && episode.endDate === null) return false;
      if (filters.symptom && !symptomEpisodeIds.has(episode.id)) return false;
      if (filters.startDate && (episode.endDate ?? today) < filters.startDate) return false;
      if (filters.endDate && episode.startDate > filters.endDate) return false;
      return matchesSearch(episode, memberNames.get(episode.memberId) ?? '', search);
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function hasEpisodeFilters(filters: EpisodeFilters): boolean {
  return filters.search.trim() !== ''
    || filters.memberId !== 'all'
    || filters.status !== 'all'
    || filters.symptom !== ''
    || filters.startDate !== ''
    || filters.endDate !== '';
}
