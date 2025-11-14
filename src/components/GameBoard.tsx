import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameCard } from "./GameCard";
import { BoardSquare } from "./BoardSquare";
import { PlayerPiece } from "./PlayerPiece";
import { Trophy, RotateCcw, Dices } from "lucide-react";
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
        const questionsForLevel = questions.filter(
          q => q.difficulty === currentPlayerData.difficultyLevel
        );
        const availableQuestions = questionsForLevel.length > 0 ? questionsForLevel : questions;
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        
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
    <div className="min-h-screen p-4 bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Jogo bíblico - tabuleiro
              </h1>
              {!winner && (
                <p className="text-sm text-muted-foreground">
                  Vez de: <span className="font-semibold text-foreground">{players[currentPlayer].name}</span>
                </p>
              )}
              {winner && (
                <p className="text-lg font-bold text-success">
                  🎉 Vencedor: {winner.name}!
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onRestart}
            className="border-primary/30 hover:bg-primary/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Novo jogo
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Board */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card shadow-[var(--shadow-card)] relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 w-32 h-32 bg-primary blur-3xl"></div>
                <div className="absolute bottom-4 right-4 w-32 h-32 bg-accent blur-3xl"></div>
              </div>
              
              {/* Caminho do Jogo - Layout Serpentine */}
              <div className="relative">
                {/* Linha 1: 0-5 (esquerda para direita) */}
                <div className="flex gap-2 mb-12">
                  {board.slice(0, 6).map((square) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
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
                  {board.slice(6, 12).map((square) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
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
                  {board.slice(12, 18).map((square) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
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
                  {board.slice(18, 24).map((square) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
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
                <div className="flex gap-2 mb-10">
                  {board.slice(24, 31).map((square) => (
                    <div key={square.id} className="relative flex-1">
                      <BoardSquare square={square} size={70} />
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

            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Players */}
            <Card className="p-4 bg-card shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-5 flex items-center gap-2">
                Jogadores
              </h3>
              <div className="space-y-3">
                {players.map((player, index) => {
                  return (
                    <div
                      key={index}
                      className={`p-3 transition-all ${
                        index === currentPlayer && !winner
                          ? 'bg-primary/10 border-2 border-primary shadow-sm'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PlayerPiece color={player.color} name={player.name} size={36} avatar={player.avatar} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{player.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Casa {player.position}/{TOTAL_SQUARES}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Game Actions */}
            <Card className="p-4 bg-card shadow-[var(--shadow-card)]">
              {!winner && gamePhase === 'roll' && !showCard ? (
                <div className="space-y-6">
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
                    className="w-full bg-primary hover:bg-primary/90 hover:shadow-[var(--shadow-glow)] transition-all duration-300 text-lg py-6"
                  >
                    <Dices className="w-5 h-5 mr-2" />
                    {isRollingDice ? 'Rolando dado...' : diceValue && !showCard ? 'Aguarde...' : 'Jogar dado'}
                  </Button>
                </div>
              ) : winner ? (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    Parabéns!
                  </h2>
                  <p className="text-muted-foreground">
                    {winner.name} venceu o jogo!
                  </p>
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
