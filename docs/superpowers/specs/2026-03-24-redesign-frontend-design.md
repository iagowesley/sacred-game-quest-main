# Design Spec: Redesign Frontend — A Jornada

**Data:** 2026-03-24
**Projeto:** sacred-game-quest-main
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Supabase

---

## Objetivo

Modernizar completamente o frontend do jogo de tabuleiro cristão "A Jornada", mantendo toda a lógica de jogo intacta. As mudanças são exclusivamente visuais:

1. Paleta moderna **roxo real + dourado**
2. Fonte **Inter** (Google Fonts)
3. Ícones **Phosphor Icons** (`@phosphor-icons/react`) no peso **Regular**, substituindo lucide-react e emojis
4. Tabuleiro visualmente mais realista (3D, ornamentos bíblicos, decorações nas bordas)
5. Tela de entrada impactante com fundo imersivo

---

## Dependências a instalar

**Este passo deve ser executado ANTES de qualquer modificação nos componentes:**

```bash
npm install @phosphor-icons/react
```

A fonte Inter será importada via `@import` no `index.css` do Google Fonts.

> `lucide-react` permanece no `package.json` pois é dependência do shadcn/ui internamente, mas **nenhum componente do jogo** deve importá-la diretamente após o redesign.

### Sintaxe de uso dos ícones Phosphor

```tsx
import { WifiHigh, UsersThree, Trophy } from '@phosphor-icons/react';

// Peso Regular (padrão — não precisa especificar weight)
<WifiHigh size={24} />
<UsersThree size={24} />
```

O peso padrão do Phosphor já é Regular, portanto não é necessário passar `weight="regular"` explicitamente.

---

## Seção 1 — Tokens de Design (`src/index.css`)

### Fonte

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

### Importante: substituição total do tema

**Substituir TODOS os valores de `:root` no `index.css`.** O tema atual é claro (parchment/marrom) e será completamente trocado pelo tema escuro roxo+dourado abaixo. Não há modo claro — o jogo usa apenas este tema escuro. O bloco `.dark` existente pode ser removido ou mantido igual ao `:root`.

### Paleta de Cores (HSL)

| Token | Valor HSL | Descrição |
|---|---|---|
| `--background` | `270 20% 8%` | Quase preto com toque roxo |
| `--foreground` | `45 30% 92%` | Off-white quente |
| `--card` | `270 18% 13%` | Roxo escuro para cards |
| `--card-foreground` | `45 30% 92%` | Texto sobre card |
| `--primary` | `270 60% 55%` | Roxo real vibrante |
| `--primary-foreground` | `45 30% 95%` | Texto sobre primário |
| `--accent` | `45 95% 52%` | Dourado vivo |
| `--accent-foreground` | `270 20% 8%` | Texto sobre dourado |
| `--muted` | `270 15% 20%` | Fundo muted |
| `--muted-foreground` | `270 10% 60%` | Texto muted |
| `--border` | `270 20% 25%` | Bordas sutis |
| `--input` | `270 18% 16%` | Fundo de inputs |
| `--ring` | `270 60% 55%` | Foco/ring |
| `--destructive` | `0 65% 48%` | Vermelho |
| `--board-square` | `270 25% 18%` | Casa normal |
| `--board-bonus` | `45 90% 48%` | Casa bônus (dourada) |
| `--board-forward` | `145 55% 38%` | Casa avançar (esmeralda) |
| `--board-back` | `0 65% 48%` | Casa recuar (vermelho) |

### Sombras

- `--shadow-card`: multicamada sutil (existente, mantida)
- `--shadow-glow`: glow roxo — `0 0 20px hsl(270 60% 55% / 0.5)`
- `--shadow-gold`: glow dourado — `0 0 15px hsl(45 95% 52% / 0.6)`
- `--shadow-piece`: drop-shadow profundo para os peões (existente, mantida)

---

## Seção 2 — Telas de Entrada

### Menu Principal (`src/pages/Index.tsx` — modo `'menu'`)

- **Fundo:** `min-h-screen` com gradiente radial `radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)` + partículas CSS (pseudo-elementos com `box-shadow` espalhados simulando estrelas)
- **Logo:** `<img src="/cross.svg">` com `w-28 h-28`, `filter drop-shadow` dourado e glow animado sutil
- **Título:** "A Jornada" em `text-5xl font-bold` com gradiente de texto roxo→dourado via `bg-clip-text`
- **Subtítulo:** *"Uma aventura bíblica"* em itálico, `text-muted-foreground`
- **Botões (parte inferior):**
  - "Jogar Online": Phosphor `WifiHigh` (substitui lucide `Wifi`) + texto, background roxo primário, hover com borda dourada
  - "Jogar Local": Phosphor `UsersThree` (substitui lucide `WifiOff` — ícone mudado intencionalmente para representar jogadores locais) + texto, variante outline com borda roxa

### Lobby (`src/components/Lobby.tsx`)

**Redesign completo** — remover todas as cores hardcoded existentes (`#f5e6d3`, `#5d4037`, `#deb887`, etc.) e aplicar o novo tema escuro.

- Mesmo fundo gradiente escuro do menu
- Card central com `bg-card border border-accent/30 rounded-2xl p-8`, cantoneiras douradas com `<div>` absolutos nos 4 cantos: `absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent`
- Título com Phosphor `BookOpen` decorativo no header
- Inputs: `bg-input border border-border focus:border-accent text-foreground placeholder:text-muted-foreground`
- Botão principal: `bg-primary text-primary-foreground hover:bg-primary/90`; botão voltar: `variant="ghost" text-muted-foreground`
- Modo 'menu' do Lobby: dois botões grandes — "Criar Sala" (Phosphor `Plus`) e "Entrar em Sala" (Phosphor `SignIn`)

### PlayerSetup (`src/components/PlayerSetup.tsx`)

- Card central com mesmo estilo (borda roxa, fundo card escuro)
- Header: logo da Bíblia + título "A Jornada"
- Avatar selecionado: `ring-2 ring-accent shadow-[var(--shadow-gold)]`
- Botão "Adicionar jogador": Phosphor `UserPlus`
- Botão "Iniciar jogo": Phosphor `Play`, background roxo primário

### WaitingRoom (`src/components/WaitingRoom.tsx`)

- Card central, mesma identidade visual
- Código da sala: fundo `bg-accent/10 border-accent/30`, texto `text-4xl font-bold tracking-widest text-accent`
- Botão copiar: Phosphor `Copy`
- Host badge: Phosphor `Crown` em dourado
- Botão iniciar: Phosphor `Play`

---

## Seção 3 — Tabuleiro

### Moldura (`GameBoard.tsx` — container do tabuleiro)

- **Borda externa:** `border-[20px]` com cor `#1a0d2e` (roxo quase preto)
- **Borda interna dourada:** `ring-4 ring-accent/40` com `box-shadow: inset 0 0 30px hsl(45 95% 52% / 0.15)`
- **Cantoneiras decorativas:** 4 `<div>` absolutos nos cantos com ornamento em `text-accent text-2xl` usando o caractere `✦` (U+2726), posicionados com `absolute top-2 left-2`, `top-2 right-2`, `bottom-2 left-2`, `bottom-2 right-2`
- **Fundo do tabuleiro:** `bg-[hsl(270_25%_12%)]` (feltro roxo escuro) com textura noise SVG sutil via inline style:
  ```
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")"
  ```
- **Versículo bíblico (hardcoded):** no topo do tabuleiro, dentro da moldura, em `text-xs italic text-accent/70 text-center mb-3`: `"Lâmpada para os meus pés é tua palavra — Salmos 119:105"`
- **Ornamentos laterais:** linha simples `border-t border-accent/20` com um `◆` (`&#9670;`) centralizado em `text-accent/40 text-xs`

### Casas (`BoardSquare.tsx`)

- Tamanho: alterar o valor default do parâmetro `size` de `60` para `76` em `BoardSquare.tsx`
- **Efeito 3D multicamada via `style={{ boxShadow: '...' }}` (inline style, não Tailwind):**
  ```
  boxShadow: `
    inset 0 2px 4px rgba(255,255,255,0.15),
    inset 0 -2px 4px rgba(0,0,0,0.4),
    0 4px 0 rgba(0,0,0,0.5),
    0 6px 12px rgba(0,0,0,0.4)
  `
  ```
- **Normal:** background `hsl(var(--board-square))` — roxo escuro elevado
- **Bônus:** background dourado, Phosphor `Star` (Regular), glow `--shadow-gold`
- **Avançar:** background esmeralda, Phosphor `ArrowUp`
- **Recuar:** background vermelho, Phosphor `ArrowDown`
- **Início (id=0):** background dourado especial, Phosphor `FlagBanner`, label "Início"
- **Fim (id=30):** background dourado brilhante, Phosphor `Trophy`, label "Fim"
- **Número da casa:** badge `bg-black/30 text-white/70 text-[9px]` canto superior esquerdo
- **Conectores:** linha `border-dashed border-accent/40` entre casas

### Peões (`PlayerPiece.tsx`)

- Mantém a estrutura de cone+esfera
- `filter: drop-shadow(0px 6px 4px rgba(0,0,0,0.7))` — sombra mais profunda
- Reflexo na cabeça: `radial-gradient(circle at 25% 25%, white 0%, transparent 50%)` com opacidade maior

---

## Seção 4 — Cards, Dado e Sidebar

### GameCard — Pergunta (`src/components/GameCard.tsx`)

- Dialog com `backdrop-blur-md bg-black/40`
- **Header:** gradiente `from-primary to-primary/70`, Phosphor `BookOpenText` (`w-10 h-10`) no canto direito com `text-white/30`, título "Pergunta Bíblica" em bold, subtítulo "Responda para avançar"
- **Corpo:** pergunta em caixa `bg-card border border-primary/30 rounded-xl p-6`
- **Opções:** botões com badge de letra (A/B/C/D) em `bg-primary text-primary-foreground rounded-full w-8 h-8`
  - Hover: `border-accent`
  - Correto: `border-green-500 bg-green-500/10` + Phosphor `CheckCircle`
  - Errado: `border-red-500 bg-red-500/10` + Phosphor `XCircle`
- **Footer:** faixa `h-3 bg-primary rounded-b`

### GameCard — Desafio/Prenda

- **Header:** gradiente `from-accent to-accent/70` (dourado), Phosphor `Lightning` grande
- Título "Prenda!" + "Complete o desafio"
- **Corpo:** texto do desafio em destaque
- **Botões:** "Não completou" (Phosphor `X`) outline vermelho | "Completou!" (Phosphor `CheckFat`) background dourado

### Dado (`Dice.tsx`)

- Fundo: `bg-gradient-to-br from-slate-100 to-slate-200`
- Pontos: `bg-primary` (roxo) ao invés de default
- Borda: `border-2 border-primary/20`
- Sombra: `0 10px 30px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)`

### Sidebar (`GameBoard.tsx` — coluna direita)

- Card jogadores: player ativo com `border-2 border-accent shadow-[var(--shadow-gold)]`
- Phosphor `Crown` dourado na frente do nome do jogador ativo
- Barra de progresso: `<div>` com width `(position/30)*100%` background `bg-accent/60 rounded-full h-1`
- Botão "Jogar dado": Phosphor `Dice5`, `text-lg py-6`
- Botão "Novo jogo": Phosphor `ArrowCounterClockwise`
- Tela de vitória: Phosphor `Trophy` `w-16 h-16 text-accent animate-bounce`, nome em `text-2xl font-bold text-accent`

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `src/index.css` | Tokens de cor, Inter font, animações existentes mantidas |
| `src/pages/Index.tsx` | Menu com fundo imersivo, Phosphor icons |
| `src/components/PlayerSetup.tsx` | Estilo moderno, Phosphor icons |
| `src/components/Lobby.tsx` | Estilo moderno, cantoneiras, Phosphor icons |
| `src/components/WaitingRoom.tsx` | Estilo moderno, Phosphor icons |
| `src/components/GameBoard.tsx` | Moldura ornamentada, versículo, Phosphor icons, sidebar atualizada |
| `src/components/BoardSquare.tsx` | Casas 3D, Phosphor icons |
| `src/components/PlayerPiece.tsx` | Sombra aprimorada |
| `src/components/Dice.tsx` | Pontos roxos |
| `src/components/GameCard.tsx` | Cards modernos, glassmorphism, Phosphor icons |

## Arquivos a NÃO modificar

- Toda lógica de jogo em `GameBoard.tsx` (rollDice, handleAnswer, movePlayer, etc.)
- `src/hooks/useGameRoom.ts`
- `src/data/gameData.ts`
- `src/data/themes.ts`
- `src/integrations/supabase/`
- `src/types/game.ts`
- Componentes `src/components/ui/`

---

## Restrições

- Manter compatibilidade com React 18 + Tailwind 3
- `@phosphor-icons/react` deve ser instalado via npm antes da implementação
- Não remover `lucide-react` do `package.json` (usado por shadcn/ui)
- Toda lógica de estado e Supabase permanece inalterada
