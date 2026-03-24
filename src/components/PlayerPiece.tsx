interface PlayerPieceProps {
  color: string;
  name: string;
  size?: number;
  animate?: boolean;
  emoji?: string;
}

export const PlayerPiece = ({ color, name, size = 40, animate = false, emoji }: PlayerPieceProps) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full transition-all duration-500 select-none ${animate ? 'animate-bounce-piece' : ''}`}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 2px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)`,
        border: '2px solid rgba(255,255,255,0.25)',
        zIndex: 20,
        fontSize: size * 0.55,
        lineHeight: 1,
      }}
      title={name}
    >
      {emoji ?? '🎲'}
    </div>
  );
};
