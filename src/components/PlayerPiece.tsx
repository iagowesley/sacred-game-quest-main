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
      className={`flex items-center justify-center font-bold text-white shadow-[var(--shadow-piece)] overflow-hidden ${
        animate ? 'animate-bounce-piece' : ''
      }`}
      style={{
        backgroundColor: avatar ? 'transparent' : color,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
      title={name}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
};
