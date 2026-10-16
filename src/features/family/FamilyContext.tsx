import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { useAuth } from '@/features/auth/AuthContext';
import type { Family } from './types';

interface FamilyContextValue {
  family: Family | null;
  loading: boolean;
}

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFamily(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'families'),
      where('memberUids', 'array-contains', user.uid),
    );
    return onSnapshot(
      q,
      (snap) => {
        const d = snap.docs[0];
        setFamily(d ? { id: d.id, ...(d.data() as Omit<Family, 'id'>) } : null);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
  }, [user]);

  const value = useMemo(() => ({ family, loading }), [family, loading]);
  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily(): FamilyContextValue {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider');
  return ctx;
}
