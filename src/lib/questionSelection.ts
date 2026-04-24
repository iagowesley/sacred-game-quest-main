import { Question } from "@/types/game";

export const MIN_QUESTION_DIFFICULTY = 2;
export const MAX_QUESTION_DIFFICULTY = 3;

const QUESTION_HISTORY_KEY = "a-jornada-question-history-v2";

type QuestionWithIndex = Question & { originalIndex: number };
type QuestionHistory = Record<string, number[]>;

const readHistory = (): QuestionHistory => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(QUESTION_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as QuestionHistory) : {};
  } catch {
    return {};
  }
};

const writeHistory = (history: QuestionHistory) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // If storage is unavailable, the in-memory round history still prevents immediate repeats.
  }
};

const randomIndex = (max: number) => {
  if (max <= 1) return 0;

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
};

export const normalizeQuestionDifficulty = (difficulty: number | null | undefined) => {
  if (!difficulty || difficulty < MIN_QUESTION_DIFFICULTY) return MIN_QUESTION_DIFFICULTY;
  if (difficulty > MAX_QUESTION_DIFFICULTY) return MAX_QUESTION_DIFFICULTY;
  return difficulty;
};

export const getQuestionLevelName = (difficulty: number | null | undefined) =>
  normalizeQuestionDifficulty(difficulty) === MAX_QUESTION_DIFFICULTY ? "Difícil" : "Médio";

export const selectQuestionForLevel = (
  questions: Question[],
  requestedDifficulty: number,
  usedThisGame: Set<number>,
): QuestionWithIndex => {
  const difficulty = normalizeQuestionDifficulty(requestedDifficulty);
  const allPlayable = questions
    .map((question, originalIndex) => ({ ...question, originalIndex }))
    .filter((question) => question.difficulty >= MIN_QUESTION_DIFFICULTY);

  const levelPool = allPlayable.filter((question) => question.difficulty === difficulty);
  const pool = levelPool.length > 0 ? levelPool : allPlayable;

  let available = pool.filter((question) => !usedThisGame.has(question.originalIndex));
  if (available.length === 0) {
    pool.forEach((question) => usedThisGame.delete(question.originalIndex));
    available = pool;
  }

  const history = readHistory();
  const levelKey = String(difficulty);
  const persistedUsed = new Set(history[levelKey] ?? []);
  const unseenAfterRestart = available.filter((question) => !persistedUsed.has(question.originalIndex));
  const candidates = unseenAfterRestart.length > 0 ? unseenAfterRestart : available;
  const picked = candidates[randomIndex(candidates.length)];

  usedThisGame.add(picked.originalIndex);

  history[levelKey] =
    unseenAfterRestart.length > 0
      ? Array.from(new Set([...(history[levelKey] ?? []), picked.originalIndex]))
      : [picked.originalIndex];
  writeHistory(history);

  return picked;
};
