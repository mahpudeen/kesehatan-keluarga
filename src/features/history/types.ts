export interface HealthInsights {
  sickDays30: number;
  previousSickDays30: number;
  sickDays90: number;
  recentEpisodes: number;
  openEpisodes: number;
  averageDurationDays: number | null;
  topMemberName: string | null;
  topSymptom: string | null;
}

export type EpisodeStatusFilter = 'all' | 'open' | 'closed';

export interface EpisodeFilters {
  search: string;
  memberId: string;
  status: EpisodeStatusFilter;
  symptom: string;
  startDate: string;
  endDate: string;
}
