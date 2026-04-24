import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameCard } from "./GameCard";
import { BoardSquare } from "./BoardSquare";
import { PlayerPiece } from "./PlayerPiece";
import { Trophy, ArrowCounterClockwise, DiceFive, Crown } from "@phosphor-icons/react";
import { Player, BoardSquare as BoardSquareType } from "@/types/game";
import { toast } from "sonner";
import { Dice } from "./Dice";
import { getQuestionLevelName, normalizeQuestionDifficulty, selectQuestionForLevel } from "@/lib/questionSelection";

interface GameBoardProps {
  players: Array<{ name: string; emoji: string }>;
  onRestart: () => void;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

const TOTAL_SQUARES = 30;
const BOARD_SQUARE_SIZE = 92;
const BOARD_PIECE_SIZE = 38;
const SIDEBAR_PIECE_SIZE = 46;

const generateBoard = (): BoardSquareType[] => {
  const board: BoardSquareType[] = [];
  for (let i = 0; i <= TOTAL_SQUARES; i++) {
    if (i === 0) {
      board.push({ id: i, type: 'normal', label: 'Início' });
    } else if (i === TOTAL_SQUARES) {
      board.push({ id: i, type: 'normal', label: 'Fim' });
    } else {
      board.push({ id: i, type: 'normal', label: '' });
    }
  }
  return board;
};

export const GameBoard = ({ players: playerNames, onRestart }: GameBoardProps) => {
  const [players, setPlayers] = useState<Player[]>(
    playerNames.map((player, i) => ({
      name: player.name,
      position: 0,
      color: PLAYER_COLORS[i],
      difficultyLevel: 2,
      emoji: player.emoji,
      correctAnswers: 0,
      cardRotation: 0,
    }))
  );
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);
  const [board] = useState<BoardSquareType[]>(generateBoard());
  const [winner, setWinner] = useState<Player | null>(null);
  const [animatingPlayer, setAnimatingPlayer] = useState<number | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [gamePhase, setGamePhase] = useState<'roll' | 'answer' | 'move'>('roll');
  const usedIndicesRef = useRef<Set<number>>(new Set());

  const rollDice = () => {
    setIsRollingDice(true);

    let rolls = 0;
    let lastValue = Math.floor(Math.random() * 6) + 1;
    const rollInterval = setInterval(() => {
      lastValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(lastValue);
      rolls++;

      if (rolls >= 10) {
        clearInterval(rollInterval);
        // Não gera novo número — usa o último valor do intervalo para não mudar
        setIsRollingDice(false);

        setTimeout(() => {
          setGamePhase('answer');
          drawCard();
        }, 2000);
      }
    }, 100);
  };

  const drawCard = () => {
    const currentPlayerData = players[currentPlayer];
    const rotation = currentPlayerData.cardRotation || 0;

    import('@/data/gameData').then(({ questions, challenges }) => {
      let card;

      if (rotation === 0) {
        const randomQuestion = selectQuestionForLevel(
          questions,
          currentPlayerData.difficultyLevel,
          usedIndicesRef.current,
        );

        card = {
          type: 'question',
          question: randomQuestion.question,
          options: randomQuestion.options,
          correct: randomQuestion.correct,
        };
        toast.info(`Pergunta — Nível: ${getQuestionLevelName(currentPlayerData.difficultyLevel)}`);

      } else if (rotation === 1) {
        const biblicalChallenges = challenges.filter(c =>
          !c.toLowerCase().includes('iasd') &&
          !c.toLowerCase().includes('adventista') &&
          !c.toLowerCase().includes('ellen') &&
          !c.toLowerCase().includes('white') &&
          !c.toLowerCase().includes('pioneiros') &&
          !c.toLowerCase().includes('conferência')
        );
        const randomChallenge = biblicalChallenges[Math.floor(Math.random() * biblicalChallenges.length)];
        card = { type: 'challenge', text: randomChallenge };
        toast.info('Desafio Bíblico');

      } else {
        const iasdChallenges = challenges.filter(c =>
          c.toLowerCase().includes('iasd') ||
          c.toLowerCase().includes('adventista') ||
          c.toLowerCase().includes('ellen') ||
          c.toLowerCase().includes('white') ||
          c.toLowerCase().includes('pioneiros') ||
          c.toLowerCase().includes('dízimo') ||
          c.toLowerCase().includes('sábado') ||
          c.toLowerCase().includes('santuário') ||
          c.toLowerCase().includes('conferência') ||
          c.toLowerCase().includes('reforma de saúde') ||
          c.toLowerCase().includes('segunda vinda') ||
          c.toLowerCase().includes('estado dos mortos')
        );
        const randomChallenge = iasdChallenges[Math.floor(Math.random() * iasdChallenges.length)];
        card = { type: 'challenge', text: randomChallenge };
        toast.info('Desafio IASD');
      }

      setCurrentCard(card);
      setShowCard(true);
    });
  };

  const movePlayer = (playerIndex: number, spaces: number) => {
    setAnimatingPlayer(playerIndex);
    setTimeout(() => {
      setPlayers(prev => {
        const newPlayers = [...prev];
        const newPosition = Math.max(0, Math.min(TOTAL_SQUARES, newPlayers[playerIndex].position + spaces));
        newPlayers[playerIndex].position = newPosition;
        if (newPosition === TOTAL_SQUARES) {
          setWinner(newPlayers[playerIndex]);
          toast.success(`${newPlayers[playerIndex].name} venceu o jogo!`);
        }
        return newPlayers;
      });
      setTimeout(() => setAnimatingPlayer(null), 500);
    }, 100);
  };

  const handleAnswer = (answerIndex: number) => {
    if (currentCard.type === "question") {
      const isCorrect = answerIndex === currentCard.correct;
      const player = players[currentPlayer];

      let newCorrectAnswers = player.correctAnswers || 0;
      let newDifficultyLevel = normalizeQuestionDifficulty(player.difficultyLevel);

      if (isCorrect) {
        newCorrectAnswers += 1;
        toast.success(`Resposta correta! Avance ${diceValue} casas`);
        movePlayer(currentPlayer, diceValue!);

        if (newCorrectAnswers >= 2 && newDifficultyLevel < 3) {
          newDifficultyLevel += 1;
          newCorrectAnswers = 0;
          setTimeout(() => {
            toast.info(`Nível aumentado para ${getQuestionLevelName(newDifficultyLevel)}!`);
          }, 1500);
        }
      } else {
        toast.error(`Resposta errada! Você fica parado`);
      }

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

  const handleChallengeComplete = (completed: boolean) => {
    if (completed) {
      toast.success(`Prenda completada! Avance ${diceValue} casas`);
      movePlayer(currentPlayer, diceValue!);
    } else {
      toast.error(`Prenda não completada! Você fica parado`);
    }
    nextPlayer();
  };

  const nextPlayer = () => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = newPlayers[currentPlayer];
      player.cardRotation = ((player.cardRotation || 0) + 1) % 3;
      return newPlayers;
    });

    setShowCard(false);
    setCurrentCard(null);
    setDiceValue(null);
    setGamePhase('roll');

    if (!winner) {
      setTimeout(() => {
        setCurrentPlayer((prev) => (prev + 1) % players.length);
      }, 1000);
    }
  };

  const getPlayersAtPosition = (position: number) => {
    return players.filter(p => p.position === position);
  };

  const connectorH = { borderTop: '2px dashed hsl(220 8% 38% / 0.5)', background: 'none' };
  const connectorV = { borderLeft: '2px dashed hsl(220 8% 38% / 0.5)', background: 'none' };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-[1500px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 bg-card px-5 py-3 rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Trophy size={20} weight="fill" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-wide">A jornada</h1>
              {!winner && (
                <p className="text-xs text-muted-foreground">
                  Vez de: <span className="font-semibold text-foreground">{players[currentPlayer].name}</span>
                </p>
              )}
              {winner && (
                <p className="text-sm font-bold text-primary animate-pulse">Vencedor: {winner.name}!</p>
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Board */}
          <div className="lg:col-span-2">
            <div
              className="relative overflow-hidden rounded-2xl p-8"
              style={{
                background: 'hsl(220 11% 12%)',
                border: '2px solid hsl(220 8% 24%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {/* Caminho do Jogo - Layout Serpentine */}
              <div className="relative z-10">
                {/* Linha 1: 0-5 (esquerda para direita) */}
                <div className="mb-16 flex gap-3">
                  {board.slice(0, 6).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={BOARD_SQUARE_SIZE} />
                      {i < 5 && (
                        <div className="absolute top-1/2 -right-5 z-0 h-1 w-8" style={{ transform: 'translateY(-50%)', ...connectorH }} />
                      )}
                      {i === 5 && (
                        <div className="absolute -bottom-[4.5rem] left-1/2 z-0 h-20 w-1" style={{ transform: 'translateX(-50%)', ...connectorV }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={BOARD_PIECE_SIZE}
                              animate={animatingPlayer === players.indexOf(player)}
                              emoji={player.emoji}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 2: 6-11 (direita para esquerda) */}
                <div className="mb-16 flex flex-row-reverse gap-3">
                  {board.slice(6, 12).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={BOARD_SQUARE_SIZE} />
                      {i < 5 && (
                        <div className="absolute top-1/2 -left-5 z-0 h-1 w-8" style={{ transform: 'translateY(-50%)', ...connectorH }} />
                      )}
                      {i === 5 && (
                        <div className="absolute -bottom-[4.5rem] left-1/2 z-0 h-20 w-1" style={{ transform: 'translateX(-50%)', ...connectorV }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={BOARD_PIECE_SIZE}
                              animate={animatingPlayer === players.indexOf(player)}
                              emoji={player.emoji}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 3: 12-17 (esquerda para direita) */}
                <div className="mb-16 flex gap-3">
                  {board.slice(12, 18).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={BOARD_SQUARE_SIZE} />
                      {i < 5 && (
                        <div className="absolute top-1/2 -right-5 z-0 h-1 w-8" style={{ transform: 'translateY(-50%)', ...connectorH }} />
                      )}
                      {i === 5 && (
                        <div className="absolute -bottom-[4.5rem] left-1/2 z-0 h-20 w-1" style={{ transform: 'translateX(-50%)', ...connectorV }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={BOARD_PIECE_SIZE}
                              animate={animatingPlayer === players.indexOf(player)}
                              emoji={player.emoji}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 4: 18-23 (direita para esquerda) */}
                <div className="mb-16 flex flex-row-reverse gap-3">
                  {board.slice(18, 24).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={BOARD_SQUARE_SIZE} />
                      {i < 5 && (
                        <div className="absolute top-1/2 -left-5 z-0 h-1 w-8" style={{ transform: 'translateY(-50%)', ...connectorH }} />
                      )}
                      {i === 5 && (
                        <div className="absolute -bottom-[4.5rem] left-1/2 z-0 h-20 w-1" style={{ transform: 'translateX(-50%)', ...connectorV }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={BOARD_PIECE_SIZE}
                              animate={animatingPlayer === players.indexOf(player)}
                              emoji={player.emoji}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 5: 24-30 (esquerda para direita) */}
                <div className="mb-4 flex gap-3">
                  {board.slice(24, 31).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={BOARD_SQUARE_SIZE} />
                      {i < 6 && (
                        <div className="absolute top-1/2 -right-5 z-0 h-1 w-8" style={{ transform: 'translateY(-50%)', ...connectorH }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={BOARD_PIECE_SIZE}
                              animate={animatingPlayer === players.indexOf(player)}
                              emoji={player.emoji}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Players */}
            <Card className="p-4 bg-card border border-border/50">
              <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Jogadores</h3>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg transition-all ${
                      index === currentPlayer && !winner
                        ? 'bg-primary/15 border-2 border-primary'
                        : 'bg-muted/30 border border-border/30'
                    }`}
                    style={index === currentPlayer && !winner ? { boxShadow: '0 0 12px hsl(101 98% 40% / 0.28)' } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <PlayerPiece color={player.color} name={player.name} size={SIDEBAR_PIECE_SIZE} emoji={player.emoji} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {index === currentPlayer && !winner && (
                            <Crown size={13} weight="fill" className="text-primary flex-shrink-0" />
                          )}
                          <div className="font-medium text-sm truncate">{player.name}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Casa {player.position}/{TOTAL_SQUARES} · Nível {getQuestionLevelName(player.difficultyLevel)}
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full transition-all duration-500"
                            style={{ width: `${(player.position / TOTAL_SQUARES) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Game Actions */}
            <Card className="p-4 bg-card border border-border/50">
              {!winner && gamePhase === 'roll' && !showCard ? (
                <div className="space-y-5">
                  {diceValue && (
                    <div className="flex flex-col items-center gap-3">
                      <Dice value={diceValue} isRolling={isRollingDice} />
                      <p className="text-sm text-muted-foreground font-medium">
                        {isRollingDice ? 'Rolando...' : `Você tirou ${diceValue}!`}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={rollDice}
                    disabled={isRollingDice || (diceValue !== null && !showCard)}
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 text-base py-6 gap-2"
                  >
                    <DiceFive size={20} />
                    {isRollingDice ? 'Rolando dado...' : diceValue && !showCard ? 'Aguarde...' : 'Jogar dado'}
                  </Button>
                </div>
              ) : winner ? (
                <div className="text-center py-6">
                  <Trophy size={64} weight="fill" className="text-primary mx-auto mb-3 animate-bounce" />
                  <h2 className="text-2xl font-bold text-foreground mb-1">Parabéns!</h2>
                  <p className="text-muted-foreground">{winner.name} venceu a jornada!</p>
                </div>
              ) : (
                showCard && currentCard && (
                  <GameCard
                    card={currentCard}
                    onAnswer={handleAnswer}
                    onChallengeComplete={handleChallengeComplete}
                    onClose={nextPlayer}
                  />
                )
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
