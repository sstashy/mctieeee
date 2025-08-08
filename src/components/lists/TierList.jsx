import React, { useState, useId, useCallback, memo } from "react";
import PropTypes from "prop-types";
import PlayerCard from "../cards/PlayerCard";

const tierBorderColors = [
  "border-yellow-400",
  "border-gray-400",
  "border-orange-400",
  "border-blue-400",
  "border-green-400",
];

function TierListBase({
  title = "Tier",
  players = [],
  idx = 0,
  onPlayerClick,
  showCount = true,
  collapsible = false,
  defaultCollapsed = false,
  loading = false,
  emptyMessage = "Bu tier'de oyuncu yok.",
  className = "",
  "data-testid": testId
}) {
  const borderColor = tierBorderColors[idx % tierBorderColors.length];
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const headingId = useId();
  const listId = useId();

  const handleToggle = () => {
    if (collapsible) setCollapsed(c => !c);
  };

  const handlePlayerClick = useCallback(
    (player) => {
      onPlayerClick?.(player);
    },
    [onPlayerClick]
  );

  return (
    <section
      className={`tier-card border-t-4 ${borderColor} bg-gray-800/60 flex-shrink-0 rounded-xl shadow-lg flex flex-col ${className}`}
      style={{ minWidth: 180, maxWidth: 260 }}
      aria-labelledby={headingId}
      data-testid={testId || `tier-${idx}`}
    >
      <header className="tier-header flex items-center justify-between gap-2 px-3 py-2 select-none cursor-default">
        <button
          type="button"
          onClick={handleToggle}
          disabled={!collapsible}
          aria-expanded={!collapsed}
          aria-controls={listId}
          id={headingId}
          className={`tier-title group text-left font-bold text-base tracking-wide flex-1 text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-yellow-400 rounded ${
            collapsible ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {collapsible && (
              <svg
                className={`h-4 w-4 transition-transform ${
                  collapsed ? "-rotate-90" : "rotate-0"
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
                {players.length}
              </span>
            )}
          </span>
        </button>
      </header>

      {!collapsed && (
        <div
          id={listId}
          role="group"
          aria-label={`${title} oyuncu listesi`}
          className="relative"
        >
          <ul
            className="player-list w-full flex flex-col gap-1 px-2 pb-2"
          >
            {loading && (
              <li className="py-4 text-center text-sm text-gray-300 italic">
                Yükleniyor...
              </li>
            )}
            {!loading && players.length === 0 && (
              <li className="py-4 text-center text-xs text-gray-400 italic">
                {emptyMessage}
              </li>
            )}
            {!loading &&
              players.map((player) => (
                <PlayerCard
                  key={player.id ?? player.name}
                  player={player}
                  onSelect={handlePlayerClick}
                />
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}

TierListBase.propTypes = {
  title: PropTypes.string,
  players: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      tierType: PropTypes.string
    })
  ),
  idx: PropTypes.number,
  onPlayerClick: PropTypes.func,
  showCount: PropTypes.bool,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string
};

const TierList = memo(TierListBase);
TierList.displayName = "TierList";

export default TierList;