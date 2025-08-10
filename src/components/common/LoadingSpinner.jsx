import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Esnek Spinner
 * Props:
 *  - size: sm | md | lg
 *  - text: açıklama
 *  - inline: satır içi stil
 *  - visuallyHiddenText: sadece erişilebilirlik
 *  - colorClass: (solid / dual varyantlarında dış renk)
 *  - variant: 'solid' | 'dual' | 'gradient'
 *  - speed: 'slow' | 'normal' | 'fast' | number(ms)
 *  - pulse: true → hafif nefes efekti
 */
const SIZE_MAP = {
  sm: { ring: 'h-4 w-4 border-2', gap: 'gap-1', font: 'text-[11px]' },
  md: { ring: 'h-8 w-8 border-3', gap: 'gap-2', font: 'text-sm' },
  lg: { ring: 'h-12 w-12 border-4', gap: 'gap-3', font: 'text-base' },
};

const SPEED_MAP = {
  slow: 1300,
  normal: 900,
  fast: 550,
};

let injected = false;
function injectOnce() {
  if (injected) return;
  injected = true;
  const style = document.createElement('style');
  style.id = 'spinner-keyframes';
  style.textContent = `
@keyframes spinner-rotate { to { transform: rotate(360deg); } }
@keyframes spinner-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(0.92); } }
@keyframes spinner-dash {
  0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 200; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 200; stroke-dashoffset: -124; }
}
  `;
  document.head.appendChild(style);
}

export default function LoadingSpinner({
  size = 'md',
  text = 'Yükleniyor...',
  className = '',
  inline = false,
  visuallyHiddenText = false,
  colorClass = 'text-blue-400',
  variant = 'solid',
  speed = 'normal',
  pulse = false,
  testId,
}) {
  React.useEffect(() => {
    injectOnce();
  }, []);

  const sizeCfg = SIZE_MAP[size] || SIZE_MAP.md;

  // Süre ms
  const duration = typeof speed === 'number' ? speed : (SPEED_MAP[speed] ?? SPEED_MAP.normal);

  const ringBase = 'relative inline-block flex-shrink-0 will-change-transform';

  const rotateStyle = {
    animation: `spinner-rotate ${duration}ms linear infinite`,
  };

  const pulseStyle = pulse
    ? {
        animation: `${rotateStyle.animation}, spinner-pulse ${Math.round(duration * 2.2)}ms ease-in-out infinite`,
      }
    : rotateStyle;

  const isGradient = variant === 'gradient';
  const isDual = variant === 'dual';

  // Ring içerik varyantları
  let ringContent;

  if (variant === 'gradient') {
    // conic-gradient + mask ile dolu disk gibi spinner
    ringContent = (
      <span
        className={clsx(
          'block rounded-full',
          sizeCfg.ring,
          "before:content-[''] before:absolute before:inset-[18%] before:bg-[#181c2a] before:rounded-full",
          'bg-[conic-gradient(var(--grad-colors))]',
        )}
        style={{
          '--grad-colors': 'from-transparent via-current to-current',
          WebkitMask: 'radial-gradient(farthest-side,#0000 57%,#000 58%)',
          mask: 'radial-gradient(farthest-side,#0000 57%,#000 58%)',
          ...pulseStyle,
        }}
        aria-hidden="true"
      />
    );
  } else if (isDual) {
    // İki yarım halkalı farklı opaklık
    ringContent = (
      <span
        className={clsx(
          'block rounded-full',
          sizeCfg.ring,
          'border-solid border-current',
          'border-t-transparent border-r-current border-b-current border-l-transparent',
          colorClass,
        )}
        style={pulseStyle}
        aria-hidden="true"
      />
    );
  } else {
    // Solid: klasik tek renkli halka
    ringContent = (
      <span
        className={clsx(
          'block rounded-full border-solid border-current',
          sizeCfg.ring,
          'border-t-transparent',
          colorClass,
        )}
        style={pulseStyle}
        aria-hidden="true"
      />
    );
  }

  const id = React.useId();

  return (
    <div
      className={clsx(
        inline
          ? 'inline-flex items-center ' + sizeCfg.gap
          : 'flex flex-col items-center justify-center py-6 ' + sizeCfg.gap,
        sizeCfg.font,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-describedby={id}
      data-testid={testId || 'loading-spinner'}
    >
      <span className={clsx(ringBase)}>{ringContent}</span>
      <span
        id={id}
        className={clsx(
          visuallyHiddenText ? 'sr-only' : 'tracking-tight text-neutral-300 select-none',
        )}
      >
        {text}
      </span>
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  text: PropTypes.string,
  className: PropTypes.string,
  inline: PropTypes.bool,
  visuallyHiddenText: PropTypes.bool,
  colorClass: PropTypes.string, // artık text-* renkleri de çalışır (currentColor)
  variant: PropTypes.oneOf(['solid', 'dual', 'gradient']),
  speed: PropTypes.oneOfType([PropTypes.oneOf(['slow', 'normal', 'fast']), PropTypes.number]),
  pulse: PropTypes.bool,
  testId: PropTypes.string,
};
