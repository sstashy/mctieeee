import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Varyant bazlı mesaj bileşeni.
 * role="alert" hızlı okunması istenen kritik hatalar içindir.
 * Daha az kritik uyarılar için role="status" + aria-live="polite" tercih edilebilir.
 */

const VARIANT_STYLES = {
  error: 'bg-red-950/60 border border-red-600 text-red-300',
  warning: 'bg-amber-950/60 border border-amber-500 text-amber-300',
  info: 'bg-sky-950/60 border border-sky-600 text-sky-300',
  success: 'bg-emerald-950/60 border border-emerald-600 text-emerald-300',
};

export default function ErrorMessage({
  message,
  children,
  variant = 'error',
  dismissible = false,
  onClose,
  className = '',
  live = true,
  icon = true,
  testId,
}) {
  const content = children || message;
  if (!content) return null;

  const role = variant === 'error' ? 'alert' : 'status';
  const ariaLive = live ? (variant === 'error' ? 'assertive' : 'polite') : undefined;

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={clsx(
        'relative flex gap-2 items-start rounded-md px-3 py-2 text-sm font-medium',
        VARIANT_STYLES[variant],
        className,
      )}
      data-testid={testId || `message-${variant}`}
    >
      {icon && (
        <span className="mt-[2px]" aria-hidden="true">
          {variant === 'error' && <ErrorIcon />}
          {variant === 'warning' && <WarnIcon />}
          {variant === 'info' && <InfoIcon />}
          {variant === 'success' && <SuccessIcon />}
        </span>
      )}
      <div className="min-w-0 flex-1 leading-snug break-words">{content}</div>
      {dismissible && (
        <button
          type="button"
          aria-label="Kapat"
          onClick={onClose}
          className="ml-2 p-1 rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-black focus-visible:ring-red-400 transition"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  variant: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  live: PropTypes.bool,
  icon: PropTypes.bool,
  testId: PropTypes.string,
};

/* Basit inline ikonlar */
function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M12 7v7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <path d="M12 4 3 20h18L12 4Z" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10v4" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M12 10v6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}
function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="m8 12 3 3 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <path d="M6 6l12 12M18 6l-12 12" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
