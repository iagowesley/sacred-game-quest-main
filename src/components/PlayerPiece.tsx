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
      className={`relative flex items-center justify-center transition-all duration-500 ${animate ? 'animate-bounce-piece' : ''}`}
      style={{
        width: size,
        height: size * 1.4,
        zIndex: 20,
        filter: 'drop-shadow(0px 4px 3px rgba(0,0,0,0.6))',
      }}
    >
      {/* Corpo do peão */}
      <div
        className="absolute bottom-0 w-full h-3/4 rounded-t-full rounded-b-lg"
        style={{
          background: `conic-gradient(from 180deg at 50% 100%, ${color} 0deg, #000 180deg, ${color} 360deg)`,
          boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.4), inset 3px 0 6px rgba(255,255,255,0.2)',
        }}
      />
      {/* Cabeça do peão */}
      <div
        className="absolute top-0 w-3/4 h-1/2 rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, #000)`,
          boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.6)',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)' }}
        />
        {emoji && (
          <span
            className="relative z-10 select-none"
            style={{ fontSize: size * 0.3, lineHeight: 1 }}
          >
            {emoji}
          </span>
        )}
      </div>
      {/* Sombra base */}
      <div className="absolute bottom-0 w-full h-1.5 bg-black/40 rounded-full blur-[2px]" />
    </div>
  );
};
