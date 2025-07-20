import React, { useEffect, useState } from "react";

// Modal animasyonu için show propunu kullanıyoruz
export default function AuthModal({ show, onClose, children }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) setVisible(true);
    else {
      const timeout = setTimeout(() => setVisible(false), 320);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center bg-[#181c2a]/80 backdrop-blur-sm transition-opacity duration-300 ${show ? "animate-fade-in-bg" : "animate-fade-out-bg"}`}
      onClick={onClose}
    >
      <div
        className={`relative max-w-lg w-full mt-20 bg-gradient-to-br from-[#23263a] via-[#28304a] to-[#181c2a] border border-[#28304a] rounded-2xl shadow-2xl px-8 py-10 transition-all duration-300 ${show ? "animate-modal-in" : "animate-modal-out"}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-3xl text-[#5ea4ff] hover:text-[#82cfff] hover:scale-125 transition-all duration-200 drop-shadow"
          onClick={onClose}
          aria-label="Kapat"
          type="button"
        >
          ×
        </button>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}