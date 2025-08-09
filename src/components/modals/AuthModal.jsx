import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../hooks/useFocusTrap";
import useLockBodyScroll from "../hooks/useLockBodyScroll";

const ANIM_MS = 220;

/**
 * AuthModal
 * Eski karışık dosya yapısı düzeltildi.
 */
export default function AuthModal({
  show,
  onClose,
  children,
  title = "Kimlik",
  description,
  labelledById,
  closeOnBackdrop = true,
  closeOnEsc = true
}) {
  const [mounted, setMounted] = useState(show);
  const [animating, setAnimating] = useState(false);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);

  // Mount/unmount
  useEffect(() => {
    if (show) {
      setMounted(true);
      requestAnimationFrame(() => setAnimating(true));
    } else if (mounted) {
      setAnimating(false);
      const t = setTimeout(() => setMounted(false), ANIM_MS + 40);
      return () => clearTimeout(t);
    }
  }, [show, mounted]);

  // Esc kapama
  useEffect(() => {
    if (!show || !closeOnEsc) return;
    const handle = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [show, closeOnEsc, onClose]);

  // Focus + scroll lock
  useFocusTrap(panelRef, show);
  useLockBodyScroll(show);

  const handleBackdrop = useCallback(
    (e) => {
      if (!closeOnBackdrop) return;
      if (e.target === backdropRef.current) onClose?.();
    },
    [closeOnBackdrop, onClose]
  );

  if (!mounted) return null;

  const headingId =
    labelledById || `auth-modal-title-${Math.random().toString(36).slice(2)}`;
  const descId = description
    ? `auth-modal-desc-${Math.random().toString(36).slice(2)}`
    : undefined;

  return createPortal(
    <div
      ref={backdropRef}
      onMouseDown={handleBackdrop}
      className={`fixed inset-0 z-[100] flex items-start justify-center px-4 pt-24 pb-10
        bg-[#0b1020cc] backdrop-blur-sm transition-opacity
        ${animating ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <div
        ref={panelRef}
        className={`relative w-full max-w-lg rounded-2xl border border-[#28304a] shadow-xl
        bg-gradient-to-br from-[#23263a] via-[#28304a] to-[#181c2a]
        px-8 py-9 focus:outline-none transition-transform transition-opacity duration-200
        ${animating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Kapat"
          className="absolute top-3 right-3 text-[#82cfff] hover:text-white hover:scale-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82cfff] rounded"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <header className="mb-5">
          <h2
            id={headingId}
            className="text-2xl font-bold text-[#5ea4ff] tracking-wide"
          >
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-sm text-gray-300 leading-snug">
              {description}
            </p>
          )}
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}