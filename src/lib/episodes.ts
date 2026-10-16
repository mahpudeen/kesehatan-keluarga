import { useEffect, useState } from 'react';
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface DoctorVisit {
  id: string;
  date: string;
  doctorName: string;
  facility: string;
  diagnosis: string;
  note: string;
}

export interface Episode {
  id: string;
  memberId: string;
  illness: string;
  startDate: string;
  endDate: string | null;
  visits?: DoctorVisit[];
}

// Episode yang masih berjalan (belum sembuh) untuk semua anggota
export function useOpenEpisodes(familyId: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'families', familyId, 'episodes'),
      where('endDate', '==', null),
    );
    return onSnapshot(q, (snap) => {
      setEpisodes(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Episode, 'id'>) })),
      );
    });
  }, [familyId]);

  return episodes;
}

export function closeEpisode(familyId: string, episodeId: string, endDate: string) {
  updateDoc(doc(db, 'families', familyId, 'episodes', episodeId), { endDate }).catch(
    console.error,
  );
}

// Semua episode (berjalan maupun sudah sembuh)
export function useAllEpisodes(familyId: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, 'families', familyId, 'episodes'), (snap) => {
      setEpisodes(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Episode, 'id'>) })),
      );
    });
  }, [familyId]);

  return episodes;
}

export function addVisit(
  familyId: string,
  episodeId: string,
  visit: Omit<DoctorVisit, 'id'>,
) {
  updateDoc(doc(db, 'families', familyId, 'episodes', episodeId), {
    visits: arrayUnion({ id: crypto.randomUUID(), ...visit }),
  }).catch(console.error);
}

export function removeVisit(
  familyId: string,
  episodeId: string,
  remaining: DoctorVisit[],
) {
  updateDoc(doc(db, 'families', familyId, 'episodes', episodeId), {
    visits: remaining,
  }).catch(console.error);
}