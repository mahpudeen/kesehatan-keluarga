export interface Medication {
  id: string;
  episodeId: string;
  memberId: string;
  name: string;
  dose: string;
  frequency: string;
  startDate: string; // YYYY-MM-DD local
  prescribedByDoctor: boolean;
  note: string;
  createdAt: unknown; // Firestore Timestamp
}
