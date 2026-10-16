import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { fireAndForget } from '@/shared/firebase/fireAndForget';
import type { Medication } from './types';

export function addMedication(familyId: string, med: Omit<Medication, 'id' | 'createdAt'>): void {
  fireAndForget(
    addDoc(collection(db, 'families', familyId, 'medications'), {
      ...med,
      createdAt: serverTimestamp(),
    }),
    'addMedication',
  );
}

export function deleteMedication(familyId: string, medId: string): void {
  fireAndForget(
    deleteDoc(doc(db, 'families', familyId, 'medications', medId)),
    'deleteMedication',
  );
}
