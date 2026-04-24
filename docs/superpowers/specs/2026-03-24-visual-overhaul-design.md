# Design Spec — Modernização Visual e Correções do Jogo

**Data:** 2026-03-24
**Status:** Aprovado

---

## Resumo

Modernização completa do visual do jogo bíblico "A jornada": remoção do dourado, emojis iOS como avatares, dado CSS 3D real, popup de pergunta com X funcional, mais perguntas, e correção do sistema de dificuldade progressiva.

---

## 1. Sistema de Cores

**Problema:** A cor de destaque `--accent: 45 95% 52%` (dourado/âmbar) é usada em toda a UI, dando aspecto antigo.

**Solução:**
- `--accent` → `0 0% 88%` (branco-acinzentado claro)
- `--accent-foreground` → mantém fundo escuro
- Remover classe `.text-gradient-gold` → substituir usos por `font-bold text-foreground` ou `text-white`
- Remover `--shadow-gold` → substituir por sombra neutra `0 0 15px rgba(255,255,255,0.15)`
- Remover todos os fundos com `radial-gradient` → usar `bg-background` flat
- Tabuleiro: remover `backgroundImage` de ruído SVG

---

## 2. Ornamentos Dourados — Remoção

**Arquivos afetados:** `GameBoard.tsx`, `PlayerSetup.tsx`

- Remover cantoneiras ✦ do tabuleiro
- Remover separadores ◆ (ornamentos superior e inferior do tabuleiro)
- Remover `border-accent/20` interna do tabuleiro
- Remover `border: '20px solid #1a0d2e'` pesado do container do tabuleiro
- Remover `drop-shadow` dourado do logo em PlayerSetup
- Remover o versículo decorativo do tabuleiro (ou manter discreto em cinza)
- Linhas conectoras entre casas → `border-primary/30` (roxo suave) em vez de dourado

---

## 3. PlayerSetup — Avatares iOS Emoji

**Problema:** Usa imagens PNG de `/avatars/*.png` que podem não existir; visual antigo.

**Solução:**
- Substituir array `AVATARS` com `src` por array com `emoji` string:
  ```
  🐶 🐱 🦊 🐻 🐷 🐮 🦁 🐨
  ```
- Botão de seleção: exibe emoji em `text-3xl` dentro de `div` estilizada
- Remover `<img>` → renderizar `<span>` com emoji
- Layout do card de jogador: manter estrutura atual, apenas trocar imagens por emojis
- `PlayerPiece.tsx`: adaptar para renderizar emoji em vez de `<img>`

---

## 4. Dado CSS 3D Real

**Problema:** Dado atual é uma face 2D com bolinhas e animação CSS que simula rotação, não é um cubo real.

**Solução — Abordagem A (CSS 3D com 6 faces reais):**

Estrutura:
```html
<div class="dice-scene">        <!-- perspective: 200px -->
  <div class="dice-cube">       <!-- transform-style: preserve-3d, transition -->
    <div class="face face-front">  <!-- 1 -->
    <div class="face face-back">   <!-- 6 -->
    <div class="face face-right">  <!-- 3 -->
    <div class="face face-left">   <!-- 4 -->
    <div class="face face-top">    <!-- 2 -->
    <div class="face face-bottom"> <!-- 5 -->
  </div>
</div>
```

Posicionamento das faces via `translateZ(40px)` e rotações. Ao rolar:
1. Animação caótica de rotação múltiplos de 360° + rotações extras
2. Para na rotação exata que coloca a face correta voltada para frente

Mapeamento face → rotação do cubo:
- 1 (frente): `rotateX(0deg) rotateY(0deg)`
- 2 (topo): `rotateX(-90deg) rotateY(0deg)`
- 3 (direita): `rotateX(0deg) rotateY(-90deg)`
- 4 (esquerda): `rotateX(0deg) rotateY(90deg)`
- 5 (baixo): `rotateX(90deg) rotateY(0deg)`
- 6 (traseira): `rotateX(0deg) rotateY(180deg)`

Cubo branco (`#f1f5f9`), pontos roxos (`hsl(270 60% 55%)`), sombra projetada embaixo.

---

## 5. GameCard — Botão X Funcional

**Problema:** O Dialog do popup de pergunta não tem X funcional. Fechar o Dialog nativo do shadcn chama `onOpenChange` mas não passa o turno.

**Solução:**
- Adicionar `onOpenChange` ao `<Dialog>`: quando `open` vai para `false`, chamar `nextPlayer()` (turno passa, jogador fica na posição — equivale a não responder)
- Adicionar um `DialogClose` visível no canto superior direito do header tanto no card de pergunta quanto no de desafio
- O X no card de desafio deve chamar `onChallengeComplete(false)` (não completou)

---

## 6. Mais Perguntas

**Problema:** Poucas perguntas causam repetição, especialmente no nível 3.

**Solução:** Adicionar ~90 novas perguntas ao `gameData.ts`:
- 30 nível 1 (Fácil) — personagens e histórias básicas
- 30 nível 2 (Médio) — números, locais, datas bíblicas
- 30 nível 3 (Difícil) — profecia, epístolas, teologia adventista

Total: de ~150 para ~240 perguntas.

---

## 7. Correção da Lógica de Dificuldade

**Problema atual:**
```ts
// handleAnswer chama nextPlayer() e DEPOIS setPlayers() para nível
// Isso cria race condition: dois setPlayers() separados
nextPlayer(); // ← reseta showCard, currentCard, passa turno
setPlayers(prev => { /* tenta atualizar nível */ }); // ← pode usar estado stale
```

**Solução:**
Consolidar toda a lógica de atualização do jogador em **um único `setPlayers`** antes de chamar `nextPlayer()`:

```ts
const handleAnswer = (answerIndex: number) => {
  const isCorrect = answerIndex === currentCard.correct;

  let newDifficultyLevel = players[currentPlayer].difficultyLevel;
  let newCorrectAnswers = players[currentPlayer].correctAnswers;

  if (isCorrect) {
    newCorrectAnswers += 1;
    if (newCorrectAnswers >= 2 && newDifficultyLevel < 3) {
      newDifficultyLevel += 1;
      newCorrectAnswers = 0;
    }
    movePlayer(currentPlayer, diceValue!);
    // toast correto
  } else {
    // toast errado
  }

  // Uma única atualização de estado
  setPlayers(prev => {
    const updated = [...prev];
    updated[currentPlayer] = {
      ...updated[currentPlayer],
      correctAnswers: newCorrectAnswers,
      difficultyLevel: newDifficultyLevel,
    };
    return updated;
  });

  nextPlayer();
};
```

Isso garante que o nível seja atualizado atomicamente antes de passar o turno.

---

## 8. Layout do Jogo — Sem Gradientes

**Arquivos afetados:** `GameBoard.tsx`, `PlayerSetup.tsx`, `index.css`

- `GameBoard.tsx`: remover `style={{ background: 'radial-gradient(...)' }}` → usar `className="bg-background"`
- `PlayerSetup.tsx`: idem
- `GameCard.tsx`: headers com `bg-gradient-to-br` → substituir por `bg-primary` (pergunta) e `bg-muted` (desafio)
- Sidebar players card: manter flat, sem shadows douradas
- Tabuleiro container: borda mais fina e sutil

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---|---|
| `src/index.css` | Trocar `--accent`, remover `--shadow-gold`, remover `.text-gradient-gold` |
| `src/components/PlayerSetup.tsx` | Emojis iOS, remover imagens, remover gradiente |
| `src/components/GameBoard.tsx` | Remover dourado, ornamentos, gradientes |
| `src/components/Dice.tsx` | Reescrever como cubo CSS 3D real |
| `src/components/GameCard.tsx` | Adicionar X funcional, remover gradientes header |
| `src/components/PlayerPiece.tsx` | Adaptar para emoji em vez de img |
| `src/data/gameData.ts` | Adicionar ~90 perguntas |
