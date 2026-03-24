# Frontend Redesign — A Jornada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernizar completamente o visual do jogo cristão "A Jornada" com paleta roxo+dourado, fonte Inter, ícones Phosphor e tabuleiro 3D realista — sem alterar nenhuma lógica de jogo.

**Architecture:** Todas as mudanças são puramente visuais (CSS, JSX styling, troca de ícones). A lógica de estado, hooks Supabase, dados do jogo e tipos TypeScript não são tocados. Os componentes shadcn/ui em `src/components/ui/` também não são modificados.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS 3, shadcn/ui, @phosphor-icons/react, Google Fonts Inter

---

## Mapa de Arquivos

| Arquivo | Ação |
|---|---|
| `src/index.css` | Modificar — tokens de cor, Inter font |
| `src/components/BoardSquare.tsx` | Modificar — 3D squares, Phosphor icons |
| `src/components/PlayerPiece.tsx` | Modificar — sombra mais profunda |
| `src/components/Dice.tsx` | Modificar — pontos roxos |
| `src/components/GameCard.tsx` | Modificar — cards modernos, Phosphor icons |
| `src/components/GameBoard.tsx` | Modificar — moldura, sidebar, Phosphor icons |
| `src/pages/Index.tsx` | Modificar — menu imersivo, Phosphor icons |
| `src/components/PlayerSetup.tsx` | Modificar — estilo moderno, Phosphor icons |
| `src/components/Lobby.tsx` | Modificar — redesign completo, Phosphor icons |
| `src/components/WaitingRoom.tsx` | Modificar — estilo moderno, Phosphor icons |

**NÃO tocar:** `src/hooks/`, `src/data/`, `src/integrations/`, `src/types/`, `src/components/ui/`, lógica de jogo em `GameBoard.tsx`

**Nota sobre pesos dos ícones Phosphor:** O peso padrão é Regular (sem prop). Exceções intencionais: `weight="fill"` para ícones decorativos/especiais (Trophy, FlagBanner, Star, Crown) que precisam de mais presença visual; `weight="bold"` para setas direcionais (ArrowUp, ArrowDown) para melhor visibilidade nas casas do tabuleiro.

**Nota sobre WaitingRoom:** Este componente não contém tabuleiro nem conectores. Apenas o estilo das telas (fundo, cards, botões) precisa ser atualizado.

**Nota sobre o ícone `X`:** Em `PlayerSetup.tsx`, o ícone `X` do Phosphor é usado no botão de remover jogador (`<X size={16} className="text-destructive" />`). Não há conflito com outras libs pois lucide-react é removido dos imports.

---

## Task 1: Instalar @phosphor-icons/react

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Instalar a dependência**

```bash
cd "C:\Users\icosta\Desktop\sacred-game-quest-main"
npm install @phosphor-icons/react
```

Expected: pacote adicionado em `node_modules/@phosphor-icons/react`, entrada no `package.json`

- [ ] **Step 2: Verificar instalação**

```bash
node -e "require('@phosphor-icons/react'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @phosphor-icons/react"
```

---

## Task 2: Tokens de Design — `src/index.css`

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Substituir todo o conteúdo do `src/index.css`**

Substituir o arquivo inteiro pelo conteúdo abaixo. Mantém as animações existentes, troca tokens e adiciona Inter.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 270 20% 8%;
    --foreground: 45 30% 92%;

    --card: 270 18% 13%;
    --card-foreground: 45 30% 92%;

    --popover: 270 18% 13%;
    --popover-foreground: 45 30% 92%;

    --primary: 270 60% 55%;
    --primary-foreground: 45 30% 95%;

    --secondary: 270 20% 20%;
    --secondary-foreground: 45 30% 92%;

    --muted: 270 15% 20%;
    --muted-foreground: 270 10% 60%;

    --accent: 45 95% 52%;
    --accent-foreground: 270 20% 8%;

    --destructive: 0 65% 48%;
    --destructive-foreground: 0 0% 98%;

    --success: 145 55% 38%;
    --success-foreground: 0 0% 98%;

    --border: 270 20% 25%;
    --input: 270 18% 16%;
    --ring: 270 60% 55%;

    --radius: 0.75rem;

    --board-square: 270 25% 18%;
    --board-bonus: 45 90% 48%;
    --board-forward: 145 55% 38%;
    --board-back: 0 65% 48%;

    --shadow-card:
      0 1px 1px hsl(0 0% 0% / 0.12),
      0 2px 2px hsl(0 0% 0% / 0.12),
      0 4px 4px hsl(0 0% 0% / 0.12),
      0 8px 8px hsl(0 0% 0% / 0.12),
      0 16px 16px hsl(0 0% 0% / 0.12);

    --shadow-glow: 0 0 20px hsl(270 60% 55% / 0.5);
    --shadow-gold: 0 0 15px hsl(45 95% 52% / 0.6);

    --shadow-piece:
      0 4px 6px -1px rgba(0, 0, 0, 0.5),
      0 2px 4px -1px rgba(0, 0, 0, 0.3),
      inset 0 -4px 4px -2px rgba(0, 0, 0, 0.4),
      inset 0 4px 4px -2px rgba(255, 255, 255, 0.4);

    --shadow-card-3d:
      0 20px 25px -5px rgba(0, 0, 0, 0.4),
      0 10px 10px -5px rgba(0, 0, 0, 0.2),
      inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .dark {
    --background: 270 20% 8%;
    --foreground: 45 30% 92%;
    --card: 270 18% 13%;
    --card-foreground: 45 30% 92%;
    --popover: 270 18% 13%;
    --popover-foreground: 45 30% 92%;
    --primary: 270 60% 55%;
    --primary-foreground: 45 30% 95%;
    --secondary: 270 20% 20%;
    --secondary-foreground: 45 30% 92%;
    --muted: 270 15% 20%;
    --muted-foreground: 270 10% 60%;
    --accent: 45 95% 52%;
    --accent-foreground: 270 20% 8%;
    --destructive: 0 65% 48%;
    --destructive-foreground: 0 0% 98%;
    --border: 270 20% 25%;
    --input: 270 18% 16%;
    --ring: 270 60% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', sans-serif;
  }
}

@layer utilities {
  .animate-bounce-piece {
    animation: bounce-piece 0.5s ease-in-out;
  }

  @keyframes bounce-piece {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  .animate-move-forward {
    animation: move-forward 0.6s ease-out;
  }

  @keyframes move-forward {
    0% { transform: scale(1); }
    50% { transform: scale(1.3) rotate(10deg); }
    100% { transform: scale(1); }
  }

  @keyframes card-entrance {
    0% { transform: scale(0.5) rotateZ(-10deg); opacity: 0; }
    60% { transform: scale(1.05) rotateZ(2deg); }
    100% { transform: scale(1) rotateZ(0deg); opacity: 1; }
  }

  @keyframes dice-roll {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(90deg) scale(1.1); }
    50% { transform: rotate(180deg) scale(0.9); }
    75% { transform: rotate(270deg) scale(1.1); }
  }

  @keyframes dice-roll-3d {
    0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
    25% { transform: rotateX(180deg) rotateY(90deg) rotateZ(45deg); }
    50% { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
    75% { transform: rotateX(540deg) rotateY(270deg) rotateZ(135deg); }
    100% { transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg); }
  }

  @keyframes glow-pulse {
    0%, 100% { filter: drop-shadow(0 0 8px hsl(45 95% 52% / 0.4)); }
    50% { filter: drop-shadow(0 0 16px hsl(45 95% 52% / 0.8)); }
  }

  .animate-card-entrance {
    animation: card-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .animate-dice-roll {
    animation: dice-roll 0.5s ease-in-out;
  }

  .animate-dice-roll-3d {
    animation: dice-roll-3d 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .animate-glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .perspective-1000 {
    perspective: 1000px;
  }

  .text-gradient-gold {
    background: linear-gradient(135deg, hsl(270 60% 70%) 0%, hsl(45 95% 60%) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
```

- [ ] **Step 2: Verificar que o servidor de dev ainda compila**

```bash
cd "C:\Users\icosta\Desktop\sacred-game-quest-main"
npm run build 2>&1 | grep -E "error|Error" | head -10
```

Expected: sem erros de compilação TypeScript/Tailwind

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: apply royal purple+gold design tokens and Inter font"
```

---

## Task 3: BoardSquare — Casas 3D com Phosphor Icons

**Files:**
- Modify: `src/components/BoardSquare.tsx`

- [ ] **Step 1: Reescrever o componente**

```tsx
import { BoardSquare as BoardSquareType } from "@/types/game";
import { Star, ArrowUp, ArrowDown, FlagBanner, Trophy } from "@phosphor-icons/react";

interface BoardSquareProps {
  square: BoardSquareType;
  size?: number;
}

export const BoardSquare = ({ square, size = 76 }: BoardSquareProps) => {
  const isStartOrEnd = square.label === 'Início' || square.label === 'Fim';
  const isSpecial = square.type !== 'normal';

  const getBg = () => {
    switch (square.type) {
      case 'bonus':   return 'hsl(var(--board-bonus))';
      case 'forward': return 'hsl(var(--board-forward))';
      case 'back':    return 'hsl(var(--board-back))';
      default:        return isStartOrEnd ? 'hsl(var(--board-bonus))' : 'hsl(var(--board-square))';
    }
  };

  const getIcon = () => {
    if (square.id === 0)  return <FlagBanner size={22} weight="fill" className="text-white drop-shadow" />;
    if (square.id === 30) return <Trophy size={22} weight="fill" className="text-white drop-shadow" />;
    switch (square.type) {
      case 'bonus':   return <Star size={20} weight="fill" className="text-white drop-shadow" />;
      case 'forward': return <ArrowUp size={20} weight="bold" className="text-white drop-shadow" />;
      case 'back':    return <ArrowDown size={20} weight="bold" className="text-white drop-shadow" />;
      default:        return null;
    }
  };

  const glowColor = () => {
    switch (square.type) {
      case 'bonus':   return 'var(--shadow-gold)';
      case 'forward': return '0 0 12px hsl(145 55% 38% / 0.5)';
      case 'back':    return '0 0 12px hsl(0 65% 48% / 0.5)';
      default:        return undefined;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center relative transition-transform hover:scale-105 hover:z-10"
      style={{
        width: size,
        height: size,
        background: getBg(),
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: [
          'inset 0 2px 4px rgba(255,255,255,0.15)',
          'inset 0 -2px 4px rgba(0,0,0,0.4)',
          '0 4px 0 rgba(0,0,0,0.5)',
          '0 6px 12px rgba(0,0,0,0.4)',
          glowColor(),
        ].filter(Boolean).join(', '),
      }}
    >
      {/* Número da casa */}
      <div className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center text-[9px] font-bold rounded-full bg-black/30 text-white/70">
        {square.id}
      </div>

      {/* Ícone central */}
      <div className="flex flex-col items-center justify-center">
        {getIcon()}
        {square.label && (
          <span className="text-[9px] font-bold mt-0.5 text-white/90 text-center px-1 leading-tight">
            {square.label}
          </span>
        )}
      </div>

      {/* Reflexo superior */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[10px]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)' }}
      />
    </div>
  );
};
```

- [ ] **Step 2: Build para verificar tipos**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

Expected: sem erros

- [ ] **Step 3: Commit**

```bash
git add src/components/BoardSquare.tsx
git commit -m "style: redesign BoardSquare with 3D effect and Phosphor icons"
```

---

## Task 4: PlayerPiece — Sombra Aprimorada

**Files:**
- Modify: `src/components/PlayerPiece.tsx`

- [ ] **Step 1: Atualizar sombra e reflexo**

```tsx
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
      className={`relative flex items-center justify-center transition-all duration-500 ${animate ? 'animate-bounce-piece' : ''}`}
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
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerPiece.tsx
git commit -m "style: enhance PlayerPiece shadow and highlight"
```

---

## Task 5: Dice — Pontos Roxos

**Files:**
- Modify: `src/components/Dice.tsx`

- [ ] **Step 1: Atualizar estilo do dado**

```tsx
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
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Dice.tsx
git commit -m "style: update Dice with purple dots and improved visuals"
```

---

## Task 6: GameCard — Cards Modernos com Phosphor Icons

**Files:**
- Modify: `src/components/GameCard.tsx`

- [ ] **Step 1: Reescrever o componente**

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  BookOpenText,
  Lightning,
  CheckCircle,
  XCircle,
  CheckFat,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

interface GameCardProps {
  card: any;
  onAnswer: (index: number) => void;
  onChallengeComplete: (completed: boolean) => void;
}

export const GameCard = ({ card, onAnswer, onChallengeComplete }: GameCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    setTimeout(() => {
      onAnswer(index);
      setShowFeedback(false);
      setSelectedAnswer(null);
    }, 2500);
  };

  if (card.type === "question") {
    const isCorrect = selectedAnswer === card.correct;

    return (
      <Dialog open={true}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border border-primary/30 bg-card animate-card-entrance" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
          {/* Header */}
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex items-end p-5">
            <BookOpenText size={80} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/15" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white">Pergunta Bíblica</h3>
              <p className="text-sm text-white/75">Responda corretamente para avançar</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div className="p-5 bg-muted/50 border border-primary/20 rounded-xl relative">
              <span className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Pergunta
              </span>
              <p className="text-base font-semibold text-foreground leading-relaxed">
                {card.question}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {card.options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === index;
                const showCorrect = showFeedback && index === card.correct;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    onClick={() => !showFeedback && handleAnswer(index)}
                    disabled={showFeedback}
                    variant="outline"
                    className={`h-auto py-3 px-4 text-sm border-2 transition-all duration-300 justify-start gap-3 ${
                      showCorrect
                        ? 'border-green-500 bg-green-500/10 text-foreground'
                        : showWrong
                        ? 'border-red-500 bg-red-500/10 text-foreground'
                        : 'border-border hover:border-accent hover:bg-primary/10'
                    }`}
                  >
                    <span className={`w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-full text-xs font-bold ${
                      showCorrect ? 'bg-green-500 text-white' : showWrong ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
                    }`}>
                      {showCorrect
                        ? <CheckCircle size={14} weight="fill" />
                        : showWrong
                        ? <XCircle size={14} weight="fill" />
                        : String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="h-2.5 bg-primary rounded-b" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-accent/30 bg-card animate-card-entrance" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
        {/* Header */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-accent to-accent/70 flex items-end p-5">
          <Lightning size={80} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/10" weight="fill" />
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-accent-foreground">Prenda!</h3>
            <p className="text-sm text-accent-foreground/75">Complete o desafio para avançar</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="p-5 bg-muted/50 border border-accent/20 rounded-xl relative">
            <span className="absolute -top-3 left-4 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
              Desafio
            </span>
            <p className="text-base font-semibold text-foreground leading-relaxed">
              {card.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onChallengeComplete(false)}
              variant="outline"
              className="h-12 text-sm border-2 border-destructive/40 hover:bg-destructive/10 hover:border-destructive gap-2"
            >
              <X size={16} />
              Não completou
            </Button>
            <Button
              onClick={() => onChallengeComplete(true)}
              className="h-12 text-sm bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              style={{ boxShadow: 'var(--shadow-gold)' }}
            >
              <CheckFat size={16} weight="fill" />
              Completou!
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="h-2.5 bg-accent rounded-b" />
      </DialogContent>
    </Dialog>
  );
};
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GameCard.tsx
git commit -m "style: modernize GameCard with glassmorphism and Phosphor icons"
```

---

## Task 7: GameBoard — Moldura, Sidebar e Phosphor Icons

**Files:**
- Modify: `src/components/GameBoard.tsx` (apenas a parte visual/JSX — NÃO tocar a lógica de jogo)

- [ ] **Step 1: Substituir apenas os imports de ícones no topo do arquivo**

Remover:
```tsx
import { Trophy, RotateCcw, Dices } from "lucide-react";
```

Adicionar:
```tsx
import { Trophy, ArrowCounterClockwise, Dice5, Crown } from "@phosphor-icons/react";
```

- [ ] **Step 2: Atualizar o JSX do `return` — Header**

Localizar o bloco do header (começa em `<div className="flex justify-between items-center mb-6`) e substituir pelo novo:

```tsx
{/* Header */}
<div className="flex justify-between items-center mb-4 bg-card/80 px-5 py-3 rounded-xl border border-border/50 backdrop-blur-sm">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center" style={{ boxShadow: 'var(--shadow-glow)' }}>
      <Trophy size={20} weight="fill" className="text-primary-foreground" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-gradient-gold tracking-wide">
        A Jornada
      </h1>
      {!winner && (
        <p className="text-xs text-muted-foreground">
          Vez de: <span className="font-semibold text-foreground">{players[currentPlayer].name}</span>
        </p>
      )}
      {winner && (
        <p className="text-sm font-bold text-accent animate-pulse">
          Vencedor: {winner.name}!
        </p>
      )}
    </div>
  </div>
  <Button
    variant="outline"
    onClick={onRestart}
    className="border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/40 gap-2 text-sm"
  >
    <ArrowCounterClockwise size={15} />
    Novo jogo
  </Button>
</div>
```

- [ ] **Step 3: Atualizar o container do tabuleiro**

Localizar `<div className="p-8 bg-[#eecfa1]...` e substituir pelo novo container:

```tsx
<div
  className="p-6 rounded-2xl relative overflow-hidden"
  style={{
    background: 'hsl(270 25% 12%)',
    border: '20px solid #1a0d2e',
    boxShadow: 'inset 0 0 30px hsl(45 95% 52% / 0.08), 0 20px 60px rgba(0,0,0,0.6)',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
  }}
>
  {/* Borda interna dourada */}
  <div className="absolute inset-0 border-2 border-accent/20 rounded-lg pointer-events-none m-1" />

  {/* Cantoneiras decorativas */}
  <div className="absolute top-3 left-3 text-accent/60 text-2xl pointer-events-none select-none">✦</div>
  <div className="absolute top-3 right-3 text-accent/60 text-2xl pointer-events-none select-none">✦</div>
  <div className="absolute bottom-3 left-3 text-accent/60 text-2xl pointer-events-none select-none">✦</div>
  <div className="absolute bottom-3 right-3 text-accent/60 text-2xl pointer-events-none select-none">✦</div>

  {/* Versículo */}
  <p className="text-[10px] italic text-accent/60 text-center mb-3 tracking-wide">
    "Lâmpada para os meus pés é tua palavra" — Salmos 119:105
  </p>

  {/* Ornamento lateral superior */}
  <div className="flex items-center gap-2 mb-3 px-8">
    <div className="flex-1 border-t border-accent/15" />
    <span className="text-accent/30 text-xs">◆</span>
    <div className="flex-1 border-t border-accent/15" />
  </div>

  {/* Caminho do jogo — mantém estrutura existente de linhas serpentinas */}
  <div className="relative">
    {/* ... linhas do tabuleiro existentes ficam aqui intactas ... */}
  </div>

  {/* Ornamento lateral inferior */}
  <div className="flex items-center gap-2 mt-3 px-8">
    <div className="flex-1 border-t border-accent/15" />
    <span className="text-accent/30 text-xs">◆</span>
    <div className="flex-1 border-t border-accent/15" />
  </div>
</div>
```

**Nota importante:** o conteúdo da div `.relative` com as 5 linhas do tabuleiro (board.slice) é mantido exatamente como está. Apenas o container externo muda. Os conectores entre casas devem ter sua cor atualizada de `#5d4037` para `hsl(var(--accent) / 0.3)`.

- [ ] **Step 4: Atualizar a Sidebar — Card de jogadores**

Localizar `<Card className="p-4 bg-card shadow-[var(--shadow-card)]">` da seção de jogadores e atualizar o item de cada jogador:

```tsx
<div
  key={index}
  className={`p-3 rounded-lg transition-all ${
    index === currentPlayer && !winner
      ? 'bg-primary/15 border-2 border-accent'
      : 'bg-muted/30 border border-border/30'
  }`}
  style={index === currentPlayer && !winner ? { boxShadow: 'var(--shadow-gold)' } : undefined}
>
  <div className="flex items-center gap-3">
    <PlayerPiece color={player.color} name={player.name} size={36} avatar={player.avatar} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        {index === currentPlayer && !winner && (
          <Crown size={13} weight="fill" className="text-accent flex-shrink-0" />
        )}
        <div className="font-medium text-sm truncate">{player.name}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-1">
        Casa {player.position}/{TOTAL_SQUARES}
      </div>
      {/* Barra de progresso */}
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-accent/60 rounded-full transition-all duration-500"
          style={{ width: `${(player.position / TOTAL_SQUARES) * 100}%` }}
        />
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 5: Atualizar botão de dado e tela de vitória**

Botão de dado:
```tsx
<Button
  onClick={rollDice}
  disabled={isRollingDice || (diceValue !== null && !showCard)}
  className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 text-base py-6 gap-2"
  style={{ boxShadow: isRollingDice ? undefined : 'var(--shadow-glow)' }}
>
  <Dice5 size={20} />
  {isRollingDice ? 'Rolando dado...' : diceValue && !showCard ? 'Aguarde...' : 'Jogar dado'}
</Button>
```

Tela de vitória:
```tsx
<div className="text-center py-6">
  <Trophy size={64} weight="fill" className="text-accent mx-auto mb-3 animate-bounce" />
  <h2 className="text-2xl font-bold text-accent mb-1">Parabéns!</h2>
  <p className="text-muted-foreground">{winner.name} venceu a jornada!</p>
</div>
```

- [ ] **Step 6: Atualizar cores dos conectores serpentinos**

Em todas as ocorrências de `bg-[#5d4037]` e `borderTop: '2px dashed #5d4037'` e `borderLeft: '2px dashed #5d4037'` nos conectores entre casas, substituir a cor por `hsl(45 95% 52% / 0.3)`:

```tsx
// Conectores horizontais
<div className="absolute top-1/2 -right-4 w-6 h-1 z-0"
  style={{ transform: 'translateY(-50%)', borderTop: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />

// Conectores verticais
<div className="absolute -bottom-14 left-1/2 w-1 h-16 z-0"
  style={{ transform: 'translateX(-50%)', borderLeft: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
```

- [ ] **Step 7: Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Step 8: Commit**

```bash
git add src/components/GameBoard.tsx
git commit -m "style: redesign GameBoard with ornate frame, golden sidebar and Phosphor icons"
```

---

## Task 8: Menu Principal — `src/pages/Index.tsx`

**Files:**
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Atualizar o bloco do menu**

Substituir o import de `Wifi, WifiOff` por Phosphor e reescrever o JSX do modo `'menu'`:

Imports a remover:
```tsx
import { Wifi, WifiOff } from "lucide-react";
```

Imports a adicionar:
```tsx
import { WifiHigh, UsersThree } from "@phosphor-icons/react";
```

Substituir o bloco `if (mode === 'menu')`:

```tsx
if (mode === 'menu') {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-16 px-4"
      style={{
        background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)',
      }}
    >
      {/* Centro — logo e título */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <div className="animate-glow-pulse">
          <img
            src="/biblia34.png"
            alt="A Jornada"
            className="w-28 h-28 object-contain"
            style={{ filter: 'drop-shadow(0 0 20px hsl(45 95% 52% / 0.5))' }}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-gradient-gold tracking-tight">
            A Jornada
          </h1>
          <p className="text-muted-foreground italic text-lg">
            Uma aventura bíblica
          </p>
        </div>

        {/* Ornamento */}
        <div className="flex items-center gap-3 text-accent/40">
          <div className="w-16 border-t border-accent/20" />
          <span className="text-sm">✦</span>
          <div className="w-16 border-t border-accent/20" />
        </div>
      </div>

      {/* Botões na parte inferior */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          onClick={() => setMode('online')}
          className="w-full bg-primary hover:bg-primary/90 text-lg py-7 gap-3 transition-all duration-300"
          style={{ boxShadow: 'var(--shadow-glow)' }}
        >
          <WifiHigh size={22} />
          Jogar Online
        </Button>

        <Button
          onClick={() => setMode('local')}
          variant="outline"
          className="w-full border-2 border-primary/40 hover:bg-primary/10 hover:border-primary text-lg py-7 gap-3 transition-all duration-300"
        >
          <UsersThree size={22} />
          Jogar Local
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Atualizar tela de loading**

```tsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)' }}>
      <p className="text-muted-foreground text-lg animate-pulse">Carregando...</p>
    </div>
  );
}
```

- [ ] **Step 3: Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "style: redesign main menu with immersive purple gradient and Phosphor icons"
```

---

## Task 9: PlayerSetup — Estilo Moderno

**Files:**
- Modify: `src/components/PlayerSetup.tsx`

- [ ] **Step 1: Atualizar imports e JSX**

Remover:
```tsx
import { Plus, X } from "lucide-react";
```

Adicionar:
```tsx
import { UserPlus, X, Play } from "@phosphor-icons/react";
```

Substituir o `return` completo:

```tsx
return (
  <div
    className="min-h-screen flex items-center justify-center p-4"
    style={{ background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)' }}
  >
    <Card className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <img
          src="/biblia34.png"
          alt="A Jornada"
          className="w-20 h-20 object-contain mx-auto mb-4"
          style={{ filter: 'drop-shadow(0 0 12px hsl(45 95% 52% / 0.4))' }}
        />
        <h1 className="text-3xl font-bold text-gradient-gold mb-1">A Jornada</h1>
        <p className="text-muted-foreground">Perguntas e desafios sobre a bíblia e a igreja</p>
      </div>

      <div className="space-y-3 mb-6">
        <h2 className="text-base font-semibold text-foreground">
          Jogadores ({players.length}/8)
        </h2>

        {players.map((player, index) => (
          <div key={index} className="space-y-2 p-4 bg-muted/30 border border-border/40 rounded-xl">
            <div className="flex gap-2">
              <Input
                placeholder={`Jogador ${index + 1}`}
                value={player.name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                className="flex-1 bg-input border-border focus:border-accent text-foreground placeholder:text-muted-foreground"
              />
              {players.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removePlayer(index)}
                  className="border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
                >
                  <X size={16} className="text-destructive" />
                </Button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => updatePlayerAvatar(index, avatar.src)}
                  className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all hover:scale-110 ${
                    player.avatar === avatar.src
                      ? 'border-accent'
                      : 'border-border/40 hover:border-primary/50'
                  }`}
                  style={player.avatar === avatar.src ? { boxShadow: 'var(--shadow-gold)' } : undefined}
                  title={avatar.name}
                >
                  <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {players.length < 8 && (
          <Button
            variant="outline"
            onClick={addPlayer}
            className="w-full border-dashed border-primary/30 hover:bg-primary/10 hover:border-primary gap-2"
          >
            <UserPlus size={16} />
            Adicionar jogador
          </Button>
        )}

        {error && <p className="text-destructive text-sm text-center">{error}</p>}
      </div>

      <Button
        onClick={handleStartGame}
        className="w-full bg-primary hover:bg-primary/90 text-lg py-6 gap-2 transition-all duration-300"
        style={{ boxShadow: 'var(--shadow-glow)' }}
      >
        <Play size={20} weight="fill" />
        Iniciar jogo
      </Button>
    </Card>
  </div>
);
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerSetup.tsx
git commit -m "style: modernize PlayerSetup with dark theme and Phosphor icons"
```

---

## Task 10: Lobby — Redesign Completo

**Files:**
- Modify: `src/components/Lobby.tsx`

- [ ] **Step 1: Atualizar imports**

Remover:
```tsx
import { Trophy, Copy, Users } from "lucide-react";
```

Adicionar:
```tsx
import { BookOpen, Plus, SignIn, ArrowLeft } from "@phosphor-icons/react";
```

- [ ] **Step 2: Reescrever o JSX do modo 'menu' do Lobby**

```tsx
if (mode === 'menu') {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-16 px-4"
      style={{ background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm relative bg-card border border-accent/30 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
          {/* Cantoneiras */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent/50 rounded-tl" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-accent/50 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-accent/50 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-accent/50 rounded-br" />

          <div className="flex flex-col items-center gap-6">
            <BookOpen size={48} className="text-accent/80" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gradient-gold">A Jornada</h1>
              <p className="text-muted-foreground italic text-sm mt-1">Uma aventura bíblica multijogador</p>
            </div>

            <div className="w-full space-y-3">
              <Button
                onClick={() => setMode('create')}
                className="w-full bg-primary hover:bg-primary/90 text-base py-6 gap-2"
                style={{ boxShadow: 'var(--shadow-glow)' }}
              >
                <Plus size={20} />
                Criar Sala
              </Button>
              <Button
                onClick={() => setMode('join')}
                variant="outline"
                className="w-full border-2 border-primary/40 hover:bg-primary/10 hover:border-primary text-base py-6 gap-2"
              >
                <SignIn size={20} />
                Entrar em Sala
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Reescrever o JSX do modo 'create'/'join'**

```tsx
return (
  <div
    className="min-h-screen flex items-center justify-center p-4"
    style={{ background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)' }}
  >
    <div className="w-full max-w-md relative bg-card border border-accent/30 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
      {/* Cantoneiras */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent/50 rounded-tl" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-accent/50 rounded-tr" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-accent/50 rounded-bl" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-accent/50 rounded-br" />

      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gradient-gold">
            {mode === 'create' ? 'Criar Nova Sala' : 'Entrar na Sala'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1 italic">
            {mode === 'create' ? 'Prepare-se para a aventura...' : 'Digite o código secreto...'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Seu Nome
            </label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={20}
              className="bg-input border-border focus:border-accent text-foreground placeholder:text-muted-foreground text-base py-5"
            />
          </div>

          {mode === 'join' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                Código da Sala
              </label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                maxLength={6}
                className="bg-input border-border focus:border-accent text-foreground placeholder:text-muted-foreground text-base py-5 uppercase tracking-[0.2em] font-bold text-center"
              />
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={mode === 'create' ? createRoom : joinRoom}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-base py-6 transition-all duration-300"
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            {loading ? 'Preparando...' : mode === 'create' ? 'Iniciar Jornada' : 'Juntar-se'}
          </Button>

          <Button
            onClick={() => setMode('menu')}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft size={15} />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 4: Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Lobby.tsx
git commit -m "style: complete redesign of Lobby with dark theme and Phosphor icons"
```

---

## Task 11: WaitingRoom — Estilo Moderno

**Files:**
- Modify: `src/components/WaitingRoom.tsx`

- [ ] **Step 1: Atualizar imports**

Remover:
```tsx
import { Copy, Crown, Users } from "lucide-react";
```

Adicionar:
```tsx
import { Copy, Crown, Users, Play } from "@phosphor-icons/react";
```

- [ ] **Step 2: Reescrever o JSX do return**

```tsx
return (
  <div
    className="min-h-screen flex items-center justify-center p-4"
    style={{ background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)' }}
  >
    <Card className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
      <div className="space-y-6">
        {/* Código da Sala */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gradient-gold mb-1">Sala de Espera</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Compartilhe o código com seus amigos
          </p>

          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
            <div className="flex-1 p-4 bg-accent/10 rounded-xl border border-accent/30">
              <p className="text-3xl font-bold text-accent tracking-widest">{roomCode}</p>
            </div>
            <Button
              onClick={copyRoomCode}
              size="icon"
              className="h-14 w-14 bg-primary hover:bg-primary/90"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              <Copy size={20} />
            </Button>
          </div>
        </div>

        {/* Lista de jogadores */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-primary" />
            <h3 className="font-semibold text-base">Jogadores ({players.length}/8)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="p-3.5 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <PlayerPiece color={player.color} name={player.name} size={38} />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm">{player.name}</p>
                      {index === 0 && <Crown size={13} weight="fill" className="text-accent" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {index === 0 ? 'Anfitrião' : `Jogador ${index + 1}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de iniciar (só host) */}
        {isHost && (
          <Button
            onClick={startGame}
            disabled={players.length < 2}
            className="w-full bg-primary hover:bg-primary/90 text-base py-6 gap-2 transition-all duration-300"
            style={{ boxShadow: players.length >= 2 ? 'var(--shadow-glow)' : undefined }}
          >
            <Play size={18} weight="fill" />
            {players.length < 2 ? 'Aguardando jogadores...' : 'Iniciar jogo'}
          </Button>
        )}

        {!isHost && (
          <div className="text-center py-3">
            <p className="text-muted-foreground text-sm animate-pulse">
              Aguardando o anfitrião iniciar o jogo...
            </p>
          </div>
        )}
      </div>
    </Card>
  </div>
);
```

- [ ] **Step 3: Build final completo**

```bash
npm run build 2>&1 | grep -E "error|Error|built" | head -10
```

Expected: linha `✓ built in Xs` sem linhas de erro. `hsl(45 95% 52% / 0.4)` no CSS é equivalente ao token `--accent` com 40% de opacidade — mesmo valor que `border-accent/40` em Tailwind.

- [ ] **Step 4: Commit final**

```bash
git add src/components/WaitingRoom.tsx
git commit -m "style: modernize WaitingRoom with dark theme and Phosphor icons"
```

---

## Verificação Final

- [ ] `npm run build` passa sem erros TypeScript
- [ ] Todos os imports de `lucide-react` nos componentes do jogo foram removidos
- [ ] Nenhuma cor hardcoded marrom/parchment (`#5d4037`, `#f5e6d3`, `#deb887`, `#8b4513`) permanece nos componentes
- [ ] A lógica de jogo em `GameBoard.tsx` (rollDice, handleAnswer, movePlayer, nextPlayer, drawCard) está intacta
- [ ] `src/components/ui/` não foi modificado
