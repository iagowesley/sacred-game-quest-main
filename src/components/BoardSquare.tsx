import { BoardSquare as BoardSquareType } from "@/types/game";
import { Star, ArrowUp, ArrowDown, FlagBanner, Trophy } from "@phosphor-icons/react";

interface BoardSquareProps {
  square: BoardSquareType;
  size?: number;
}

export const BoardSquare = ({ square, size = 76 }: BoardSquareProps) => {
  const isStartOrEnd = square.label === 'Início' || square.label === 'Fim';

  const getBg = () => {
    switch (square.type) {
      case 'bonus':   return 'hsl(var(--board-bonus))';
      case 'forward': return 'hsl(var(--board-forward))';
      case 'back':    return 'hsl(var(--board-back))';
      default:        return isStartOrEnd ? 'hsl(var(--board-bonus))' : 'hsl(var(--board-square))';
    }
  };

  const getIcon = () => {
    if (square.id === 0)  return <FlagBanner size={22} weight="fill" className="text-white drop-shadow" />;
    if (square.id === 30) return <Trophy size={22} weight="fill" className="text-white drop-shadow" />;
    switch (square.type) {
      case 'bonus':   return <Star size={20} weight="fill" className="text-white drop-shadow" />;
      case 'forward': return <ArrowUp size={20} weight="bold" className="text-white drop-shadow" />;
      case 'back':    return <ArrowDown size={20} weight="bold" className="text-white drop-shadow" />;
      default:        return null;
    }
  };

  const glowColor = () => {
    switch (square.type) {
      case 'bonus':   return 'var(--shadow-gold)';
      case 'forward': return '0 0 12px hsl(145 55% 38% / 0.5)';
      case 'back':    return '0 0 12px hsl(0 65% 48% / 0.5)';
      default:        return isStartOrEnd ? 'var(--shadow-gold)' : undefined;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center relative transition-transform hover:scale-105 hover:z-10"
      style={{
        width: size,
        height: size,
        background: getBg(),
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: [
          'inset 0 2px 4px rgba(255,255,255,0.15)',
          'inset 0 -2px 4px rgba(0,0,0,0.4)',
          '0 4px 0 rgba(0,0,0,0.5)',
          '0 6px 12px rgba(0,0,0,0.4)',
          glowColor(),
        ].filter(Boolean).join(', '),
      }}
    >
      {/* Número da casa */}
      <div className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center text-[9px] font-bold rounded-full bg-black/30 text-white/70">
        {square.id}
      </div>

      {/* Ícone central */}
      <div className="flex flex-col items-center justify-center">
        {getIcon()}
        {square.label && (
          <span className="text-[9px] font-bold mt-0.5 text-white/90 text-center px-1 leading-tight">
            {square.label}
          </span>
        )}
      </div>

      {/* Reflexo superior */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[10px]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)' }}
      />
    </div>
  );
};
