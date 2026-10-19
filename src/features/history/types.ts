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
