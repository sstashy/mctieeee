import { useCallback, useEffect, useRef, useState } from "react";
import { getComments, addComment as addCommentApi } from "../services/api";

/**
 * useComments
 * - abort & race safe
 * - optimistic comment ekleme
 * - aborted istekler hata göstermiyor
 */
export default function useComments(playerId) {
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const seqRef = useRef(0); // race kontrol

  const load = useCallback(() => {
    if (!playerId) {
      setComments([]);
      setStatus("idle");
      setError("");
      return;
    }

    const seq = ++seqRef.current;
    setStatus("loading");
    setError("");
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    getComments(playerId, { signal: abortRef.current.signal })
      .then(res => {
        // Sadece en yeni isteğe yanıt uygula
        if (seq !== seqRef.current) return;

        if (res.aborted) {
            // abort edilmiş -> state dokunma
            return;
        }

        if (res.ok) {
          setComments(res.data);
          setStatus("success");
          setError("");
        } else {
          setComments([]);
          setStatus("error");
          // Hata mesajı kullanıcıya gösterilmeyecekse boş bırak
          setError(res.error || ""); // İstersen "" sabit bırak
        }
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        if (seq !== seqRef.current) return;
        setStatus("error");
        setError(""); // suppress
      });
  }, [playerId]);

  useEffect(() => {
    load();
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
      created_at: new Date().toISOString()
    };
    setComments(prev => [optimistic, ...prev]);

    const res = await addCommentApi(playerId, userId, username, comment);
    if (res.ok && res.data) {
      setComments(prev =>
        prev.map(c =>
          c._tempKey === tempKey
            ? { ...res.data, _optimistic: false }
            : c
        )
      );
      return { ok: true };
    } else {
      // başarısız -> optimistic sil
      setComments(prev => prev.filter(c => c._tempKey !== tempKey));
      return { ok: false };
    }
  }, []);

  return {
    comments,
    status,
    error,      // UI'de göstermek istemiyorsan kullanma ya da hep "" dön
    addComment,
    reload: load
  };
}