export interface Family {
  id: string;
  name: string;
  ownerUid: string;
  memberUids: string[];
  joinCode?: string;
  schemaVersion: number;
}

export interface FamilyState {
  family: Family | null;
  loading: boolean;
}
