import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Family {
  id: string;
  name: string;
  ownerUid: string;
  memberUids: string[];
}

export function useFamily(uid: string | undefined) {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setFamily(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'families'),
      where('memberUids', 'array-contains', uid),
    );
    return onSnapshot(
      q,
      (snap) => {
        const d = snap.docs[0];
        setFamily(d ? { id: d.id, ...(d.data() as Omit<Family, 'id'>) } : null);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );
  }, [uid]);

  return { family, loading };
}

export async function createFamily(name: string, uid: string) {
  await addDoc(collection(db, 'families'), {
    name,
    ownerUid: uid,
    memberUids: [uid],
    createdAt: serverTimestamp(),
    schemaVersion: 1,
  });
}