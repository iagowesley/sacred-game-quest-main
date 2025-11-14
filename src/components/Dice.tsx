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
        className={`relative w-24 h-24 bg-gradient-to-br from-white to-gray-100 shadow-2xl border-2 border-gray-200 transform-gpu ${
          isRolling ? 'animate-dice-roll-3d' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.8)',
        }}
      >
        {/* Dice face */}
        <div className="absolute inset-0 p-3">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
            {Array.from({ length: 9 }).map((_, idx) => {
              const row = Math.floor(idx / 3);
              const col = idx % 3;
              const isActive = getDiceDots(value).some(
                ([r, c]) => r === row && c === col
              );
              return (
                <div
                  key={idx}
                  className={`transition-all duration-300 ${
                    isActive
                      ? 'bg-primary scale-100 shadow-md'
                      : 'bg-transparent scale-0'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
