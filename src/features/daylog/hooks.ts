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
