import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { useCollection } from '@/shared/firebase/useCollection';
import type { DayLog } from './types';

function transformDayLog(d: Record<string, unknown> & { id: string }): DayLog {
  return d as unknown as DayLog;
}

/** Subscribe to all day logs for a specific date. */
export function useDayLogs(familyId: string, date: string) {
  const q = useMemo(
    () =>
      query(
        collection(db, 'families', familyId, 'dayLogs'),
        where('date', '==', date),
      ),
    [familyId, date],
  );
  return useCollection<DayLog>(q, transformDayLog);
}

/** Subscribe to all day logs in a date range (e.g. a month). */
export function useMonthLogs(familyId: string, start: string, end: string) {
  const q = useMemo(
    () =>
      query(
        collection(db, 'families', familyId, 'dayLogs'),
        where('date', '>=', start),
        where('date', '<=', end),
      ),
    [familyId, start, end],
  );
  return useCollection<DayLog>(q, transformDayLog);
}

/** Subscribe to day logs in any date range, optionally disabled to avoid unnecessary reads. */
export function useDateRangeLogs(
  familyId: string,
  start: string,
  end: string,
  enabled = true,
) {
  const q = useMemo(
    () =>
      enabled && familyId
        ? query(
            collection(db, 'families', familyId, 'dayLogs'),
            where('date', '>=', start),
            where('date', '<=', end),
          )
        : null,
    [enabled, end, familyId, start],
  );
  return useCollection<DayLog>(q, transformDayLog);
}

/** Subscribe to the sick-day logs attached to one episode. */
export function useEpisodeLogs(familyId: string, episodeId: string) {
  const q = useMemo(
    () =>
      query(
        collection(db, 'families', familyId, 'dayLogs'),
        where('episodeId', '==', episodeId),
      ),
    [familyId, episodeId],
  );
  const result = useCollection<DayLog>(q, transformDayLog);
  return {
    ...result,
    data: [...result.data].sort((a, b) => a.date.localeCompare(b.date)),
  };
}
