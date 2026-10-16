import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/shared/firebase/client';
import { useFamily } from '@/features/family/FamilyContext';
import type { Member } from './types';

interface MembersContextValue {
  members: Member[];
  activeMembers: Member[];
  loading: boolean;
}

const MembersContext = createContext<MembersContextValue | null>(null);

export function MembersProvider({ children }: { children: ReactNode }) {
  const { family } = useFamily();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(collection(db, 'families', family.id, 'members'), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }))
        .sort((a, b) => a.order - b.order);
      setMembers(list);
      setLoading(false);
    });
  }, [family]);

  const activeMembers = useMemo(() => members.filter((m) => !m.archived), [members]);
  const value = useMemo(() => ({ members, activeMembers, loading }), [members, activeMembers, loading]);

  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
}

export function useMembers(): MembersContextValue {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error('useMembers must be used within MembersProvider');
  return ctx;
}
