import React from 'react';
import clsx from 'clsx';

export default function AuthSubmitButton({
  loading,
  children,
  className = '',
  loadingText,
  disabled,
  icon = true,
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={clsx(
        'relative bg-gradient-to-r from-[#5ea4ff] via-[#82cfff] to-[#5ea4ff]',
        'text-white font-bold px-6 py-3 rounded-xl shadow-lg border border-[#82cfff]',
        'flex items-center justify-center gap-2 transition-all duration-200',
        'hover:from-[#82cfff] hover:to-[#5ea4ff] hover:text-[#23263a] hover:scale-[1.03]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ea4ff] disabled:opacity-60 disabled:cursor-not-allowed',
        className,
      )}
    >
      {loading && (
        <span
          className="absolute left-3 inline-flex h-4 w-4 border-2 border-t-transparent border-white/90 rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {icon && !loading && (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
      <span className="font-semibold tracking-wide">
        {loading ? loadingText || 'İşleniyor...' : children}
      </span>
    </button>
  );
}
