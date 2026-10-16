import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Medication {
  id: string;
  episodeId: string;
  memberId: string;
  name: string;
  dose: string;
  frequency: string;
  startDate: string;
  prescribedByDoctor: boolean;
  note: string;
}

export function useMedications(familyId: string, episodeId: string) {
  const [meds, setMeds] = useState<Medication[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'families', familyId, 'medications'),
      where('episodeId', '==', episodeId),
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<Medication, 'id'>) }),
      );
      list.sort((a, b) => b.startDate.localeCompare(a.startDate));
      setMeds(list);
    });
  }, [familyId, episodeId]);

  return meds;
}

export function addMedication(familyId: string, med: Omit<Medication, 'id'>) {
  addDoc(collection(db, 'families', familyId, 'medications'), {
    ...med,
    createdAt: serverTimestamp(),
  }).catch(console.error);
}

export function deleteMedication(familyId: string, medId: string) {
  deleteDoc(doc(db, 'families', familyId, 'medications', medId)).catch(console.error);
}