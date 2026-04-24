export type SquareType = 'normal' | 'bonus' | 'challenge' | 'forward' | 'back';

export interface BoardSquare {
  id: number;
  type: SquareType;
  label: string;
}

export interface Player {
  name: string;
  position: number;
  color: string;
  difficultyLevel: number; // 2 = médio, 3 = difícil
  emoji?: string;
  theme?: string; // tema sorteado para o jogador
  correctAnswers?: number; // contador de respostas corretas
  cardRotation?: number; // 0 = pergunta, 1 = desafio bíblico, 2 = desafio IASD
}

export interface Question {
  question: string;
  options: string[];
  correct: number;
  difficulty: number; // 2 = médio, 3 = difícil
}
