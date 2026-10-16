import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { fireAndForget } from '@/shared/firebase/fireAndForget';
import type { DoctorVisit } from './types';

export function closeEpisode(familyId: string, episodeId: string, endDate: string): void {
  fireAndForget(
    updateDoc(doc(db, 'families', familyId, 'episodes', episodeId), { endDate }),
    'closeEpisode',
  );
}

export function addVisit(
  familyId: string,
  episodeId: string,
  visit: Omit<DoctorVisit, 'id'>,
): void {
  fireAndForget(
    updateDoc(doc(db, 'families', familyId, 'episodes', episodeId), {
      visits: arrayUnion({ id: crypto.randomUUID(), ...visit }),
    }),
    'addVisit',
  );
}

export function removeVisit(
  familyId: string,
  episodeId: string,
  remaining: DoctorVisit[],
): void {
  fireAndForget(
    updateDoc(doc(db, 'families', familyId, 'episodes', episodeId), {
      visits: remaining,
    }),
    'removeVisit',
  );
}
