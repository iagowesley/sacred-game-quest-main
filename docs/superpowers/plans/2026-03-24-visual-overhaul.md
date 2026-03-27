# Visual Overhaul & Bug Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernizar completamente o visual do jogo removendo dourado, adicionando emojis iOS, dado CSS 3D real, X funcional no popup, mais perguntas, e corrigindo a lógica de dificuldade.

**Architecture:** Modificações em 7 arquivos existentes — sem novas dependências. O dado CSS 3D usa `transform-style: preserve-3d` puro. Os emojis são strings Unicode direto no JSX.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui (Dialog), Phosphor Icons

---

## File Map

| Arquivo | O que muda |
|---|---|
| `src/index.css` | Trocar `--accent` para branco-acinzentado, remover `.text-gradient-gold`, ajustar `--shadow-gold`, adicionar animação 3D do dado |
| `src/components/PlayerSetup.tsx` | Array de emojis iOS, remover `<img>`, remover gradiente de fundo, remover drop-shadow dourado |
| `src/components/PlayerPiece.tsx` | Receber `emoji` string em vez de `avatar` src; mostrar emoji sobre o peão |
| `src/components/GameBoard.tsx` | Remover ornamentos dourados, gradientes, `border 20px`, cantoneiras; corrigir lógica de dificuldade (único `setPlayers`); passar `emoji` ao PlayerPiece |
| `src/components/Dice.tsx` | Reescrever como cubo CSS 3D com 6 faces reais |
| `src/components/GameCard.tsx` | Adicionar `onClose` prop + botão X no header; remover gradientes |
| `src/data/gameData.ts` | Adicionar 90 perguntas novas (30 por nível) |

---

## Task 1: Sistema de Cores — Remover Dourado

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Trocar `--accent` de dourado para branco-acinzentado**

Abrir `src/index.css`. Localizar `:root` e `.dark`. Trocar:
```css
--accent: 45 95% 52%;
--accent-foreground: 270 20% 8%;
```
Por:
```css
--accent: 0 0% 88%;
--accent-foreground: 270 20% 8%;
```
Fazer em `:root` E em `.dark`.

- [ ] **Step 2: Trocar `--shadow-gold` para sombra neutra**

Localizar `--shadow-gold` e trocar por:
```css
--shadow-gold: 0 0 15px rgba(255,255,255,0.12);
```

- [ ] **Step 3: Remover `.text-gradient-gold` e substituir por texto simples**

Localizar e remover o bloco:
```css
.text-gradient-gold {
  background: linear-gradient(135deg, hsl(270 60% 70%) 0%, hsl(45 95% 60%) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 4: Adicionar animação do dado 3D**

Ao fim do bloco `@layer utilities`, adicionar:
```css
  @keyframes dice-roll-3d-real {
    0%   { transform: rotateX(0deg) rotateY(0deg); }
    20%  { transform: rotateX(180deg) rotateY(90deg) rotateZ(45deg); }
    40%  { transform: rotateX(360deg) rotateY(270deg) rotateZ(90deg); }
    60%  { transform: rotateX(540deg) rotateY(180deg) rotateZ(135deg); }
    80%  { transform: rotateX(720deg) rotateY(360deg) rotateZ(90deg); }
    100% { transform: rotateX(900deg) rotateY(450deg) rotateZ(180deg); }
  }

  .animate-dice-roll-3d-real {
    animation: dice-roll-3d-real 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
```

- [ ] **Step 5: Commit**
```bash
git add src/index.css
git commit -m "style: replace gold accent with white-gray, add 3D dice animation"
```

---

## Task 2: Dado CSS 3D Real

**Files:**
- Modify: `src/components/Dice.tsx`

- [ ] **Step 1: Reescrever Dice.tsx completamente**

Substituir todo o conteúdo de `src/components/Dice.tsx` por:

```tsx
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
              boxShadow: isActive ? "inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(255,255,255,0.2)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

export const Dice = ({ value, isRolling }: DiceProps) => {
  const [currentTransform, setCurrentTransform] = useState(FACE_ROTATIONS[1]);

  useEffect(() => {
    if (!isRolling && value) {
      // Após animação caótica, rotacionar para face correta
      const timer = setTimeout(() => {
        setCurrentTransform(FACE_ROTATIONS[value]);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isRolling, value]);

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
    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.15)",
  });

  return (
    <div style={{ perspective: "400px", width: "96px", height: "96px" }}>
      {/* Sombra projetada */}
      <div
        style={{
          position: "absolute",
          bottom: "-12px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70px",
          height: "10px",
          background: "rgba(0,0,0,0.35)",
          borderRadius: "50%",
          filter: "blur(4px)",
        }}
      />
      <div
        className={isRolling ? "animate-dice-roll-3d-real" : ""}
        style={{
          width: "96px",
          height: "96px",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: isRolling ? undefined : currentTransform,
          transition: isRolling ? "none" : "transform 0.5s ease-out",
        }}
      >
        {/* Front — 1 */}
        <div style={{ ...faceStyle("rotateY(0deg) translateZ(48px)") }}>
          <Face dots={DOT_POSITIONS[1]} />
        </div>
        {/* Back — 6 */}
        <div style={{ ...faceStyle("rotateY(180deg) translateZ(48px)") }}>
          <Face dots={DOT_POSITIONS[6]} />
        </div>
        {/* Right — 3 */}
        <div style={{ ...faceStyle("rotateY(90deg) translateZ(48px)") }}>
          <Face dots={DOT_POSITIONS[3]} />
        </div>
        {/* Left — 4 */}
        <div style={{ ...faceStyle("rotateY(-90deg) translateZ(48px)") }}>
          <Face dots={DOT_POSITIONS[4]} />
        </div>
        {/* Top — 2 */}
        <div style={{ ...faceStyle("rotateX(90deg) translateZ(48px)") }}>
          <Face dots={DOT_POSITIONS[2]} />
        </div>
        {/* Bottom — 5 */}
        <div style={{ ...faceStyle("rotateX(-90deg) translateZ(48px)") }}>
          <Face dots={DOT_POSITIONS[5]} />
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**
```bash
git add src/components/Dice.tsx
git commit -m "feat: replace 2D dice with true CSS 3D cube with 6 faces"
```

---

## Task 3: PlayerPiece — Emoji em vez de Imagem

**Files:**
- Modify: `src/components/PlayerPiece.tsx`

- [ ] **Step 1: Trocar prop `avatar` (src de imagem) por `emoji` (string)**

Substituir todo o conteúdo de `src/components/PlayerPiece.tsx` por:

```tsx
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
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)' }} />
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
```

- [ ] **Step 2: Commit**
```bash
git add src/components/PlayerPiece.tsx
git commit -m "feat: PlayerPiece uses emoji string instead of image src"
```

---

## Task 4: PlayerSetup — Emojis iOS e Layout Modernizado

**Files:**
- Modify: `src/components/PlayerSetup.tsx`

- [ ] **Step 1: Substituir AVATARS array (imagens) por emojis iOS**

Substituir o bloco `const AVATARS = [...]` por:
```tsx
const AVATARS = [
  { id: 'dog',   emoji: '🐶', name: 'Cachorro' },
  { id: 'cat',   emoji: '🐱', name: 'Gato'     },
  { id: 'fox',   emoji: '🦊', name: 'Raposa'   },
  { id: 'bear',  emoji: '🐻', name: 'Urso'     },
  { id: 'pig',   emoji: '🐷', name: 'Porco'    },
  { id: 'cow',   emoji: '🐮', name: 'Vaca'     },
  { id: 'lion',  emoji: '🦁', name: 'Leão'     },
  { id: 'koala', emoji: '🐨', name: 'Coala'    },
];
```

- [ ] **Step 2: Atualizar `PlayerData` interface**

Trocar:
```tsx
interface PlayerData {
  name: string;
  avatar: string;
}
```
Por:
```tsx
interface PlayerData {
  name: string;
  emoji: string;
}
```

- [ ] **Step 3: Atualizar estado e funções**

- `useState`: trocar `avatar: AVATARS[0].src` por `emoji: AVATARS[0].emoji`
- `addPlayer`: trocar `usedAvatars = players.map(p => p.avatar)` por `usedAvatars = players.map(p => p.emoji)` e `!usedAvatars.includes(a.src)` por `!usedAvatars.includes(a.emoji)`, e `?.src` por `?.emoji`
- `updatePlayerAvatar`: renomear para `updatePlayerEmoji`, trocar `avatar` por `emoji`
- `handleStartGame`: trocar `avatar: p.avatar` por `emoji: p.emoji`
- Interface `PlayerSetupProps`: trocar `avatar: string` por `emoji: string`

- [ ] **Step 4: Atualizar JSX do componente**

Trocar o fundo do container: remover `style={{ background: 'radial-gradient(...)' }}` → usar `className="min-h-screen flex items-center justify-center p-4 bg-background"`

Trocar header:
- Remover `style={{ filter: 'drop-shadow(...)' }}` da imagem
- Trocar `<h1 className="text-3xl font-bold text-gradient-gold ...">` por `<h1 className="text-3xl font-bold text-foreground ...">`

Trocar seleção de avatar — substituir o bloco `AVATARS.map(avatar => <button>...<img>...)` por:
```tsx
{AVATARS.map((avatar) => (
  <button
    key={avatar.id}
    type="button"
    onClick={() => updatePlayerEmoji(index, avatar.emoji)}
    className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110 border-2 ${
      player.emoji === avatar.emoji
        ? 'border-primary bg-primary/15'
        : 'border-border/40 hover:border-primary/50 bg-muted/30'
    }`}
    title={avatar.name}
  >
    {avatar.emoji}
  </button>
))}
```

Trocar botão iniciar — remover `style={{ boxShadow: 'var(--shadow-glow)' }}`

- [ ] **Step 5: Commit**
```bash
git add src/components/PlayerSetup.tsx
git commit -m "feat: replace animal images with iOS emoji avatars in PlayerSetup"
```

---

## Task 5: GameBoard — Remover Dourado, Gradientes e Corrigir Dificuldade

**Files:**
- Modify: `src/components/GameBoard.tsx`

- [ ] **Step 1: Atualizar inicialização dos jogadores (usar `emoji`)**

Na inicialização de `useState<Player[]>`, trocar:
```tsx
avatar: player.avatar,
```
Por:
```tsx
emoji: player.emoji,
```

(A interface `PlayerSetupProps` e o tipo `Player` precisam aceitar `emoji`. Verificar `src/types/game.ts` e adicionar `emoji?: string` ao tipo `Player` se necessário.)

- [ ] **Step 2: Verificar/atualizar `src/types/game.ts`**

Abrir `src/types/game.ts`. Localizar a interface `Player`. Se tiver `avatar?: string`, trocar por `emoji?: string`. Se não tiver nem um nem outro, adicionar `emoji?: string`.

- [ ] **Step 3: Atualizar `GameBoardProps`**

No topo de `GameBoard.tsx`, trocar:
```tsx
players: Array<{ name: string; avatar: string }>;
```
Por:
```tsx
players: Array<{ name: string; emoji: string }>;
```

- [ ] **Step 4: Remover fundo com gradiente**

Trocar:
```tsx
<div className="min-h-screen p-4 flex flex-col items-center justify-center"
  style={{ background: 'radial-gradient(ellipse at 60% 40%, hsl(270 30% 12%) 0%, hsl(270 20% 8%) 100%)' }}>
```
Por:
```tsx
<div className="min-h-screen p-4 flex flex-col items-center justify-center bg-background">
```

- [ ] **Step 5: Remover gradiente do header e dourado**

No header, trocar `text-gradient-gold` por `text-foreground font-bold`. Remover `style={{ boxShadow: 'var(--shadow-glow)' }}` do ícone de troféu.

- [ ] **Step 6: Modernizar container do tabuleiro**

Localizar o `div` do tabuleiro com `border: '20px solid #1a0d2e'` e substituir todo o bloco `style={{...}}` por:
```tsx
style={{
  background: 'hsl(270 20% 11%)',
  border: '2px solid hsl(270 20% 20%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
}}
```

Remover os 4 `div` de cantoneiras com ✦:
```tsx
<div className="absolute top-3 left-3 text-accent/60 ...">✦</div>
// etc
```

Remover os 2 blocos de ornamento (separadores com ◆):
```tsx
<div className="flex items-center gap-2 mb-3 px-8 relative z-10">
  <div className="flex-1 border-t border-accent/15" />
  <span className="text-accent/30 text-xs">◆</span>
  <div className="flex-1 border-t border-accent/15" />
</div>
```
(Há um no topo e um embaixo do tabuleiro — remover ambos.)

Remover o versículo decorativo:
```tsx
<p className="text-[10px] italic text-accent/60 text-center mb-3 ...">
  "Lâmpada para os meus pés é tua palavra" — Salmos 119:105
</p>
```

Remover `border-2 border-accent/20 rounded-lg` da borda interna.

- [ ] **Step 7: Trocar linhas conectoras douradas por roxo suave**

Em todas as linhas conectoras `borderTop: '2px dashed hsl(45 95% 52% / 0.4)'` e `borderLeft: '2px dashed hsl(45 95% 52% / 0.4)'`, trocar pela cor:
```
borderTop: '2px dashed hsl(270 40% 35% / 0.5)'
borderLeft: '2px dashed hsl(270 40% 35% / 0.5)'
```

- [ ] **Step 8: Atualizar sidebar — remover dourado**

No card dos jogadores, o jogador ativo tem `border-2 border-accent` e `var(--shadow-gold)`. Trocar por `border-2 border-primary` e remover o `style` de shadow ou trocar por `boxShadow: '0 0 12px hsl(270 60% 55% / 0.3)'`.

Remover `style={{ boxShadow: 'var(--shadow-gold)' }}` do botão de jogar dado.

- [ ] **Step 9: Passar `emoji` para `PlayerPiece`**

Em todos os usos de `<PlayerPiece>` dentro de `GameBoard.tsx`, trocar `avatar={player.avatar}` por `emoji={player.emoji}`.

- [ ] **Step 10: Corrigir lógica de dificuldade — único `setPlayers`**

Localizar a função `handleAnswer` e substituir completamente por:

```tsx
const handleAnswer = (answerIndex: number) => {
  if (currentCard.type === "question") {
    const isCorrect = answerIndex === currentCard.correct;
    const player = players[currentPlayer];

    // Calcular próximo estado do jogador antes de qualquer setState
    let newCorrectAnswers = player.correctAnswers || 0;
    let newDifficultyLevel = player.difficultyLevel;

    if (isCorrect) {
      newCorrectAnswers += 1;
      toast.success(`Resposta correta! Avance ${diceValue} casas`);
      movePlayer(currentPlayer, diceValue!);

      if (newCorrectAnswers >= 2 && newDifficultyLevel < 3) {
        newDifficultyLevel += 1;
        newCorrectAnswers = 0;
        const levelNames = ['', 'Fácil', 'Médio', 'Difícil'];
        setTimeout(() => {
          toast.info(`Nível aumentado para ${levelNames[newDifficultyLevel]}!`);
        }, 1500);
      }
    } else {
      toast.error(`Resposta errada! Você fica parado`);
    }

    // Único setPlayers para evitar race condition
    setPlayers(prev => {
      const updated = [...prev];
      updated[currentPlayer] = {
        ...updated[currentPlayer],
        correctAnswers: newCorrectAnswers,
        difficultyLevel: newDifficultyLevel,
      };
      return updated;
    });
  }
  nextPlayer();
};
```

- [ ] **Step 11: Commit**
```bash
git add src/components/GameBoard.tsx src/types/game.ts
git commit -m "fix: remove gold elements, gradients, fix difficulty progression race condition"
```

---

## Task 6: GameCard — Botão X Funcional

**Files:**
- Modify: `src/components/GameCard.tsx`

- [ ] **Step 1: Adicionar prop `onClose` à interface**

Trocar:
```tsx
interface GameCardProps {
  card: any;
  onAnswer: (index: number) => void;
  onChallengeComplete: (completed: boolean) => void;
}
```
Por:
```tsx
interface GameCardProps {
  card: any;
  onAnswer: (index: number) => void;
  onChallengeComplete: (completed: boolean) => void;
  onClose: () => void;
}
```

E no destructuring:
```tsx
export const GameCard = ({ card, onAnswer, onChallengeComplete, onClose }: GameCardProps) => {
```

- [ ] **Step 2: Adicionar `onOpenChange` ao Dialog de pergunta**

Trocar `<Dialog open={true}>` (no card de pergunta) por:
```tsx
<Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
```

- [ ] **Step 3: Remover gradiente do header do card de pergunta**

Trocar:
```tsx
<div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex items-end p-5">
```
Por:
```tsx
<div className="relative h-24 overflow-hidden bg-primary flex items-end p-5">
```

Remover o ícone `BookOpenText` (o path SVG do Google que o usuário mencionou):
```tsx
<BookOpenText size={80} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/15" />
```
→ Deletar essa linha.

- [ ] **Step 4: Adicionar botão X visível no header do card de pergunta**

Dentro do `div` do header do card de pergunta, após o `<div className="relative z-10">`, adicionar:
```tsx
<button
  onClick={onClose}
  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
  aria-label="Fechar"
>
  <X size={16} className="text-white" />
</button>
```

- [ ] **Step 5: Atualizar Dialog e header do card de desafio**

Para o card de desafio (`card.type !== "question"`):

Trocar `<Dialog open={true}>` por:
```tsx
<Dialog open={true} onOpenChange={(open) => { if (!open) onChallengeComplete(false); }}>
```

Trocar:
```tsx
<div className="relative h-28 overflow-hidden bg-gradient-to-br from-accent to-accent/70 flex items-end p-5">
```
Por:
```tsx
<div className="relative h-24 overflow-hidden bg-muted flex items-end p-5">
```

Remover o ícone `Lightning`:
```tsx
<Lightning size={80} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/10" weight="fill" />
```
→ Deletar essa linha.

Adicionar botão X no header do desafio (mesmo padrão do step 4, mas chama `onChallengeComplete(false)` em vez de `onClose`):
```tsx
<button
  onClick={() => onChallengeComplete(false)}
  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
  aria-label="Fechar"
>
  <X size={16} className="text-foreground/70" />
</button>
```

- [ ] **Step 6: Remover imports não utilizados**

Após remover `BookOpenText` e `Lightning`, remover do import `@phosphor-icons/react`:
```tsx
import { BookOpenText, Lightning, ... } from "@phosphor-icons/react";
```
Deixar apenas: `CheckCircle, XCircle, CheckFat, X`.

- [ ] **Step 7: Atualizar o uso de `GameCard` em `GameBoard.tsx`**

Em `GameBoard.tsx`, localizar `<GameCard ... />` e adicionar a prop `onClose`:
```tsx
<GameCard
  card={currentCard}
  onAnswer={handleAnswer}
  onChallengeComplete={handleChallengeComplete}
  onClose={nextPlayer}
/>
```

- [ ] **Step 8: Commit**
```bash
git add src/components/GameCard.tsx src/components/GameBoard.tsx
git commit -m "feat: add functional X close button to question/challenge popup"
```

---

## Task 7: Mais Perguntas (90 novas)

**Files:**
- Modify: `src/data/gameData.ts`

- [ ] **Step 1: Adicionar 30 perguntas nível 1 (Fácil)**

Ao final do bloco de perguntas de difficulty 1, antes das perguntas de difficulty 2, inserir:

```ts
  // NÍVEL 1 — FÁCIL (novas)
  { question: "Qual é o livro mais longo da Bíblia?", options: ["Gênesis", "Isaías", "Salmos", "Jeremias"], correct: 2, difficulty: 1 },
  { question: "Quem foi engolido por um grande peixe por fugir de Deus?", options: ["Jonas", "Elias", "Jeremias", "Ezequiel"], correct: 0, difficulty: 1 },
  { question: "Qual era a profissão de Jesus antes do ministério?", options: ["Pescador", "Agricultor", "Carpinteiro", "Escriba"], correct: 2, difficulty: 1 },
  { question: "Onde Moisés recebeu os Dez Mandamentos?", options: ["Monte Sinai", "Monte Carmelo", "Monte das Oliveiras", "Monte Nebo"], correct: 0, difficulty: 1 },
  { question: "Qual personagem bíblico viveu mais de 900 anos?", options: ["Noé", "Adão", "Matusalém", "Enoque"], correct: 2, difficulty: 1 },
  { question: "Quem foi lançado na fornalha ardente por não adorar a estátua de ouro?", options: ["Daniel", "Sadraque, Mesaque e Abede-Nego", "José", "Ezequiel"], correct: 1, difficulty: 1 },
  { question: "Qual era o nome do jardim onde Jesus orou antes de ser preso?", options: ["Éden", "Getsêmani", "Betânia", "Siloé"], correct: 1, difficulty: 1 },
  { question: "Quem escreveu a maior parte dos Salmos?", options: ["Salomão", "Moisés", "Davi", "Asafe"], correct: 2, difficulty: 1 },
  { question: "Qual é o menor livro do Novo Testamento?", options: ["Filemon", "Tito", "3 João", "2 João"], correct: 2, difficulty: 1 },
  { question: "Quem foi o primeiro diácono mártir da igreja cristã?", options: ["Pedro", "Paulo", "Estêvão", "Barnabé"], correct: 2, difficulty: 1 },
  { question: "Em qual cidade Paulo nasceu?", options: ["Jerusalém", "Roma", "Tarso", "Antioquia"], correct: 2, difficulty: 1 },
  { question: "Qual profeta disse 'Eis o Cordeiro de Deus'?", options: ["Isaías", "João Batista", "Elias", "Amós"], correct: 1, difficulty: 1 },
  { question: "Quantos anos Noé tinha quando o dilúvio começou?", options: ["500", "600", "700", "800"], correct: 1, difficulty: 1 },
  { question: "Quem traiu Jesus com um beijo?", options: ["Pedro", "Tomé", "Judas Iscariotes", "Simão"], correct: 2, difficulty: 1 },
  { question: "Qual era o nome da mãe de Moisés?", options: ["Miriam", "Joquebede", "Séfora", "Rebeca"], correct: 1, difficulty: 1 },
  { question: "Quantos anos Jesus tinha quando foi apresentado no templo aos 12 anos?", options: ["10", "11", "12", "13"], correct: 2, difficulty: 1 },
  { question: "Quem era cego e foi curado por Jesus perto de Jericó?", options: ["Lázaro", "Bartimeu", "Zaqueu", "Nicodemos"], correct: 1, difficulty: 1 },
  { question: "Qual é o versículo mais curto da Bíblia?", options: ["João 3:16", "João 11:35", "Salmos 23:1", "Gênesis 1:1"], correct: 1, difficulty: 1 },
  { question: "Quem foi o pai de Abraão?", options: ["Noé", "Tera", "Naor", "Sem"], correct: 1, difficulty: 1 },
  { question: "Em que idioma foi escrito principalmente o Novo Testamento?", options: ["Hebraico", "Latim", "Grego", "Aramaico"], correct: 2, difficulty: 1 },
  { question: "Qual discípulo era cobrador de impostos antes de seguir Jesus?", options: ["Pedro", "Mateus", "André", "Filipe"], correct: 1, difficulty: 1 },
  { question: "Quem foi o pai de João Batista?", options: ["José", "Zacarias", "Eliseu", "Simão"], correct: 1, difficulty: 1 },
  { question: "Quantas pessoas entraram na arca de Noé?", options: ["6", "7", "8", "10"], correct: 2, difficulty: 1 },
  { question: "Qual é o primeiro mandamento dos Dez Mandamentos?", options: ["Não matar", "Não ter outros deuses", "Guardar o sábado", "Não roubar"], correct: 1, difficulty: 1 },
  { question: "Quem foi o primeiro homem a ser assassinado conforme a Bíblia?", options: ["Abel", "Adão", "Enoque", "Lamé"], correct: 0, difficulty: 1 },
  { question: "Qual anjo anunciou o nascimento de Jesus a Maria?", options: ["Miguel", "Rafael", "Gabriel", "Uriel"], correct: 2, difficulty: 1 },
  { question: "Quanto tempo Jesus ficou no túmulo?", options: ["1 dia", "2 dias", "3 dias", "7 dias"], correct: 2, difficulty: 1 },
  { question: "Qual é o nome do monte onde Elias desafiou os profetas de Baal?", options: ["Monte Sinai", "Monte Carmelo", "Monte Horeb", "Monte Sião"], correct: 1, difficulty: 1 },
  { question: "Quem era a rainha que visitou Salomão para testar sua sabedoria?", options: ["Rainha de Sabá", "Rainha Ester", "Rainha Jezabel", "Rainha Michal"], correct: 0, difficulty: 1 },
  { question: "Qual livro bíblico conta a história de Rute?", options: ["Juízes", "1 Samuel", "Rute", "Números"], correct: 2, difficulty: 1 },
```

- [ ] **Step 2: Adicionar 30 perguntas nível 2 (Médio)**

Ao final do bloco de perguntas de difficulty 2, inserir:

```ts
  // NÍVEL 2 — MÉDIO (novas)
  { question: "Quantos livros compõem o Antigo Testamento?", options: ["27", "36", "39", "46"], correct: 2, difficulty: 2 },
  { question: "Qual profeta teve uma visão do vale dos ossos secos?", options: ["Isaías", "Jeremias", "Ezequiel", "Daniel"], correct: 2, difficulty: 2 },
  { question: "Quem escreveu o livro de Apocalipse?", options: ["Pedro", "Paulo", "João", "Tiago"], correct: 2, difficulty: 2 },
  { question: "Quantos anos Israel esteve no cativeiro babilônico?", options: ["40", "50", "70", "100"], correct: 2, difficulty: 2 },
  { question: "Qual rei construiu o primeiro templo de Jerusalém?", options: ["Davi", "Salomão", "Ezequias", "Josias"], correct: 1, difficulty: 2 },
  { question: "Quem foi o sogro de Jacó?", options: ["Isaque", "Labão", "Betuel", "Abraão"], correct: 1, difficulty: 2 },
  { question: "Quantos livros Paulo escreveu no Novo Testamento?", options: ["11", "12", "13", "14"], correct: 2, difficulty: 2 },
  { question: "Qual é a tribo de Israel a que Paulo pertencia?", options: ["Judá", "Levi", "Benjamim", "Efraim"], correct: 2, difficulty: 2 },
  { question: "Em qual capítulo de João se encontra o relato da ressurreição de Lázaro?", options: ["João 9", "João 10", "João 11", "João 12"], correct: 2, difficulty: 2 },
  { question: "Quantos filhos Noé tinha?", options: ["2", "3", "4", "5"], correct: 1, difficulty: 2 },
  { question: "Quem foi o primeiro juiz de Israel mencionado no livro de Juízes?", options: ["Gideão", "Sansão", "Otniel", "Débora"], correct: 2, difficulty: 2 },
  { question: "Qual apóstolo era irmão de Pedro?", options: ["João", "André", "Tiago", "Filipe"], correct: 1, difficulty: 2 },
  { question: "Quanto tempo Elias ficou escondido às margens do rio Querite?", options: ["3 meses", "6 meses", "1 ano", "Até a chuva voltar"], correct: 3, difficulty: 2 },
  { question: "Quem escreveu os livros de Crônicas?", options: ["Esdras", "Neemias", "Ezequiel", "Tradição atribui a Esdras"], correct: 3, difficulty: 2 },
  { question: "Qual cidade foi destruída por Josué após o povo marchar ao redor dela por 7 dias?", options: ["Ai", "Hazor", "Jericó", "Gibeão"], correct: 2, difficulty: 2 },
  { question: "Quem foi o pai de Salomão?", options: ["Saul", "Davi", "Absalão", "Mefibosete"], correct: 1, difficulty: 2 },
  { question: "Qual é o nome da esposa de Ló que se tornou estátua de sal?", options: ["A Bíblia não dá nome a ela", "Edite", "Milca", "Agar"], correct: 0, difficulty: 2 },
  { question: "Quantas vezes Naamã mergulhou no Jordão para ser curado da lepra?", options: ["3", "5", "7", "10"], correct: 2, difficulty: 2 },
  { question: "Qual é o nome do monte onde Moisés morreu?", options: ["Monte Sinai", "Monte Carmelo", "Monte Nebo", "Monte Sião"], correct: 2, difficulty: 2 },
  { question: "Quem era o sumo sacerdote quando Jesus foi preso?", options: ["Anás", "Caifás", "Ananias", "Gamaliel"], correct: 1, difficulty: 2 },
  { question: "Em qual livro bíblico está o Sermão da Montanha completo?", options: ["Marcos", "Lucas", "Mateus", "João"], correct: 2, difficulty: 2 },
  { question: "Quantas igrejas são mencionadas em Apocalipse 2-3?", options: ["5", "6", "7", "10"], correct: 2, difficulty: 2 },
  { question: "Qual profeta foi chamado por Deus quando ainda era criança, no templo?", options: ["Jeremias", "Samuel", "Isaías", "Daniel"], correct: 1, difficulty: 2 },
  { question: "Quem era o governador romano durante o julgamento de Jesus?", options: ["Herodes", "Pilatos", "Félix", "Festo"], correct: 1, difficulty: 2 },
  { question: "Qual é o significado do nome 'Emanuel'?", options: ["Filho de Deus", "Deus conosco", "Senhor salva", "Paz de Deus"], correct: 1, difficulty: 2 },
  { question: "Quantos salmos existem no livro de Salmos?", options: ["100", "120", "150", "180"], correct: 2, difficulty: 2 },
  { question: "Qual rio cruzou milagrosamente o povo de Israel ao entrar em Canaã?", options: ["Nilo", "Eufrates", "Jordão", "Querite"], correct: 2, difficulty: 2 },
  { question: "Quem foi o rei que mandou matar os bebês de Belém após o nascimento de Jesus?", options: ["Herodes Antipas", "Herodes o Grande", "Arquelau", "Filipe"], correct: 1, difficulty: 2 },
  { question: "Quantas vezes por dia Daniel orava?", options: ["1", "2", "3", "5"], correct: 2, difficulty: 2 },
  { question: "Qual discípulo pediu que Jesus mostrasse o Pai durante a última ceia?", options: ["Tomé", "Filipe", "Natanael", "André"], correct: 1, difficulty: 2 },
```

- [ ] **Step 3: Adicionar 30 perguntas nível 3 (Difícil)**

Ao final do bloco de perguntas de difficulty 3, inserir:

```ts
  // NÍVEL 3 — DIFÍCIL (novas)
  { question: "Qual é o nome hebraico do livro de Números?", options: ["Shemot", "Vayikra", "Bamidbar", "Devarim"], correct: 2, difficulty: 3 },
  { question: "Qual profeta anunciou que o Messias nasceria em Belém?", options: ["Isaías", "Zacarias", "Miqueias", "Malachias"], correct: 2, difficulty: 3 },
  { question: "Em Apocalipse, qual é o número do capítulo que menciona os 144.000?", options: ["Ap 7", "Ap 12", "Ap 14", "Ap 7 e 14"], correct: 3, difficulty: 3 },
  { question: "Qual é a referência bíblica dos Dez Mandamentos além de Êxodo 20?", options: ["Levítico 19", "Números 15", "Deuteronômio 5", "Josué 1"], correct: 2, difficulty: 3 },
  { question: "Qual epístola de Paulo aborda mais extensamente a ressurreição dos mortos?", options: ["Romanos", "1 Coríntios", "Gálatas", "Filipenses"], correct: 1, difficulty: 3 },
  { question: "Quantas semanas proféticas de Daniel 9 totalizam os 490 anos?", options: ["60", "62", "70", "80"], correct: 2, difficulty: 3 },
  { question: "O santuário celestial é descrito principalmente em qual livro do Novo Testamento?", options: ["Romanos", "Gálatas", "Hebreus", "Apocalipse"], correct: 2, difficulty: 3 },
  { question: "Qual é o nome da porta do templo onde Pedro e João curaram o coxo?", options: ["Porta do Sol", "Porta Formosa", "Porta de Nican", "Porta Oriental"], correct: 1, difficulty: 3 },
  { question: "Em qual capítulo de Isaías está a profecia do 'Servo Sofredor' mais detalhada?", options: ["Is 40", "Is 49", "Is 53", "Is 61"], correct: 2, difficulty: 3 },
  { question: "Quantos anos durou o reinado de Salomão sobre Israel?", options: ["20", "30", "40", "50"], correct: 2, difficulty: 3 },
  { question: "Qual é o nome do anjo que lutou com Jacó?", options: ["A Bíblia não nomeia; tradição diz Miguel", "Gabriel", "Uriel", "Rafael"], correct: 0, difficulty: 3 },
  { question: "Em qual versículo Paulo apresenta os 'frutos do Espírito'?", options: ["Romanos 8:1", "Gálatas 5:22", "Efésios 5:9", "Colossenses 3:12"], correct: 1, difficulty: 3 },
  { question: "Qual é o nome do sacerdote que Davi consultou ao fugir de Saul em Nobe?", options: ["Eli", "Aimelek", "Abiatar", "Zadoque"], correct: 1, difficulty: 3 },
  { question: "Quantos anos após o decreto de Artaxerxes (457 a.C.) terminam as 70 semanas proféticas?", options: ["27 d.C.", "31 d.C.", "34 d.C.", "44 d.C."], correct: 2, difficulty: 3 },
  { question: "Qual é a referência da 'estrela da manhã' aplicada a Cristo em Apocalipse?", options: ["Ap 2:17", "Ap 2:28", "Ap 22:16", "Ap 5:5"], correct: 2, difficulty: 3 },
  { question: "Em qual capítulo de Ezequiel está a visão das quatro criaturas viventes?", options: ["Ez 1", "Ez 10", "Ez 28", "Ez 37"], correct: 0, difficulty: 3 },
  { question: "Qual rei adventista (pré-cristão) é citado em Isaías pelo nome antes de seu nascimento?", options: ["Nabucodonosor", "Ciro", "Dario", "Artaxerxes"], correct: 1, difficulty: 3 },
  { question: "Qual é o tema central da epístola aos Hebreus?", options: ["A lei e a graça", "O sacerdócio de Cristo no santuário celestial", "A segunda vinda", "A ressurreição"], correct: 1, difficulty: 3 },
  { question: "Quantos dias proféticos (anos literais) representam as 2.300 tardes e manhãs de Daniel 8?", options: ["1.260", "1.844", "2.300", "1.290"], correct: 2, difficulty: 3 },
  { question: "Qual apóstolo escreveu a carta aos Hebreus segundo a tradição adventista?", options: ["Paulo", "Barnabé", "Lucas", "Apolos"], correct: 0, difficulty: 3 },
  { question: "Qual é o nome do primeiro livro dos profetas menores no Antigo Testamento?", options: ["Amós", "Oseias", "Joel", "Abdias"], correct: 1, difficulty: 3 },
  { question: "Em qual profecia Daniel viu uma estátua com cabeça de ouro, peito de prata e pés de ferro misturado com barro?", options: ["Daniel 2", "Daniel 7", "Daniel 8", "Daniel 9"], correct: 0, difficulty: 3 },
  { question: "Qual é a referência do 'estado dos mortos' mais clara no Antigo Testamento?", options: ["Salmo 6:5", "Eclesiastes 9:5", "Jó 14:10-12", "Todas as anteriores"], correct: 3, difficulty: 3 },
  { question: "Em qual livro bíblico está a instrução sobre o dízimo do décimo?", options: ["Levítico", "Números", "Deuteronômio", "Malaquias"], correct: 2, difficulty: 3 },
  { question: "Quantas visões proféticas principais Daniel recebeu?", options: ["2", "3", "4", "5"], correct: 2, difficulty: 3 },
  { question: "Qual é o nome da cidade onde Paulo foi apedrejado e deixado por morto?", options: ["Listra", "Derbe", "Icônio", "Antioquia"], correct: 0, difficulty: 3 },
  { question: "Qual é o texto de ouro adventista sobre o sábado no Novo Testamento?", options: ["Mateus 12:8", "Lucas 4:16", "Marcos 2:27-28", "Hebreus 4:9"], correct: 2, difficulty: 3 },
  { question: "Quantas das sete igrejas de Apocalipse recebem apenas elogios sem repreensão?", options: ["0", "1", "2", "3"], correct: 2, difficulty: 3 },
  { question: "Qual capítulo de Romanos apresenta a doutrina da justificação pela fé mais detalhadamente?", options: ["Romanos 1", "Romanos 3-4", "Romanos 6", "Romanos 8"], correct: 1, difficulty: 3 },
  { question: "Em qual versículo Paulo diz 'a paga do pecado é a morte'?", options: ["Romanos 3:23", "Romanos 6:23", "Romanos 8:1", "Gálatas 3:13"], correct: 1, difficulty: 3 },
```

- [ ] **Step 4: Commit**
```bash
git add src/data/gameData.ts
git commit -m "feat: add 90 new questions across all difficulty levels to prevent repetition"
```

---

## Verificação Final

- [ ] Rodar o projeto: `npm run dev`
- [ ] Testar: abrir PlayerSetup → ver emojis iOS nos botões de avatar
- [ ] Testar: iniciar jogo → tabuleiro sem dourado, sem gradiente, sem ornamentos ✦ ◆
- [ ] Testar: clicar "Jogar dado" → dado 3D gira e para na face correta
- [ ] Testar: popup de pergunta → clicar X → popup fecha, turno passa
- [ ] Testar: acertar 2 perguntas → toast de "Nível aumentado" aparece uma vez
- [ ] Testar: acertar mais 2 → nível vai para 3 (Difícil)
- [ ] Commit final se tudo ok:
```bash
git add -A
git commit -m "chore: final cleanup after visual overhaul"
```
