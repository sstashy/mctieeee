import { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md text-sm h-10 px-4 ' +
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
  secondary: 'bg-[var(--color-bg-alt)] text-[var(--color-fg)] hover:bg-[var(--color-border)]',
  ghost: 'bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-fg)]/10',
  danger: 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', loading = false, className, children, ...rest }, ref) => (
    <button ref={ref} className={clsx(base, variants[variant], className)} {...rest}>
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
