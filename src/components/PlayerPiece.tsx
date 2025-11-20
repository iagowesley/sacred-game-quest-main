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
        height: size * 1.4, // Taller for pawn shape
        zIndex: 20,
        filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.5))'
      }}
    >
      {/* Pawn Body (Cone) */}
      <div
        className="absolute bottom-0 w-full h-3/4 rounded-t-full rounded-b-lg"
        style={{
          background: `conic-gradient(from 180deg at 50% 100%, ${color} 0deg, #000 180deg, ${color} 360deg)`,
          boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3), inset 2px 0 4px rgba(255,255,255,0.3)'
        }}
      ></div>

      {/* Pawn Head (Sphere) */}
      <div
        className="absolute top-0 w-3/4 h-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, #000)`,
          boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {/* Avatar Overlay */}
        {avatar && (
          <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-white/30">
            <img src={avatar} alt={name} className="w-full h-full object-cover opacity-90" />
          </div>
        )}
      </div>

      {/* Base Ring */}
      <div
        className="absolute bottom-0 w-full h-1.5 bg-black/30 rounded-full blur-[1px]"
      ></div>
    </div>
  );
};
