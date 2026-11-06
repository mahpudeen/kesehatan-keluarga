import { useEffect, useState } from 'react';
import { type Query, type DocumentData, onSnapshot } from 'firebase/firestore';

export interface CollectionState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

/**
 * Generic Firestore collection subscription hook.
 * Replaces all the copy-pasted onSnapshot patterns.
 *
 * @param query - A Firestore Query. Pass `null` to skip subscribing.
 * @param transform - Map each doc snapshot to your typed object.
 */
export function useCollection<T>(
  query: Query<DocumentData> | null,
  transform: (doc: DocumentData & { id: string }) => T,
): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({
    data: [],
    loading: query !== null,
    error: null,
  });

  useEffect(() => {
    if (!query) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    return onSnapshot(
      query,
      (snap) => {
        setState({
          data: snap.docs.map((d) => transform({ id: d.id, ...d.data() })),
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState((s) => ({ ...s, loading: false, error: err }));
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return state;
}
