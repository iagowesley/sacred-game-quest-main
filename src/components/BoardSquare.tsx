import { BoardSquare as BoardSquareType } from "@/types/game";
import { ArrowDown, ArrowUp, FlagBanner, Star, Trophy } from "@phosphor-icons/react";

interface BoardSquareProps {
  square: BoardSquareType;
  size?: number;
}

export const BoardSquare = ({ square, size = 92 }: BoardSquareProps) => {
  const isStartOrEnd = square.id === 0 || square.id === 30;
  const badgeSize = Math.round(size * 0.28);
  const badgeFontSize = Math.max(10, Math.round(size * 0.13));
  const iconSize = Math.max(24, Math.round(size * 0.3));
  const labelFontSize = Math.max(10, Math.round(size * 0.13));

  const getBg = () => {
    switch (square.type) {
      case "bonus":
        return "linear-gradient(160deg, hsl(var(--board-bonus)) 0%, hsl(101 90% 32%) 100%)";
      case "forward":
        return "linear-gradient(160deg, hsl(var(--board-forward)) 0%, hsl(145 55% 28%) 100%)";
      case "back":
        return "linear-gradient(160deg, hsl(var(--board-back)) 0%, hsl(0 65% 36%) 100%)";
      default:
        return isStartOrEnd
          ? "linear-gradient(160deg, hsl(var(--board-bonus)) 0%, hsl(101 90% 32%) 100%)"
          : "linear-gradient(160deg, hsl(var(--board-square)) 0%, hsl(var(--board-square-alt)) 100%)";
    }
  };

  const getIcon = () => {
    if (square.id === 0) return <FlagBanner size={iconSize} weight="fill" className="text-white drop-shadow" />;
    if (square.id === 30) return <Trophy size={iconSize} weight="fill" className="text-white drop-shadow" />;

    switch (square.type) {
      case "bonus":
        return <Star size={iconSize} weight="fill" className="text-white drop-shadow" />;
      case "forward":
        return <ArrowUp size={iconSize} weight="bold" className="text-white drop-shadow" />;
      case "back":
        return <ArrowDown size={iconSize} weight="bold" className="text-white drop-shadow" />;
      default:
        return null;
    }
  };

  const glowColor = () => {
    switch (square.type) {
      case "bonus":
        return "var(--shadow-gold)";
      case "forward":
        return "0 0 12px hsl(145 55% 38% / 0.5)";
      case "back":
        return "0 0 12px hsl(0 65% 48% / 0.5)";
      default:
        return isStartOrEnd ? "var(--shadow-gold)" : undefined;
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center transition-transform hover:z-10 hover:scale-105"
      style={{
        width: size,
        height: size,
        background: getBg(),
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: [
          "inset 0 2px 4px rgba(255,255,255,0.18)",
          "inset 0 -3px 6px rgba(0,0,0,0.45)",
          "0 4px 0 rgba(0,0,0,0.55)",
          "0 8px 14px rgba(0,0,0,0.45)",
          glowColor(),
        ]
          .filter(Boolean)
          .join(", "),
      }}
    >
      <div
        className="absolute left-1.5 top-1.5 flex items-center justify-center rounded-full bg-black/30 font-bold text-white/70"
        style={{ width: badgeSize, height: badgeSize, fontSize: badgeFontSize }}
      >
        {square.id}
      </div>

      <div className="flex flex-col items-center justify-center">
        {getIcon()}
        {square.label && (
          <span className="mt-1 px-1 text-center font-bold leading-tight text-white/90" style={{ fontSize: labelFontSize }}>
            {square.label}
          </span>
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-[14px]"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)" }}
      />
    </div>
  );
};
