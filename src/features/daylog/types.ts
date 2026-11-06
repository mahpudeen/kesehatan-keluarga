export type Status = 'sehat' | 'sakit';
export type Severity = 'ringan' | 'sedang' | 'parah';

export interface DayLog {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD local
  status: Status;
  severity?: Severity;
  symptoms?: string[];
  note?: string;
  episodeId?: string;
  updatedBy: string;
  updatedAt: unknown; // Firestore Timestamp (server-side)
}

export interface SickInput {
  severity: Severity;
  symptoms: string[];
  illness: string;
  note: string;
}

export interface SaveSickDayParams {
  familyId: string;
  memberId: string;
  date: string;
  uid: string;
  input: SickInput;
  openEpisodeId?: string;
  /** null for today (open episode), date string for backdated (closed episode) */
  newEpisodeEndDate?: string | null;
}
