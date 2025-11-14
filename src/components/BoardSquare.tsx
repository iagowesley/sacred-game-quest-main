import { BoardSquare as BoardSquareType } from "@/types/game";
import { Gift, Star, ArrowUp, ArrowDown, Circle } from "lucide-react";

interface BoardSquareProps {
  square: BoardSquareType;
  size?: number;
}

export const BoardSquare = ({ square, size = 60 }: BoardSquareProps) => {
  const getSquareColor = () => {
    switch (square.type) {
      case 'bonus':
        return 'bg-[hsl(var(--board-bonus))] shadow-[0_0_20px_hsl(var(--board-bonus)/0.4)]';
      case 'forward':
        return 'bg-[hsl(var(--board-forward))] shadow-[0_0_20px_hsl(var(--board-forward)/0.4)]';
      case 'back':
        return 'bg-[hsl(var(--board-back))] shadow-[0_0_20px_hsl(var(--board-back)/0.4)]';
      default:
        return 'bg-[hsl(var(--board-square))]';
    }
  };

  const getIcon = () => {
    switch (square.type) {
      case 'bonus':
        return <Star className="w-6 h-6 text-white fill-white" />;
      case 'forward':
        return <ArrowUp className="w-6 h-6 text-white" />;
      case 'back':
        return <ArrowDown className="w-6 h-6 text-white" />;
      default:
        return null;
    }
  };

  const isSpecialSquare = square.type !== 'normal';
  const isStartOrEnd = square.label === 'Início' || square.label === 'Fim';

  return (
    <div
      className={`${getSquareColor()} flex flex-col items-center justify-center shadow-lg border-3 ${
        isSpecialSquare ? 'border-white' : 'border-white/50'
      } relative transition-all hover:scale-105 ${
        isStartOrEnd ? 'ring-4 ring-accent ring-offset-2' : ''
      }`}
      style={{ width: size, height: size }}
    >
      {/* Número da Casa */}
      <div className={`absolute -top-3 -left-3 w-8 h-8 ${
        isStartOrEnd ? 'bg-accent' : 'bg-white'
      } flex items-center justify-center text-xs font-bold ${
        isStartOrEnd ? 'text-foreground' : 'text-primary'
      } shadow-lg`}
      style={{ border: '1px solid hsl(30 100% 50%)' }}>
        {square.id}
      </div>
      
      {/* Ícone Central */}
      <div className="flex flex-col items-center justify-center">
        {getIcon()}
        {square.label && (
          <span className={`text-xs font-bold mt-1 text-center px-1 ${
            isStartOrEnd ? 'text-white text-sm' : 'text-white'
          }`}>
            {square.label}
          </span>
        )}
      </div>
      
      {/* Efeito de Brilho para casas especiais */}
      {isSpecialSquare && !isStartOrEnd && (
        <div className="absolute inset-0 bg-white/10"></div>
      )}
    </div>
  );
};
