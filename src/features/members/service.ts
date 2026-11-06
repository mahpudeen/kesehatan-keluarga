import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { MEMBER_COLORS } from './constants';
import type { Member, Relation } from './types';

export async function addMember(
  familyId: string,
  name: string,
  relation: Relation,
  existingCount: number,
): Promise<void> {
  await addDoc(collection(db, 'families', familyId, 'members'), {
    name,
    relation,
    color: MEMBER_COLORS[existingCount % MEMBER_COLORS.length],
    archived: false,
    order: Date.now(),
  });
}

export async function archiveMember(familyId: string, memberId: string): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'members', memberId), {
    archived: true,
  });
}

export async function restoreMember(familyId: string, memberId: string): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'members', memberId), {
    archived: false,
  });
}

export async function updateMember(
  familyId: string,
  memberId: string,
  changes: Pick<Member, 'name' | 'relation'>,
): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'members', memberId), changes);
}

// Kept for completeness — members are archived, never deleted (AGENTS.md invariant 8)
export { addDoc, serverTimestamp };
