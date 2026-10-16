import type { Episode } from './types';

/**
 * Find the episode that covers the given date for a member.
 * An episode covers a date if:
 *   - It belongs to that member
 *   - Its startDate <= date
 *   - Its endDate is null (open) OR endDate >= date
 *
 * Shared by TodayPage and HistoryPage to avoid duplication.
 */
export function findEpisodeForDate(
  episodes: Episode[],
  memberId: string,
  date: string,
): Episode | undefined {
  return episodes.find(
    (e) =>
      e.memberId === memberId &&
      e.startDate <= date &&
      (e.endDate === null || e.endDate >= date),
  );
}

/**
 * Find the open episode (endDate === null) for a member.
 */
export function findOpenEpisode(episodes: Episode[], memberId: string): Episode | undefined {
  return episodes.find((e) => e.memberId === memberId && e.endDate === null);
}
