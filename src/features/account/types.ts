export interface BackupTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface MemberBackup {
  id: string;
  name: string;
  relation: string;
  color: string;
  archived: boolean;
  order: number;
}

export interface DayLogBackup {
  id: string;
  memberId: string;
  date: string;
  status: string;
  severity?: string;
  symptoms?: string[];
  note?: string;
  episodeId?: string;
  updatedBy: string;
  updatedAt: BackupTimestamp | null;
}

export interface DoctorVisitBackup {
  id: string;
  date: string;
  doctorName: string;
  facility: string;
  diagnosis: string;
  note: string;
}

export interface EpisodeBackup {
  id: string;
  memberId: string;
  illness: string;
  startDate: string;
  endDate: string | null;
  visits: DoctorVisitBackup[];
  createdAt: BackupTimestamp | null;
}

export interface MedicationBackup {
  id: string;
  episodeId: string;
  memberId: string;
  name: string;
  dose: string;
  frequency: string;
  startDate: string;
  prescribedByDoctor: boolean;
  note: string;
  createdAt: BackupTimestamp | null;
}

export interface FamilyBackup {
  format: 'catatan-kesehatan-keluarga';
  version: 1;
  exportedAt: number;
  family: { name: string };
  members: MemberBackup[];
  dayLogs: DayLogBackup[];
  episodes: EpisodeBackup[];
  medications: MedicationBackup[];
}
