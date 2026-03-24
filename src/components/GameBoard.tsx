import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameCard } from "./GameCard";
import { BoardSquare } from "./BoardSquare";
import { PlayerPiece } from "./PlayerPiece";
import { Trophy, ArrowCounterClockwise, DiceFive, Crown } from "@phosphor-icons/react";
import { Player, BoardSquare as BoardSquareType } from "@/types/game";
import { themes } from "@/data/themes";
import { toast } from "sonner";
import { Dice } from "./Dice";

interface GameBoardProps {
  players: Array<{ name: string; avatar: string }>;
  onRestart: () => void;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

const TOTAL_SQUARES = 30;

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
    playerNames.map((player, i) => {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      return {
        name: player.name,
        position: 0,
        color: PLAYER_COLORS[i],
        difficultyLevel: 1,
        avatar: player.avatar,
        theme: randomTheme.id,
        correctAnswers: 0,
        cardRotation: 0, // Começa com pergunta
      };
    })
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
  const [usedQuestionIndices, setUsedQuestionIndices] = useState<Set<number>>(new Set());

  const rollDice = () => {
    setIsRollingDice(true);

    // Simulate dice rolling animation
    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;

      if (rolls >= 10) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRollingDice(false);

        // Esperar 2 segundos mostrando o resultado antes de puxar carta
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

    // Importa as perguntas e desafios do gameData
    import('@/data/gameData').then(({ questions, challenges }) => {
      let card;

      // Rotação: 0 = Pergunta, 1 = Desafio Bíblico, 2 = Desafio IASD
      if (rotation === 0) {
        // PERGUNTA
        // Mapeia todas as perguntas com seus índices originais
        const allQuestionsWithIndices = questions.map((q, index) => ({ ...q, originalIndex: index }));

        // Filtra por dificuldade
        const questionsForLevel = allQuestionsWithIndices.filter(
          q => q.difficulty === currentPlayerData.difficultyLevel
        );

        const availablePool = questionsForLevel.length > 0 ? questionsForLevel : allQuestionsWithIndices;

        // Filtra as que ainda não foram usadas
        let unusedQuestions = availablePool.filter(q => !usedQuestionIndices.has(q.originalIndex));

        // Se todas foram usadas, reseta o histórico para esse nível (ou geral se for fallback)
        if (unusedQuestions.length === 0) {
          // Precisamos remover do Set apenas os índices que pertencem ao pool atual
          // Para simplificar, se esgotou o nível, permitimos reusar as desse nível
          // Mas como o Set é global, vamos apenas ignorar o filtro de usados por uma vez
          // Ou melhor: limpar do Set os índices deste nível para recomeçar o ciclo
          const indicesToClear = new Set(availablePool.map(q => q.originalIndex));
          setUsedQuestionIndices(prev => {
            const newSet = new Set(prev);
            indicesToClear.forEach(idx => newSet.delete(idx));
            return newSet;
          });
          unusedQuestions = availablePool;
        }

        const randomQuestion = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];

        // Marca como usada
        setUsedQuestionIndices(prev => {
          const newSet = new Set(prev);
          newSet.add(randomQuestion.originalIndex);
          return newSet;
        });

        card = {
          type: 'question',
          question: randomQuestion.question,
          options: randomQuestion.options,
          correct: randomQuestion.correct
        };

        const levelNames = ['', 'Fácil', 'Médio', 'Difícil'];
        toast.info(`Pergunta - Nível: ${levelNames[currentPlayerData.difficultyLevel]}`);

      } else if (rotation === 1) {
        // DESAFIO BÍBLICO
        const biblicalChallenges = challenges.filter(challenge =>
          !challenge.toLowerCase().includes('iasd') &&
          !challenge.toLowerCase().includes('adventista') &&
          !challenge.toLowerCase().includes('ellen') &&
          !challenge.toLowerCase().includes('white') &&
          !challenge.toLowerCase().includes('pioneiros') &&
          !challenge.toLowerCase().includes('conferência')
        );

        const randomChallenge = biblicalChallenges[Math.floor(Math.random() * biblicalChallenges.length)];
        card = {
          type: 'challenge',
          text: randomChallenge
        };

        toast.info(`Desafio Bíblico`);

      } else {
        // DESAFIO IASD
        const iasdChallenges = challenges.filter(challenge =>
          challenge.toLowerCase().includes('iasd') ||
          challenge.toLowerCase().includes('adventista') ||
          challenge.toLowerCase().includes('ellen') ||
          challenge.toLowerCase().includes('white') ||
          challenge.toLowerCase().includes('pioneiros') ||
          challenge.toLowerCase().includes('dízimo') ||
          challenge.toLowerCase().includes('sábado') ||
          challenge.toLowerCase().includes('santuário') ||
          challenge.toLowerCase().includes('conferência') ||
          challenge.toLowerCase().includes('reforma de saúde') ||
          challenge.toLowerCase().includes('segunda vinda') ||
          challenge.toLowerCase().includes('estado dos mortos')
        );

        const randomChallenge = iasdChallenges[Math.floor(Math.random() * iasdChallenges.length)];
        card = {
          type: 'challenge',
          text: randomChallenge
        };

        toast.info(`Desafio IASD`);
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
    if (currentCard.type === "question" && answerIndex === currentCard.correct) {
      toast.success(`Resposta correta! Avance ${diceValue} casas`, {
        style: {
          background: '#10b981',
          color: 'white',
          border: '2px solid #059669',
        },
      });
      movePlayer(currentPlayer, diceValue!);

      // Sistema de progressão de nível baseado em acertos
      setPlayers(prev => {
        const newPlayers = [...prev];
        const player = newPlayers[currentPlayer];

        // Incrementa contador de acertos
        player.correctAnswers = (player.correctAnswers || 0) + 1;

        // Verifica se deve subir de nível
        // 2 acertos para subir qualquer nível
        const requiredAnswers = 2;

        if (player.correctAnswers >= requiredAnswers && player.difficultyLevel < 3) {
          player.difficultyLevel += 1;
          player.correctAnswers = 0; // Reseta contador
          const levelNames = ['', 'Fácil', 'Médio', 'Difícil'];
          // Delay de 1500ms para não sobrepor com o toast de resposta correta
          setTimeout(() => {
            toast.info(`Nível aumentado para ${levelNames[player.difficultyLevel]}!`, {
              style: {
                background: 'hsl(30 100% 50%)',
                color: 'white',
                border: '2px solid hsl(30 100% 40%)',
              },
            });
          }, 1500);
        }

        return newPlayers;
      });
    } else {
      toast.error(`Resposta errada! Você fica parado`, {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '2px solid #dc2626',
        },
      });
    }
    nextPlayer();
  };

  const handleChallengeComplete = (completed: boolean) => {
    if (completed) {
      toast.success(`Prenda completada! Avance ${diceValue} casas`, {
        style: {
          background: '#10b981',
          color: 'white',
          border: '2px solid #059669',
        },
      });
      movePlayer(currentPlayer, diceValue!);
    } else {
      toast.error(`Prenda não completada! Você fica parado`, {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '2px solid #dc2626',
        },
      });
    }
    nextPlayer();
  };


  const nextPlayer = () => {
    // Incrementa a rotação de cards do jogador atual
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = newPlayers[currentPlayer];
      // Rotação: 0 -> 1 -> 2 -> 0 (Pergunta -> Desafio Bíblico -> Desafio IASD -> Pergunta)
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

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, hsl(270 30% 12%) 0%, hsl(270 20% 8%) 100%)' }}>
      <div className="max-w-7xl mx-auto w-full">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Board */}
          <div className="lg:col-span-2">
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
              <div className="absolute top-3 left-3 text-accent/60 text-2xl pointer-events-none select-none leading-none">✦</div>
              <div className="absolute top-3 right-3 text-accent/60 text-2xl pointer-events-none select-none leading-none">✦</div>
              <div className="absolute bottom-3 left-3 text-accent/60 text-2xl pointer-events-none select-none leading-none">✦</div>
              <div className="absolute bottom-3 right-3 text-accent/60 text-2xl pointer-events-none select-none leading-none">✦</div>

              {/* Versículo */}
              <p className="text-[10px] italic text-accent/60 text-center mb-3 tracking-wide relative z-10">
                "Lâmpada para os meus pés é tua palavra" — Salmos 119:105
              </p>

              {/* Ornamento superior */}
              <div className="flex items-center gap-2 mb-3 px-8 relative z-10">
                <div className="flex-1 border-t border-accent/15" />
                <span className="text-accent/30 text-xs">◆</span>
                <div className="flex-1 border-t border-accent/15" />
              </div>

              {/* Caminho do Jogo - Layout Serpentine */}
              <div className="relative z-10">
                {/* Linha 1: 0-5 (esquerda para direita) */}
                <div className="flex gap-2 mb-12">
                  {board.slice(0, 6).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
                      {i < 5 && (
                        <div className="absolute top-1/2 -right-4 w-6 h-1 z-0"
                          style={{ transform: 'translateY(-50%)', borderTop: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      {i === 5 && (
                        <div className="absolute -bottom-14 left-1/2 w-1 h-16 z-0"
                          style={{ transform: 'translateX(-50%)', borderLeft: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={28}
                              animate={animatingPlayer === players.indexOf(player)}
                              avatar={player.avatar}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 2: 6-11 (direita para esquerda) */}
                <div className="flex flex-row-reverse gap-2 mb-12">
                  {board.slice(6, 12).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
                      {i < 5 && (
                        <div className="absolute top-1/2 -left-4 w-6 h-1 z-0"
                          style={{ transform: 'translateY(-50%)', borderTop: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      {i === 5 && (
                        <div className="absolute -bottom-14 left-1/2 w-1 h-16 z-0"
                          style={{ transform: 'translateX(-50%)', borderLeft: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={28}
                              animate={animatingPlayer === players.indexOf(player)}
                              avatar={player.avatar}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 3: 12-17 (esquerda para direita) */}
                <div className="flex gap-2 mb-12">
                  {board.slice(12, 18).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
                      {i < 5 && (
                        <div className="absolute top-1/2 -right-4 w-6 h-1 z-0"
                          style={{ transform: 'translateY(-50%)', borderTop: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      {i === 5 && (
                        <div className="absolute -bottom-14 left-1/2 w-1 h-16 z-0"
                          style={{ transform: 'translateX(-50%)', borderLeft: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={28}
                              animate={animatingPlayer === players.indexOf(player)}
                              avatar={player.avatar}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 4: 18-23 (direita para esquerda) */}
                <div className="flex flex-row-reverse gap-2 mb-12">
                  {board.slice(18, 24).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
                      {i < 5 && (
                        <div className="absolute top-1/2 -left-4 w-6 h-1 z-0"
                          style={{ transform: 'translateY(-50%)', borderTop: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      {i === 5 && (
                        <div className="absolute -bottom-14 left-1/2 w-1 h-16 z-0"
                          style={{ transform: 'translateX(-50%)', borderLeft: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={28}
                              animate={animatingPlayer === players.indexOf(player)}
                              avatar={player.avatar}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 5: 24-30 (esquerda para direita) */}
                <div className="flex gap-2 mb-4">
                  {board.slice(24, 31).map((square, i) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
                      {i < 6 && (
                        <div className="absolute top-1/2 -right-4 w-6 h-1 z-0"
                          style={{ transform: 'translateY(-50%)', borderTop: '2px dashed hsl(45 95% 52% / 0.4)', background: 'none' }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                          {getPlayersAtPosition(square.id).map((player, idx) => (
                            <PlayerPiece
                              key={idx}
                              color={player.color}
                              name={player.name}
                              size={28}
                              animate={animatingPlayer === players.indexOf(player)}
                              avatar={player.avatar}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ornamento inferior */}
              <div className="flex items-center gap-2 mt-3 px-8 relative z-10">
                <div className="flex-1 border-t border-accent/15" />
                <span className="text-accent/30 text-xs">◆</span>
                <div className="flex-1 border-t border-accent/15" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Players */}
            <Card className="p-4 bg-card border border-border/50" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Jogadores</h3>
              <div className="space-y-2">
                {players.map((player, index) => (
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
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent/60 rounded-full transition-all duration-500"
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
            <Card className="p-4 bg-card border border-border/50" style={{ boxShadow: 'var(--shadow-card)' }}>
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
                    style={{ boxShadow: isRollingDice ? undefined : 'var(--shadow-glow)' }}
                  >
                    <DiceFive size={20} />
                    {isRollingDice ? 'Rolando dado...' : diceValue && !showCard ? 'Aguarde...' : 'Jogar dado'}
                  </Button>
                </div>
              ) : winner ? (
                <div className="text-center py-6">
                  <Trophy size={64} weight="fill" className="text-accent mx-auto mb-3 animate-bounce" />
                  <h2 className="text-2xl font-bold text-accent mb-1">Parabéns!</h2>
                  <p className="text-muted-foreground">{winner.name} venceu a jornada!</p>
                </div>
              ) : (
                showCard && currentCard && (
                  <GameCard
                    card={currentCard}
                    onAnswer={handleAnswer}
                    onChallengeComplete={handleChallengeComplete}
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
