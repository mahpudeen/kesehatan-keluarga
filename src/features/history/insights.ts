import { subDays } from 'date-fns';
import { episodeDurationDays } from '@/features/episodes/utils';
import { parseLocalDate, todayStr } from '@/shared/lib/date';
import type { DayLog } from '@/features/daylog/types';
import type { Episode } from '@/features/episodes/types';
import type { Member } from '@/features/members/types';
import type { HealthInsights } from './types';

function mostFrequent(counts: Map<string, number>): string | null {
  const sorted = [...counts.entries()].sort(
    ([keyA, countA], [keyB, countB]) => countB - countA || keyA.localeCompare(keyB),
  );
  return sorted[0]?.[0] ?? null;
}

function countBy(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

export function calculateHealthInsights(
  logs: DayLog[],
  episodes: Episode[],
  members: Member[],
  today: string,
): HealthInsights {
  const currentDate = parseLocalDate(today);
  const start30 = todayStr(subDays(currentDate, 29));
  const previousStart = todayStr(subDays(currentDate, 59));
  const previousEnd = todayStr(subDays(currentDate, 30));
  const start90 = todayStr(subDays(currentDate, 89));
  const sickLogs = logs.filter((log) => log.status === 'sakit' && log.date <= today);
  const recentSickLogs = sickLogs.filter((log) => log.date >= start90);
  const completed = episodes.filter(
    (episode) => episode.endDate && episode.endDate >= start90 && episode.endDate <= today,
  );
  const topMemberId = mostFrequent(countBy(recentSickLogs.map((log) => log.memberId)));
  const memberMap = new Map(members.map((member) => [member.id, member.name]));
  const durations = completed.map((episode) =>
    episodeDurationDays(episode.startDate, episode.endDate ?? episode.startDate),
  );

  return {
    sickDays30: sickLogs.filter((log) => log.date >= start30).length,
    previousSickDays30: sickLogs.filter(
      (log) => log.date >= previousStart && log.date <= previousEnd,
    ).length,
    sickDays90: recentSickLogs.length,
    recentEpisodes: episodes.filter(
      (episode) => episode.startDate >= start90 && episode.startDate <= today,
    ).length,
    openEpisodes: episodes.filter((episode) => episode.endDate === null).length,
    averageDurationDays: durations.length
      ? Math.round(durations.reduce((total, duration) => total + duration, 0) / durations.length)
      : null,
    topMemberName: topMemberId ? memberMap.get(topMemberId) ?? null : null,
    topSymptom: mostFrequent(
      countBy(recentSickLogs.flatMap((log) => log.symptoms ?? [])),
    ),
  };
}
