import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../hooks/useFocusTrap";
import useLockBodyScroll from "../hooks/useLockBodyScroll";

const ANIM_MS = 300;

export default function AuthModal({
  show,
  onClose,
  children,
  title = "Kimlik",
  closeOnBackdrop = true,
  closeOnEsc = true,
  labelledById,
  description,
  initialFocusRef
}) {
  const [mounted, setMounted] = useState(show);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef(null);
  const panelRef = useRef(null);

  // Mount / Unmount yönetimi
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

  // ESC kapama
  useEffect(() => {
    if (!show || !closeOnEsc) return;
    const handle = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [show, closeOnEsc, onClose]);

  // Focus trap
  useFocusTrap(panelRef, show);

  // Body scroll lock
  useLockBodyScroll(show);

  // Outside click
  const handleBackdrop = useCallback(
    (e) => {
      if (!closeOnBackdrop) return;
      if (e.target === containerRef.current) {
        onClose?.();
      }
    },
    [closeOnBackdrop, onClose]
  );

  // Başlık id bağlantısı
  const headingId = labelledById || `modal-heading-${Math.random().toString(36).slice(2)}`;
  const descId = description ? `modal-desc-${Math.random().toString(36).slice(2)}` : undefined;

  if (!mounted) return null;

  return createPortal(
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] flex items-start justify-center px-4 pt-24 pb-10
        bg-[#0b1020d9] backdrop-blur-sm transition-opacity
        ${animating ? "opacity-100" : "opacity-0"}`}
      onMouseDown={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <div
        ref={panelRef}
        className={`relative w-full max-w-lg rounded-2xl border border-[#28304a] shadow-2xl
        bg-gradient-to-br from-[#23263a] via-[#28304a] to-[#181c2a]
        px-8 py-10 focus:outline-none
        transform transition-all duration-${ANIM_MS}
        ${animating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-3"}`}
      >
        <button
          type="button"
          onClick={() => onClose?.()}
          className="absolute top-3 right-3 text-[#82cfff] hover:text-white hover:scale-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82cfff] rounded"
          aria-label="Kapat"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <header className="mb-6">
          <h2
            id={headingId}
            className="text-2xl font-bold text-[#5ea4ff] tracking-wide drop-shadow"
          >
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-sm text-gray-300 leading-snug">
              {description}
            </p>
          )}
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}