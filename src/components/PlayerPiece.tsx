interface PlayerPieceProps {
  color: string;
  name: string;
  size?: number;
  animate?: boolean;
  avatar?: string;
}

export const PlayerPiece = ({ color, name, size = 40, animate = false, avatar }: PlayerPieceProps) => {
  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-500 ${animate ? 'animate-bounce-piece' : ''
        }`}
      style={{
        width: size,
        height: size * 1.4,
        zIndex: 20,
        filter: 'drop-shadow(0px 6px 4px rgba(0,0,0,0.7))',
      }}
    >
      {/* Corpo do peão (Cone) */}
      <div
        className="absolute bottom-0 w-full h-3/4 rounded-t-full rounded-b-lg"
        style={{
          background: `conic-gradient(from 180deg at 50% 100%, ${color} 0deg, #000 180deg, ${color} 360deg)`,
          boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.4), inset 3px 0 6px rgba(255,255,255,0.2)',
        }}
      />

      {/* Cabeça do peão (Esfera) */}
      <div
        className="absolute top-0 w-3/4 h-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, #000)`,
          boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.6)',
        }}
      >
        {/* Reflexo */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)' }}
        />
        {avatar && (
          <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-white/30">
            <img src={avatar} alt={name} className="w-full h-full object-cover opacity-90" />
          </div>
        )}
      </div>

      {/* Sombra de base */}
      <div className="absolute bottom-0 w-full h-1.5 bg-black/40 rounded-full blur-[2px]" />
    </div>
  );
};
