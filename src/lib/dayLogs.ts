import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export type Status = 'sehat' | 'sakit';

export interface DayLog {
  id: string;
  memberId: string;
  date: string;
  status: Status;
}

export type Severity = 'ringan' | 'sedang' | 'parah';

export interface DayLog {
  id: string;
  memberId: string;
  date: string;
  status: Status;
  severity?: Severity;
  symptoms?: string[];
  note?: string;
  episodeId?: string;
}

export function useDayLogs(familyId: string, date: string) {
  const [logs, setLogs] = useState<DayLog[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'families', familyId, 'dayLogs'),
      where('date', '==', date),
    );
    return onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DayLog, 'id'>) })));
    });
  }, [familyId, date]);

  return logs;
}

// ID dokumen deterministik: satu catatan per anggota per hari
export async function setDayStatus(
  familyId: string,
  memberId: string,
  date: string,
  status: Status,
  uid: string,
) {
  await setDoc(doc(db, 'families', familyId, 'dayLogs', `${memberId}_${date}`), {
    memberId,
    date,
    status,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
  });
}

export interface SickInput {
  severity: Severity;
  symptoms: string[];
  illness: string;
  note: string;
}

export function saveSickDay(
  familyId: string,
  memberId: string,
  date: string,
  uid: string,
  input: SickInput,
  openEpisodeId?: string,
  newEpisodeEndDate: string | null = null,
) {
  let episodeId = openEpisodeId;

  if (!episodeId) {
    const epRef = doc(collection(db, 'families', familyId, 'episodes'));
    episodeId = epRef.id;
    setDoc(epRef, {
      memberId,
      illness: input.illness,
      startDate: date,
      endDate: newEpisodeEndDate,
      visits: [],
      createdAt: serverTimestamp(),
    }).catch(console.error);
  }

  setDoc(doc(db, 'families', familyId, 'dayLogs', `${memberId}_${date}`), {
    memberId,
    date,
    status: 'sakit',
    severity: input.severity,
    symptoms: input.symptoms,
    note: input.note,
    episodeId,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
  }).catch(console.error);
}

// Ambil semua catatan dalam rentang tanggal (misalnya satu bulan)
export function useMonthLogs(familyId: string, start: string, end: string) {
  const [logs, setLogs] = useState<DayLog[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'families', familyId, 'dayLogs'),
      where('date', '>=', start),
      where('date', '<=', end),
    );
    return onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DayLog, 'id'>) })));
    });
  }, [familyId, start, end]);

  return logs;
}