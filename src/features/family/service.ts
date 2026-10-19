import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';

export async function createFamily(name: string, uid: string): Promise<void> {
  await addDoc(collection(db, 'families'), {
    name,
    ownerUid: uid,
    memberUids: [uid],
    createdAt: serverTimestamp(),
    schemaVersion: 1,
  });
}

export async function updateFamilyName(familyId: string, name: string): Promise<void> {
  await updateDoc(doc(db, 'families', familyId), { name });
}
