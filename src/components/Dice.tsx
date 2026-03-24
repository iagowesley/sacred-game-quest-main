interface DiceProps {
  value: number;
  isRolling: boolean;
}

export const Dice = ({ value, isRolling }: DiceProps) => {
  const getDiceDots = (num: number): [number, number][] => {
    const dots: Record<number, [number, number][]> = {
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
    };
    return dots[num] || [];
  };

  return (
    <div className="relative perspective-1000">
      <div
        className={`relative w-24 h-24 rounded-xl transform-gpu ${isRolling ? 'animate-dice-roll-3d' : ''}`}
        style={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          border: '2px solid rgba(139,92,246,0.2)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="absolute inset-0 p-3 rounded-xl">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
            {Array.from({ length: 9 }).map((_, idx) => {
              const row = Math.floor(idx / 3);
              const col = idx % 3;
              const isActive = getDiceDots(value).some(([r, c]) => r === row && c === col);
              return (
                <div
                  key={idx}
                  className={`rounded-full transition-all duration-300 ${
                    isActive ? 'scale-100 shadow-md' : 'scale-0'
                  }`}
                  style={isActive ? {
                    background: 'hsl(270 60% 55%)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                  } : undefined}
                />
              );
            })}
          </div>
        </div>
        {/* Brilho */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
