import React from "react";
import PropTypes from "prop-types";

/**
 * TIER meta bilgilerinin tek yerde tutulması genişlemeyi kolaylaştırır.
 */
const TIER_META = {
  HT: { label: "High Tier", color: "#87eb99" },
  LT: { label: "Low Tier", color: "#d85d6a" }
};

function getTierMeta(tierType) {
  return TIER_META[tierType] || { label: "Unknown Tier", color: "#888" };
}

/**
 * PlayerCard
 * Desteklenen callback prop adları:
 *  - onSelect (tercih edilen)
 *  - onClick  (alias, geriye dönük uyumluluk)
 */
export const PlayerCard = React.memo(function PlayerCard({
  player,
  onSelect,
  onClick,
  disabled = false
}) {
  if (!player) return null;

  const name = player?.name || "Unknown";
  const { label: tierLabel, color: tierColor } = getTierMeta(player?.tierType);

  // Alias çözümü: önce onSelect, yoksa onClick
  const fire = (p) => {
    if (disabled) return;
    if (onSelect) onSelect(p);
    else if (onClick) onClick(p);
  };

  const handleClick = () => fire(player);

  const handleKeyUp = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fire(player);
    }
  };

  return (
    <li className="list-none px-0 mx-0">
      <button
        type="button"
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        disabled={disabled}
        title={name}
        aria-label={`Oyuncu profili: ${name} (${tierLabel})`}
        data-player-name={name}
        className={`
          group player-card w-full flex items-center gap-2 py-0.5 px-2
          border rounded-[4px] min-w-0
          text-[13px] font-medium tracking-tight
          border-[#272748] bg-transparent
          text-[#e3e3ec]
          hover:bg-[#23243a] hover:border-indigo-500
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        style={{
          lineHeight: "1.07",
          minHeight: 26
        }}
      >
        <span
          aria-label={tierLabel}
          className="flex-none shrink-0 rounded-sm"
          style={{
            width: 3,
            height: 20,
            background: tierColor
          }}
        />
        <PlayerAvatar
          playerName={name}
          size={20}
          tierColor={tierColor}
        />
        <span
          className="player-name-ellipsis text-yellow-50 font-medium tracking-tight min-w-0 truncate block"
          style={{ fontWeight: 500, letterSpacing: ".01em" }}
        >
          {name}
        </span>
        <ChevronRight
          className="ml-auto flex-none opacity-70 group-hover:opacity-90 transition-opacity"
          size={14}
        />
      </button>
    </li>
  );
});

PlayerCard.displayName = "PlayerCard";

PlayerCard.propTypes = {
  player: PropTypes.shape({
    name: PropTypes.string.isRequired,
    tierType: PropTypes.string
  }).isRequired,
  onSelect: PropTypes.func,
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};

/**
 * Avatar bileşeni
 */
function PlayerAvatar({ playerName, size = 20 }) {
  const [errored, setErrored] = React.useState(false);

  const src = errored
    ? "/fallback-avatar.png"
    : `https://minotar.net/avatar/${encodeURIComponent(playerName)}/32`;

  return (
    <img
      src={src}
      alt={`${playerName} avatar`}
      width={size}
      height={size}
      decoding="async"
      loading="lazy"
      draggable={false}
      onError={() => setErrored(true)}
      className="shadow-sm mr-2 flex-none shrink-0 rounded-[3px]"
      style={{
        minWidth: size,
        minHeight: size,
        boxShadow: "0 1px 3px #0002"
      }}
    />
  );
}

PlayerAvatar.propTypes = {
  playerName: PropTypes.string.isRequired,
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

export default PlayerCard;