import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

/**
 * Tier meta (renk vs). Gerekirse theme token'a bağlayabilirsin.
 */
const TIER_META = {
  HT: { label: "High Tier", color: "#16a34a" },
  LT: { label: "Low Tier", color: "#dc2626" }
};
const UNKNOWN_META = { label: "Unknown Tier", color: "#6b7280" };

function getTierMeta(t) {
  return TIER_META[t] || UNKNOWN_META;
}

function PlayerAvatar({ name, size = 20 }) {
  const [errored, setErrored] = React.useState(false);

  const src = errored
    ? "/fallback-avatar.png"
    : `https://minotar.net/avatar/${encodeURIComponent(name)}/32`;

  return (
    <img
      src={src}
      alt={`${name} avatar`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => !errored && setErrored(true)}
      className="player-avatar-img flex-none rounded-[3px] shadow-sm"
      style={{
        minWidth: size,
        minHeight: size,
        boxShadow: "0 1px 3px #0002",
        objectFit: "cover"
      }}
    />
  );
}

PlayerAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number
};

function ChevronRight({ size = 14, className = "" }) {
  return (
    <svg
      height={size}
      width={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6 13l4-4 4 4"
        stroke="#bfc6ca"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
ChevronRight.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string
};

const PlayerCard = React.memo(function PlayerCard({
  player,
  onSelect,
  onClick,
  disabled = false,
  className
}) {
  if (!player) return null;
  const name = player.name || "Unknown";
  const tierMeta = getTierMeta(player.tierType);

  const fire = React.useCallback(
    (p) => {
      if (disabled) return;
      if (onSelect) onSelect(p);
      else if (onClick) onClick(p);
    },
    [onSelect, onClick, disabled]
  );

  const handleClick = () => fire(player);
  const handleKeyUp = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fire(player);
    }
  };

  return (
    <li className="list-none p-0 m-0">
      <button
        type="button"
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        disabled={disabled}
        aria-label={`Oyuncu profili: ${name} (${tierMeta.label})`}
        data-player-name={name}
        className={clsx(
          "group player-card w-full flex items-center gap-2 py-[3px] px-2",
          "rounded-[5px] min-w-0 text-[13px] font-medium tracking-tight",
            "border border-[#272748] bg-transparent text-[#e3e3ec]",
          "hover:bg-[#23243a] hover:border-indigo-500 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-indigo-400/70 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        style={{ lineHeight: "1.07", minHeight: 26 }}
      >
        <span
          aria-label={tierMeta.label}
          className="flex-none shrink-0 rounded-sm"
          style={{
            width: 3,
            height: 20,
            background: tierMeta.color
          }}
        />
        <PlayerAvatar name={name} size={20} />
        <span className="player-name-ellipsis text-yellow-50 font-medium tracking-tight min-w-0 truncate">
          {name}
        </span>
        <ChevronRight
          className="ml-auto flex-none opacity-60 group-hover:opacity-90 transition-opacity"
          size={14}
        />
      </button>
    </li>
  );
},
// areEqual comparator
(prev, next) => {
  const a = prev.player;
  const b = next.player;
  return (
    a === b ||
    (a &&
      b &&
      a.id === b.id &&
      a.name === b.name &&
      a.tierType === b.tierType)
      && prev.disabled === next.disabled
  );
});

PlayerCard.displayName = "PlayerCard";

PlayerCard.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    tierType: PropTypes.string
  }).isRequired,
  onSelect: PropTypes.func,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default PlayerCard;