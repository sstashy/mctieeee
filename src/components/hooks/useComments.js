import { useCallback, useEffect, useRef, useState } from 'react';
import { getComments, addComment as addCommentApi } from '../services/apiClient';
import { createLRU } from '../../utils/lruCache';

const commentsCache = createLRU({ max: 200, ttl: 30_000 });

export default function useComments(playerId) {
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const seqRef = useRef(0);

  const load = useCallback(
    (useCache = true) => {
      if (!playerId) {
        setComments([]);
        setStatus('idle');
        setError('');
        return;
      }

      const cached = useCache && commentsCache.get(playerId);
      if (cached) {
        setComments(cached);
        setStatus('success');
      }

      const seq = ++seqRef.current;
      setStatus(cached ? 'success' : 'loading');
      setError('');
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      getComments(playerId, { signal: abortRef.current.signal })
        .then((res) => {
          if (seq !== seqRef.current) return;
          if (res.aborted) return;
          if (res.ok) {
            commentsCache.set(playerId, res.data);
            setComments(res.data);
            setStatus('success');
          } else {
            if (!cached) {
              setStatus('error');
              setError(res.error || '');
              setComments([]);
            }
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          if (seq !== seqRef.current) return;
          if (!cached) {
            setStatus('error');
            setError('');
          }
        });
    },
    [playerId],
  );

  useEffect(() => {
    load(true);
    return () => abortRef.current?.abort();
  }, [load]);

  const addComment = useCallback(async ({ playerId, userId, username, comment }) => {
    if (!playerId) return { ok: false };
    const tempKey = `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimistic = {
      id: null,
      _tempKey: tempKey,
      _optimistic: true,
      player_id: playerId,
      user_id: userId,
      username,
      comment,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [optimistic, ...prev]);

    const res = await addCommentApi(playerId, userId, username, comment);
    if (res.ok && res.data) {
      setComments((prev) => {
        const updated = prev.map((c) =>
          c._tempKey === tempKey ? { ...res.data, _optimistic: false } : c,
        );
        // Cache'e sadece finalize olmuş yorumlar (optimistikler hariç)
        commentsCache.set(
          playerId,
          updated.filter((c) => !c._optimistic),
        );
        return updated;
      });
      return { ok: true };
    } else {
      setComments((prev) => prev.filter((c) => c._tempKey !== tempKey));
      return { ok: false };
    }
  }, []);

  return {
    comments,
    status,
    error,
    addComment,
    reload: () => load(false),
  };
}
