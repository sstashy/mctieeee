import React from 'react';

export default function SiteStatusBadge({ data, phase, isLoading, isRefreshing, isError, reload }) {
  if ((!data && (phase === 'loading' || phase === 'idle')) || isLoading) return null;

  if (isError) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md bg-red-500/15 text-red-300 px-3 py-1 text-xs">
        <span>Durum alınamadı</span>
        <button onClick={reload} className="underline decoration-dotted hover:text-red-200">
          yenile
        </button>
      </div>
    );
  }
  const active = data?.active !== false;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs ${
        active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-yellow-500/15 text-yellow-300'
      }`}
    >
      <span>
        {data?.message || (active ? 'Site aktif' : 'Bakım')}
        {isRefreshing && <span className="animate-pulse">…</span>}
      </span>
    </div>
  );
}
