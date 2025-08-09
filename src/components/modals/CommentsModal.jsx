import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useTransition,
  useMemo
} from "react";
import { useAuth } from "../context/AuthContext";
import useComments from "../hooks/useComments";
import useFocusTrap from "../hooks/useFocusTrap";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";

/**
 * Config
 */
const MAX_LEN = 500;
const VIRTUAL_THRESHOLD = 60;

export default function CommentsModal({
  playerId,
  playerName,
  onClose,
  autoFocus = true
}) {
  const { user } = useAuth();
  const {
    comments,
    status,
    error,
    addComment,
    reload
  } = useComments(playerId);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [isPending, startTransition] = useTransition();

  const panelRef = useRef(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);

  const open = !!playerId;

  useFocusTrap(panelRef, open && autoFocus);
  useLockBodyScroll(open);

  // Esc close
  useEffect(() => {
    if (!open) return;
    const esc = e => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  // Auto focus textarea on show (optional)
  useEffect(() => {
    if (open && autoFocus) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [open, autoFocus]);

  // aria-live cleanup
  useEffect(() => {
    if (!announce) return;
    const t = setTimeout(() => setAnnounce(""), 2500);
    return () => clearTimeout(t);
  }, [announce]);

  const remaining = MAX_LEN - text.length;
  const disableSend = !playerId || sending || !text.trim();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (disableSend || !user) return;
    setSending(true);

    // Optimistic veya normal sonuç
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
      // Liste üstte yeni geleni gösteriyorsa scroll etmeye gerek yok;
      // eğer ekleme listenin altına append ediliyorsa:
      // listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setAnnounce(res.error || "Yorum gönderilemedi.");
    }
  }, [disableSend, user, addComment, playerId, text]);

  // Büyük liste için virtualization (hafif custom)
  const useVirtual = comments.length >= VIRTUAL_THRESHOLD;

  const virtualItems = useMemo(() => {
    if (!useVirtual) return comments;
    // Çok basit windowing (ilk 200 ms'de baseline). Gerekirse tanstack/react-virtual ile değiştir.
    // Burada minimal basitlik: sadece ilk 400 öğe + ilerde lazy load kancası.
    return comments.slice(0, 400);
  }, [useVirtual, comments]);

  if (!open) return null;

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
        className="relative w-full max-w-md rounded-2xl border border-[#28304a] bg-[#23263af2] shadow-xl px-6 py-7 flex flex-col focus:outline-none transition-transform animate-slide-down"
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

        {error && (
          <div className="mb-3">
            <ErrorMessage
              message={error}
              variant="error"
              dismissible
              onClose={() => startTransition(() => reload())}
            />
          </div>
        )}

        <div
          ref={listRef}
            className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4 max-h-64 custom-scrollbar-container"
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
              {virtualItems.map(c => (
                <li
                  key={c.id || c._tempKey}
                  className={`rounded border border-gray-700/60 bg-[#1e2534] px-3 py-2 text-sm flex flex-col relative ${
                    c._optimistic ? "opacity-70" : "opacity-100"
                  }`}
                  role="listitem"
                  style={{ willChange: c._optimistic ? "opacity" : "auto" }}
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
              {useVirtual && comments.length > virtualItems.length && (
                <li className="text-center text-[11px] text-gray-500 py-1">
                  + {comments.length - virtualItems.length} daha (sanallaştırıldı)
                </li>
              )}
            </ul>
          )}
        </div>

        {user ? (
          <form onSubmit={handleSubmit} className="mt-auto">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => {
                  const v = e.target.value;
                  if (v.length <= MAX_LEN) setText(v);
                }}
                placeholder="Yorumun..."
                className="w-full min-h-[70px] rounded-lg border border-gray-700 bg-[#1d2230] px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                maxLength={MAX_LEN}
                disabled={sending}
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
              disabled={disableSend}
              className="mt-2 w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {sending ? "Gönderiliyor..." : isPending ? "Güncelleniyor..." : "Gönder"}
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

function formatDate(value) {
  if (!value) return "";
  // ISO veya "2025-08-09 21:12:00"
  if (value.includes("T")) return value.replace("T", " ").slice(0, 16);
  return value.slice(0, 16);
}