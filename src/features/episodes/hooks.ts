import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { useCollection } from '@/shared/firebase/useCollection';
import type { Episode } from './types';

function transformEpisode(d: Record<string, unknown> & { id: string }): Episode {
  return d as unknown as Episode;
}

/** Subscribe to open episodes (endDate === null) for all members. */
export function useOpenEpisodes(familyId: string) {
  const q = useMemo(
    () =>
      query(
        collection(db, 'families', familyId, 'episodes'),
        where('endDate', '==', null),
      ),
    [familyId],
  );
  return useCollection<Episode>(q, transformEpisode);
}

/** Subscribe to all episodes (open and closed). */
export function useAllEpisodes(familyId: string) {
  const q = useMemo(
    () => collection(db, 'families', familyId, 'episodes'),
    [familyId],
  );
  return useCollection<Episode>(q, transformEpisode);
}
