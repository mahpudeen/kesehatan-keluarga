export type Relation = 'saya' | 'istri' | 'suami' | 'anak' | 'lainnya';

export interface Member {
  id: string;
  name: string;
  relation: Relation;
  color: string;
  archived: boolean;
  order: number;
}
