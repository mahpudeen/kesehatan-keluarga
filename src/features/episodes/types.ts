export interface DoctorVisit {
  id: string;
  date: string; // YYYY-MM-DD local
  doctorName: string;
  facility: string;
  diagnosis: string;
  note: string;
}

export interface Episode {
  id: string;
  memberId: string;
  illness: string;
  startDate: string; // YYYY-MM-DD local
  endDate: string | null; // null = still ongoing
  visits?: DoctorVisit[];
  createdAt: unknown; // Firestore Timestamp
}

export interface UpdateVisitParams {
  familyId: string;
  episodeId: string;
  visits: DoctorVisit[];
  visit: DoctorVisit;
}
