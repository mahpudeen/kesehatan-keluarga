import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { fireAndForget } from '@/shared/firebase/fireAndForget';
import type { SaveSickDayParams } from './types';

/** Set a member's status for a day (sehat). */
export function setDayStatus(
  familyId: string,
  memberId: string,
  date: string,
  status: 'sehat' | 'sakit',
  uid: string,
): void {
  fireAndForget(
    setDoc(doc(db, 'families', familyId, 'dayLogs', `${memberId}_${date}`), {
      memberId,
      date,
      status,
      updatedBy: uid,
      updatedAt: serverTimestamp(),
    }),
    'setDayStatus',
  );
}

/**
 * Record a sick day. If no openEpisodeId, creates a new episode.
 * All writes are fire-and-forget so offline UI stays responsive.
 */
export function saveSickDay({
  familyId,
  memberId,
  date,
  uid,
  input,
  openEpisodeId,
  newEpisodeEndDate = null,
}: SaveSickDayParams): void {
  let episodeId = openEpisodeId;

  if (!episodeId) {
    const epRef = doc(collection(db, 'families', familyId, 'episodes'));
    episodeId = epRef.id;
    fireAndForget(
      setDoc(epRef, {
        memberId,
        illness: input.illness,
        startDate: date,
        endDate: newEpisodeEndDate,
        visits: [],
        createdAt: serverTimestamp(),
      }),
      'saveSickDay:createEpisode',
    );
  }

  fireAndForget(
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
    }),
    'saveSickDay:dayLog',
  );
}
