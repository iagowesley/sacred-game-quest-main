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
      className={`flex flex-col items-center justify-center relative transition-all hover:scale-105 hover:z-10`}
      style={{
        width: size,
        height: size,
        background: isSpecialSquare
          ? `linear-gradient(135deg, hsl(var(--${square.type === 'bonus' ? 'board-bonus' : square.type === 'forward' ? 'board-forward' : 'board-back'})) 0%, hsl(var(--${square.type === 'bonus' ? 'board-bonus' : square.type === 'forward' ? 'board-forward' : 'board-back'})) 50%, hsl(var(--${square.type === 'bonus' ? 'board-bonus' : square.type === 'forward' ? 'board-forward' : 'board-back'}) / 0.8) 100%)`
          : 'linear-gradient(135deg, hsl(var(--board-square)) 0%, hsl(var(--board-square) / 0.8) 100%)',
        boxShadow: `
          inset 2px 2px 4px rgba(255, 255, 255, 0.4),
          inset -2px -2px 4px rgba(0, 0, 0, 0.2),
          0 4px 8px rgba(0, 0, 0, 0.3)
        `,
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.1)'
      }}
    >
      {/* Número da Casa - Gravado na peça */}
      <div className={`absolute top-1 left-1 w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-full shadow-inner ${isStartOrEnd ? 'bg-accent text-accent-foreground' : 'bg-black/10 text-foreground/70'
        }`}>
        {square.id}
      </div>

      {/* Ícone Central - Com efeito de relevo */}
      <div className="flex flex-col items-center justify-center drop-shadow-md transform translate-y-1">
        {getIcon()}
        {square.label && (
          <span className={`text-[10px] font-bold mt-1 text-center px-1 leading-tight ${isStartOrEnd ? 'text-foreground' : 'text-foreground/80'
            }`}>
            {square.label}
          </span>
        )}
      </div>

      {/* Textura de madeira/papel */}
      {!isSpecialSquare && (
        <div className="absolute inset-0 opacity-10 pointer-events-none rounded-lg"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}>
        </div>
      )}
    </div>
  );
};
