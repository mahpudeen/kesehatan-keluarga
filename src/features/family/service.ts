import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
