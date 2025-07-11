import React from "react";

export default function AuthModal({ show, onClose, children }) {
  if (!show) return null;

  return (
    <div className="auth-modal-bg" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-2xl text-yellow-300 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Kapat"
          type="button"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
