import clsx from 'clsx';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={clsx('animate-pulse rounded-md bg-[var(--color-fg)]/10', className)}
      role="presentation"
      aria-hidden="true"
    />
  );
}
