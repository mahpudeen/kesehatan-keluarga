import { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type Relation = 'saya' | 'istri' | 'anak' | 'lainnya';

export interface Member {
  id: string;
  name: string;
  relation: Relation;
  color: string;
  archived: boolean;
  order: number;
}

const COLORS = ['#059669', '#2563eb', '#db2777', '#d97706', '#7c3aed', '#0891b2'];

export function useMembers(familyId: string) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, 'families', familyId, 'members'), (snap) => {
      const list = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }),
      );
      list.sort((a, b) => a.order - b.order);
      setMembers(list);
    });
  }, [familyId]);

  return members;
}

export async function addMember(
  familyId: string,
  name: string,
  relation: Relation,
  count: number,
) {
  await addDoc(collection(db, 'families', familyId, 'members'), {
    name,
    relation,
    color: COLORS[count % COLORS.length],
    archived: false,
    order: Date.now(),
  });
}

export async function archiveMember(familyId: string, memberId: string) {
  await updateDoc(doc(db, 'families', familyId, 'members', memberId), {
    archived: true,
  });
}