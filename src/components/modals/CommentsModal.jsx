import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useComments from "../hooks/useComments";
import useFocusTrap from "../hooks/useFocusTrap";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";

const MAX_LEN = 500;

export default function CommentsModal({ playerId, playerName, onClose }) {
  const { user } = useAuth();
  const {
    comments,
    status,
    error,
    addComment,     // hook içindeki (optimistic destekleyen) wrapper
    reload
  } = useComments(playerId);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [announce, setAnnounce] = useState("");
  const panelRef = useRef(null);
  const listRef = useRef(null);

  useFocusTrap(panelRef, true);
  useLockBodyScroll(true);

  // ESC
  useEffect(() => {
    const esc = e => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  // aria-live mesajını temizle
  useEffect(() => {
    if (!announce) return;
    const t = setTimeout(() => setAnnounce(""), 2500);
    return () => clearTimeout(t);
  }, [announce]);

  const remaining = MAX_LEN - text.length;
  const disabled = !playerId || sending;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!playerId || !user) return;
    if (!text.trim() || sending) return;
    setSending(true);

    // addComment hook’unu optimistic ekleme ile kullanıyorsan sadece (user, text) şekline adapte ettin mi?
    // Eğer hook’un imzası orijinal API ile aynıysa:
    const res = await addComment({
      playerId,
      userId: user.id,
      username: user.username,
      comment: text.trim()
    });

    setSending(false);

    if (res.ok) {
      setText("");
      setAnnounce("Yorum eklendi.");
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      // Eğer hook içinde optimistic güncelleme yoksa manuel:
      // reload();
    } else {
      setAnnounce(res.error || "Yorum gönderilemedi.");
    }
  }, [playerId, user, text, sending, addComment]);

  if (!playerId) {
    return null; // veya fallback modal
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comments-heading"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-2xl border border-[#28304a] bg-[#23263af2] shadow-2xl px-6 py-8 flex flex-col focus:outline-none"
      >
        <button
          type="button"
          onClick={() => onClose?.()}
          className="absolute top-3 right-3 text-gray-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          aria-label="Kapat"
        >
          &times;
        </button>

        <h2
          id="comments-heading"
          className="text-lg font-bold text-blue-300 tracking-wide mb-3"
        >
          {playerName} – Yorumlar
        </h2>

        {error && false && (
          <ErrorMessage
            message={error}
            variant="error"
            dismissible
            onClose={() => reload()}
          />
        )}

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4 max-h-64 scrollbar-thin"
          aria-live="polite"
        >
          {status === "loading" && (
            <div className="py-6 flex justify-center">
              <LoadingSpinner inline size="sm" text="Yorumlar yükleniyor..." />
            </div>
          )}

            {status === "success" && comments.length === 0 && (
            <div className="text-gray-400 text-center text-sm italic py-4">
              Henüz yorum yok. İlk yorumu sen yaz!
            </div>
          )}

          {status === "success" && comments.length > 0 && (
            <ul className="space-y-3" role="list">
              {comments.map(c => (
                <li
                  key={c.id || c._tempKey}
                  className={`rounded border border-gray-700/60 bg-[#1e2534] px-3 py-2 text-sm flex flex-col relative ${
                    c._optimistic ? "opacity-70" : "opacity-100"
                  }`}
                  role="listitem"
                >
                  <span className="font-semibold text-blue-400">
                    {c.username || "Anonim"}
                  </span>
                  <span className="text-gray-200 mt-1 break-words">
                    {c.comment}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1">
                    {formatDate(c.created_at)}
                  </span>
                  {c._optimistic && (
                    <span className="absolute top-1.5 right-2 text-[10px] text-amber-300">
                      gönderiliyor...
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {user ? (
          <form onSubmit={handleSubmit} className="mt-auto">
            <div className="relative">
              <textarea
                value={text}
                onChange={e => {
                  if (e.target.value.length <= MAX_LEN) setText(e.target.value);
                }}
                placeholder="Yorumun..."
                className="w-full min-h-[70px] rounded-lg border border-gray-700 bg-[#1d2230] px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                maxLength={MAX_LEN}
                disabled={disabled}
                aria-label="Yorum metni"
              />
              <span
                className={`absolute bottom-1 right-2 text-[11px] ${
                  remaining < 40 ? "text-amber-300" : "text-gray-500"
                }`}
              >
                {remaining}
              </span>
            </div>
            <button
              type="submit"
              disabled={disabled || !text.trim()}
              className="mt-2 w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {sending ? "Gönderiliyor..." : "Gönder"}
            </button>
            <div className="sr-only" aria-live="assertive">
              {announce}
            </div>
          </form>
        ) : (
          <div className="text-gray-400 text-sm text-center">
            Yorum eklemek için giriş yapmalısınız.
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  // Eğer backend "2024-08-08 12:30:22" şeklinde dönüyorsa new Date() UTC/MS farkı olabilir
  return iso.replace("T", " ").slice(0, 16);
}