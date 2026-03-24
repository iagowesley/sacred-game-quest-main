import { useEffect, useState } from "react";

interface DiceProps {
  value: number;
  isRolling: boolean;
}

// Rotação do cubo para cada face ficar na frente
// Faces: front=1, top=2, right=3, left=4, bottom=5, back=6
const FACE_ROTATIONS: Record<number, string> = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateX(-90deg) rotateY(0deg)",
  3: "rotateX(0deg) rotateY(-90deg)",
  4: "rotateX(0deg) rotateY(90deg)",
  5: "rotateX(90deg) rotateY(0deg)",
  6: "rotateX(0deg) rotateY(180deg)",
};

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

function Face({ dots }: { dots: [number, number][] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: "4px",
        padding: "10px",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: 9 }).map((_, idx) => {
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        const isActive = dots.some(([r, c]) => r === row && c === col);
        return (
          <div
            key={idx}
            style={{
              borderRadius: "50%",
              background: isActive ? "hsl(270 50% 40%)" : "transparent",
              transform: isActive ? "scale(1)" : "scale(0)",
              transition: "transform 0.2s",
              boxShadow: isActive
                ? "inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(255,255,255,0.2)"
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}

const faceStyle = (transform: string): React.CSSProperties => ({
  position: "absolute",
  width: "96px",
  height: "96px",
  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  border: "2px solid rgba(139,92,246,0.25)",
  borderRadius: "12px",
  boxSizing: "border-box",
  backfaceVisibility: "hidden",
  transform,
  boxShadow:
    "inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.15)",
});

export const Dice = ({ value, isRolling }: DiceProps) => {
  const [cubeTransform, setCubeTransform] = useState(FACE_ROTATIONS[1]);

  useEffect(() => {
    if (!isRolling && value) {
      const timer = setTimeout(() => {
        setCubeTransform(FACE_ROTATIONS[value]);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isRolling, value]);

  return (
    <div style={{ perspective: "400px", width: "96px", height: "96px", position: "relative" }}>
      {/* Sombra projetada */}
      <div
        style={{
          position: "absolute",
          bottom: "-14px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70px",
          height: "10px",
          background: "rgba(0,0,0,0.35)",
          borderRadius: "50%",
          filter: "blur(4px)",
          zIndex: 0,
        }}
      />
      <div
        className={isRolling ? "animate-dice-roll-3d-real" : ""}
        style={{
          width: "96px",
          height: "96px",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: isRolling ? undefined : cubeTransform,
          transition: isRolling ? "none" : "transform 0.5s ease-out",
        }}
      >
        {/* Front — 1 */}
        <div style={faceStyle("rotateY(0deg) translateZ(48px)")}>
          <Face dots={DOT_POSITIONS[1]} />
        </div>
        {/* Back — 6 */}
        <div style={faceStyle("rotateY(180deg) translateZ(48px)")}>
          <Face dots={DOT_POSITIONS[6]} />
        </div>
        {/* Right — 3 */}
        <div style={faceStyle("rotateY(90deg) translateZ(48px)")}>
          <Face dots={DOT_POSITIONS[3]} />
        </div>
        {/* Left — 4 */}
        <div style={faceStyle("rotateY(-90deg) translateZ(48px)")}>
          <Face dots={DOT_POSITIONS[4]} />
        </div>
        {/* Top — 2 */}
        <div style={faceStyle("rotateX(90deg) translateZ(48px)")}>
          <Face dots={DOT_POSITIONS[2]} />
        </div>
        {/* Bottom — 5 */}
        <div style={faceStyle("rotateX(-90deg) translateZ(48px)")}>
          <Face dots={DOT_POSITIONS[5]} />
        </div>
      </div>
    </div>
  );
};
