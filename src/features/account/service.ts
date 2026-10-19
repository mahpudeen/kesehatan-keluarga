import {
  Timestamp,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { fireAndForget } from '@/shared/firebase/fireAndForget';
import type { DayLog } from '@/features/daylog/types';
import type { Episode } from '@/features/episodes/types';
import type { Medication } from '@/features/medications/types';
import type { Member } from '@/features/members/types';
import type { BackupTimestamp, FamilyBackup } from './types';

function backupTimestamp(value: unknown): BackupTimestamp | null {
  return value instanceof Timestamp
    ? { seconds: value.seconds, nanoseconds: value.nanoseconds }
    : null;
}

function firestoreTimestamp(
  value: BackupTimestamp | null,
): Timestamp | ReturnType<typeof serverTimestamp> {
  return value ? new Timestamp(value.seconds, value.nanoseconds) : serverTimestamp();
}

export async function exportFamilyData(
  familyId: string,
  familyName: string,
): Promise<FamilyBackup> {
  const refs = ['members', 'dayLogs', 'episodes', 'medications'] as const;
  const [membersSnap, dayLogsSnap, episodesSnap, medicationsSnap] = await Promise.all(
    refs.map((name) => getDocs(collection(db, 'families', familyId, name))),
  );

  return {
    format: 'catatan-kesehatan-keluarga',
    version: 1,
    exportedAt: Date.now(),
    family: { name: familyName },
    members: membersSnap.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<Member, 'id'>),
    })),
    dayLogs: dayLogsSnap.docs.map((item) => {
      const data = item.data() as Omit<DayLog, 'id'>;
      return { id: item.id, ...data, updatedAt: backupTimestamp(data.updatedAt) };
    }),
    episodes: episodesSnap.docs.map((item) => {
      const data = item.data() as Omit<Episode, 'id'>;
      return {
        id: item.id,
        ...data,
        visits: data.visits ?? [],
        createdAt: backupTimestamp(data.createdAt),
      };
    }),
    medications: medicationsSnap.docs.map((item) => {
      const data = item.data() as Omit<Medication, 'id'>;
      return { id: item.id, ...data, createdAt: backupTimestamp(data.createdAt) };
    }),
  };
}

export function importFamilyData(familyId: string, backup: FamilyBackup): number {
  fireAndForget(
    updateDoc(doc(db, 'families', familyId), { name: backup.family.name }),
    'import-family-name',
  );

  const writes = [
    ...backup.members.map((item) => ({ collection: 'members', item })),
    ...backup.dayLogs.map((item) => ({ collection: 'dayLogs', item })),
    ...backup.episodes.map((item) => ({ collection: 'episodes', item })),
    ...backup.medications.map((item) => ({ collection: 'medications', item })),
  ];

  for (let offset = 0; offset < writes.length; offset += 450) {
    const batch = writeBatch(db);
    for (const write of writes.slice(offset, offset + 450)) {
      const { id, ...data } = write.item;
      const timestamped = 'updatedAt' in data
        ? { ...data, updatedAt: firestoreTimestamp(data.updatedAt) }
        : 'createdAt' in data
          ? { ...data, createdAt: firestoreTimestamp(data.createdAt) }
          : data;
      batch.set(doc(db, 'families', familyId, write.collection, id), timestamped);
    }
    fireAndForget(batch.commit(), `import-family-data-${offset / 450 + 1}`);
  }

  return writes.length;
}
