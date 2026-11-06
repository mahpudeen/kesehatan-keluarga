import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { useCollection } from '@/shared/firebase/useCollection';
import type { Medication } from './types';

function transformMedication(d: Record<string, unknown> & { id: string }): Medication {
  return d as unknown as Medication;
}

export function useMedications(familyId: string, episodeId: string) {
  const q = useMemo(
    () =>
      query(
        collection(db, 'families', familyId, 'medications'),
        where('episodeId', '==', episodeId),
      ),
    [familyId, episodeId],
  );
  const result = useCollection<Medication>(q, transformMedication);
  return {
    ...result,
    data: [...result.data].sort((a, b) => b.startDate.localeCompare(a.startDate)),
  };
}
