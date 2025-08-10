import React, { useId, useState, useCallback, useDeferredValue, memo } from 'react';
import PropTypes from 'prop-types';
import PlayerCard from '../cards/PlayerCard';
import { useVirtualizer } from '@tanstack/react-virtual';

const VIRTUAL_THRESHOLD = 40;

const tierBorderColors = [
  'border-yellow-400',
  'border-gray-400',
  'border-orange-400',
  'border-blue-400',
  'border-green-400',
];

/* -------------------------------------------
   ALT BİLEŞEN: SANALLAŞTIRILMAMIŞ LİSTE
------------------------------------------- */
function PlayerListPlain({ players, onPlayerClick, maxHeight, loading, emptyMessage }) {
  if (loading) {
    return (
      <ul
        className="player-list w-full flex flex-col gap-1 px-2 pb-2 overflow-auto custom-scrollbar-container"
        style={{ maxHeight }}
      >
        <li className="py-4 text-center text-sm text-gray-300 italic">Yükleniyor...</li>
      </ul>
    );
  }

  if (!players.length) {
    return (
      <ul
        className="player-list w-full flex flex-col gap-1 px-2 pb-2 overflow-auto custom-scrollbar-container"
        style={{ maxHeight }}
      >
        <li className="py-4 text-center text-xs text-gray-400 italic">{emptyMessage}</li>
      </ul>
    );
  }

  return (
    <ul
      className="player-list w-full flex flex-col gap-1 px-2 pb-2 overflow-auto custom-scrollbar-container"
      style={{ maxHeight }}
    >
      {players.map((player) => (
        <PlayerCard key={player.id ?? player.name} player={player} onSelect={onPlayerClick} />
      ))}
    </ul>
  );
}

PlayerListPlain.propTypes = {
  players: PropTypes.array.isRequired,
  onPlayerClick: PropTypes.func,
  maxHeight: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

/* -------------------------------------------
   ALT BİLEŞEN: SANALLAŞTIRILMIŞ LİSTE
------------------------------------------- */
function PlayerListVirtual({ players, onPlayerClick, maxHeight, loading, emptyMessage }) {
  const parentRef = React.useRef(null);
  const count = loading ? 0 : players.length;

  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 8,
  });

  const items = rowVirtualizer.getVirtualItems();

  return (
    <ul
      ref={parentRef}
      className="player-list w-full flex flex-col gap-1 px-2 pb-2 overflow-auto custom-scrollbar-container"
      style={{
        maxHeight,
        willChange: count ? 'transform' : 'auto',
      }}
    >
      {loading && <li className="py-4 text-center text-sm text-gray-300 italic">Yükleniyor...</li>}
      {!loading && !players.length && (
        <li className="py-4 text-center text-xs text-gray-400 italic">{emptyMessage}</li>
      )}
      {!loading && !!players.length && (
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((v) => {
            const player = players[v.index];
            return (
              <div
                key={player.id ?? player.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${v.start}px)`,
                }}
              >
                <PlayerCard player={player} onSelect={onPlayerClick} />
              </div>
            );
          })}
        </div>
      )}
    </ul>
  );
}

PlayerListVirtual.propTypes = {
  players: PropTypes.array.isRequired,
  onPlayerClick: PropTypes.func,
  maxHeight: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

/* -------------------------------------------
   ESAS BİLEŞEN
------------------------------------------- */
function TierListBase({
  title = 'Tier',
  players = [],
  idx = 0,
  onPlayerClick,
  showCount = true,
  collapsible = false,
  defaultCollapsed = false,
  loading = false,
  emptyMessage = "Bu tier'de oyuncu yok.",
  className = '',
  virtual = true,
  maxHeight = 360,
  'data-testid': testId,
}) {
  // HOOK SIRASI SABİT
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const headingId = useId();
  const listId = useId();

  // players array değilse normalize
  const safePlayers = Array.isArray(players) ? players : [];

  // Defer
  const deferredPlayers = useDeferredValue(safePlayers);

  const handlePlayerClick = useCallback(
    (player) => {
      onPlayerClick?.(player);
    },
    [onPlayerClick],
  );

  const enableVirtual =
    virtual && !collapsed && !loading && deferredPlayers.length >= VIRTUAL_THRESHOLD;

  const borderColor = tierBorderColors[idx % tierBorderColors.length];

  const ListComponent = enableVirtual ? PlayerListVirtual : PlayerListPlain;

  return (
    <section
      className={`tier-card border-t-4 ${borderColor} bg-gray-800/60 flex-shrink-0 rounded-xl shadow-md flex flex-col ${className}`}
      style={{
        minWidth: 180,
        maxWidth: 260,
        contentVisibility: 'auto',
        containIntrinsicSize: '400px',
      }}
      aria-labelledby={headingId}
      data-testid={testId || `tier-${idx}`}
    >
      <header className="tier-header flex items-center justify-between gap-2 px-3 py-2 select-none cursor-default">
        <button
          type="button"
          onClick={() => collapsible && setCollapsed((c) => !c)}
          disabled={!collapsible}
          aria-expanded={!collapsed}
          aria-controls={listId}
          id={headingId}
          className={`tier-title group text-left font-bold text-base tracking-wide flex-1 text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-yellow-400 rounded ${
            collapsible ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {collapsible && (
              <svg
                className={`h-4 w-4 transition-transform ${
                  collapsed ? '-rotate-90' : 'rotate-0'
                } opacity-80 group-hover:opacity-100`}
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {title}
            {showCount && (
              <span className="text-[11px] leading-none px-2 py-[3px] rounded-full bg-gray-900 text-gray-300 font-semibold">
                {deferredPlayers.length}
              </span>
            )}
          </span>
        </button>
      </header>

      {!collapsed && (
        <div id={listId} role="group" aria-label={`${title} oyuncu listesi`} className="relative">
          <ListComponent
            players={deferredPlayers}
            onPlayerClick={handlePlayerClick}
            maxHeight={maxHeight}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        </div>
      )}
    </section>
  );
}

TierListBase.propTypes = {
  title: PropTypes.string,
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      tierType: PropTypes.string,
    }),
  ),
  idx: PropTypes.number,
  onPlayerClick: PropTypes.func,
  showCount: PropTypes.bool,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  virtual: PropTypes.bool,
  maxHeight: PropTypes.number,
};

const TierList = memo(TierListBase, (prev, next) => {
  return (
    prev.title === next.title &&
    prev.idx === next.idx &&
    prev.loading === next.loading &&
    prev.collapsible === next.collapsible &&
    prev.defaultCollapsed === next.defaultCollapsed &&
    prev.showCount === next.showCount &&
    prev.players === next.players &&
    prev.className === next.className &&
    prev.virtual === next.virtual &&
    prev.maxHeight === next.maxHeight &&
    prev.emptyMessage === next.emptyMessage
  );
});

TierList.displayName = 'TierList';

export default TierList;
