import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BoardSquare } from "./BoardSquare";
import { PlayerPiece } from "./PlayerPiece";
import { Dice } from "./Dice";
import { GameCard } from "./GameCard";
import { Trophy, ArrowCounterClockwise, DiceFive, Crown } from "@phosphor-icons/react";
import { BoardSquare as BoardSquareType } from "@/types/game";
import { toast } from "sonner";

const EMOJIS = ['🐶', '🐱', '🦊', '🐻', '🐷', '🐮', '🦁', '🐨'];
const TOTAL_SQUARES = 30;

interface DbPlayer {
  id: string;
  name: string;
  color: string;
  position: number;
  difficulty_level: number;
  player_order: number;
  correct_answers: number;
  card_rotation: number;
}

interface DbRoom {
  id: string;
  current_player_index: number;
  status: string;
  winner_name: string | null;
}

interface DbGameState {
  id: string;
  dice_value: number | null;
  current_card: any;
  game_phase: string | null;
}

interface OnlineGameBoardProps {
  roomId: string;
  myPlayerName: string;
  onRestart: () => void;
}

const generateBoard = (): BoardSquareType[] =>
  Array.from({ length: TOTAL_SQUARES + 1 }, (_, i) => ({
    id: i,
    type: 'normal' as const,
    label: i === 0 ? 'Início' : i === TOTAL_SQUARES ? 'Fim' : '',
  }));

export const OnlineGameBoard = ({ roomId, myPlayerName, onRestart }: OnlineGameBoardProps) => {
  const [room, setRoom] = useState<DbRoom | null>(null);
  const [dbPlayers, setDbPlayers] = useState<DbPlayer[]>([]);
  const [gameState, setGameState] = useState<DbGameState | null>(null);
  const [board] = useState(generateBoard());
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceDisplayValue, setDiceDisplayValue] = useState<number | null>(null);
  const usedIndicesRef = useRef<Set<number>>(new Set());

  // Qual jogador sou eu nesta sessão
  const myPlayer = dbPlayers.find(p => p.name === myPlayerName) ?? null;
  const currentPlayerData = room ? dbPlayers[room.current_player_index] ?? null : null;
  const isMyTurn = !!currentPlayerData && currentPlayerData.name === myPlayerName;
  const winner = room?.winner_name ? dbPlayers.find(p => p.name === room!.winner_name) ?? null : null;
  const showCard = gameState?.game_phase === 'answer' && !!gameState.current_card;

  // Buscar estado inicial
  useEffect(() => {
    if (!roomId) return;
    const fetch = async () => {
      const { data: r } = await supabase.from('game_rooms').select('*').eq('id', roomId).single();
      if (r) setRoom(r as DbRoom);

      const { data: p } = await supabase.from('game_players').select('*').eq('room_id', roomId).order('player_order');
      if (p) setDbPlayers(p as DbPlayer[]);

      const { data: s } = await supabase.from('game_state').select('*').eq('room_id', roomId).maybeSingle();
      if (s) setGameState(s as DbGameState);
    };
    fetch();
  }, [roomId]);

  // Realtime — escuta mudanças de todos os outros jogadores
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`online-game:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        (payload) => setRoom(payload.new as DbRoom))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `room_id=eq.${roomId}` },
        async () => {
          const { data } = await supabase.from('game_players').select('*').eq('room_id', roomId).order('player_order');
          if (data) setDbPlayers(data as DbPlayer[]);
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const s = payload.new as DbGameState;
          setGameState(s);
          // Sincroniza o dado visível para não-jogadores
          if (s.dice_value) setDiceDisplayValue(s.dice_value);
          if (s.game_phase === 'roll') setDiceDisplayValue(null);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const drawAndPublishCard = useCallback(async (diceVal: number, player: DbPlayer) => {
    const { questions, challenges } = await import('@/data/gameData');
    const rotation = (player.card_rotation ?? 0) as number;
    let card: any;

    if (rotation === 0) {
      const allWithIdx = questions.map((q, i) => ({ ...q, originalIndex: i }));
      const forLevel = allWithIdx.filter(q => q.difficulty === player.difficulty_level);
      const pool = forLevel.length > 0 ? forLevel : allWithIdx;
      let unused = pool.filter(q => !usedIndicesRef.current.has(q.originalIndex));
      if (unused.length === 0) {
        pool.forEach(q => usedIndicesRef.current.delete(q.originalIndex));
        unused = pool;
      }
      const picked = [...unused].sort(() => Math.random() - 0.5)[0];
      usedIndicesRef.current.add(picked.originalIndex);
      card = { type: 'question', question: picked.question, options: picked.options, correct: picked.correct };
      const names = ['', 'Fácil', 'Médio', 'Difícil'];
      toast.info(`Pergunta — Nível: ${names[player.difficulty_level]}`);
    } else if (rotation === 1) {
      const pool = challenges.filter(c =>
        !c.toLowerCase().includes('iasd') && !c.toLowerCase().includes('adventista') &&
        !c.toLowerCase().includes('ellen') && !c.toLowerCase().includes('white') &&
        !c.toLowerCase().includes('pioneiros') && !c.toLowerCase().includes('conferência'));
      card = { type: 'challenge', text: pool[Math.floor(Math.random() * pool.length)] };
      toast.info('Desafio Bíblico');
    } else {
      const pool = challenges.filter(c =>
        c.toLowerCase().includes('iasd') || c.toLowerCase().includes('adventista') ||
        c.toLowerCase().includes('ellen') || c.toLowerCase().includes('white') ||
        c.toLowerCase().includes('sábado') || c.toLowerCase().includes('dízimo'));
      card = { type: 'challenge', text: pool[Math.floor(Math.random() * pool.length)] };
      toast.info('Desafio IASD');
    }

    // Publica dado + carta em uma única operação — todos veem ao mesmo tempo
    await supabase.from('game_state').update({
      dice_value: diceVal,
      current_card: card,
      game_phase: 'answer',
    }).eq('room_id', roomId);
  }, [roomId]);

  const rollDice = () => {
    if (!isMyTurn || !currentPlayerData || isRollingDice) return;
    setIsRollingDice(true);

    let rolls = 0;
    let lastValue = 1;
    const interval = setInterval(() => {
      lastValue = Math.floor(Math.random() * 6) + 1;
      setDiceDisplayValue(lastValue);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        setIsRollingDice(false);
        // Após animação local, publica o resultado para todos
        setTimeout(() => drawAndPublishCard(lastValue, currentPlayerData), 1500);
      }
    }, 100);
  };

  const finalizeTurn = async (playerUpdate: Partial<DbPlayer>) => {
    if (!room || !currentPlayerData) return;

    const newCardRotation = ((currentPlayerData.card_rotation ?? 0) + 1) % 3;
    const nextPlayerIndex = (room.current_player_index + 1) % dbPlayers.length;
    const finalPosition = playerUpdate.position ?? currentPlayerData.position;
    const isWinner = finalPosition >= TOTAL_SQUARES;

    // Atualiza posição/dificuldade do jogador atual
    await supabase.from('game_players').update({
      ...playerUpdate,
      card_rotation: newCardRotation,
    } as any).eq('id', currentPlayerData.id);

    // Avança turno ou declara vencedor
    await supabase.from('game_rooms').update({
      current_player_index: nextPlayerIndex,
      status: isWinner ? 'finished' : 'playing',
      winner_name: isWinner ? currentPlayerData.name : null,
    }).eq('id', roomId);

    // Reseta estado do jogo para a próxima rodada
    await supabase.from('game_state').update({
      current_card: null,
      dice_value: null,
      game_phase: 'roll',
    }).eq('room_id', roomId);
  };

  const handleAnswer = async (answerIndex: number) => {
    if (!currentPlayerData || !gameState) return;
    const isCorrect = answerIndex === gameState.current_card?.correct;

    let newPosition = currentPlayerData.position;
    let newDifficulty = currentPlayerData.difficulty_level;
    let newCorrectAnswers = (currentPlayerData.correct_answers ?? 0);

    if (isCorrect) {
      newPosition = Math.min(TOTAL_SQUARES, currentPlayerData.position + (gameState.dice_value ?? 0));
      newCorrectAnswers += 1;
      toast.success(`Resposta correta! Avance ${gameState.dice_value} casas`);
      if (newCorrectAnswers >= 2 && newDifficulty < 3) {
        newDifficulty += 1;
        newCorrectAnswers = 0;
        const names = ['', 'Fácil', 'Médio', 'Difícil'];
        setTimeout(() => toast.info(`Nível aumentado para ${names[newDifficulty]}!`), 1500);
      }
    } else {
      toast.error('Resposta errada! Você fica parado');
    }

    await finalizeTurn({ position: newPosition, difficulty_level: newDifficulty, correct_answers: newCorrectAnswers } as any);
  };

  const handleChallengeComplete = async (completed: boolean) => {
    if (!currentPlayerData || !gameState) return;
    let newPosition = currentPlayerData.position;
    if (completed) {
      newPosition = Math.min(TOTAL_SQUARES, currentPlayerData.position + (gameState.dice_value ?? 0));
      toast.success(`Prenda completada! Avance ${gameState.dice_value} casas`);
    } else {
      toast.error('Prenda não completada! Você fica parado');
    }
    await finalizeTurn({ position: newPosition } as any);
  };

  const getPlayersAtPosition = (pos: number) => dbPlayers.filter(p => p.position === pos);

  const connH = { borderTop: '2px dashed hsl(270 40% 35% / 0.5)', background: 'none' } as React.CSSProperties;
  const connV = { borderLeft: '2px dashed hsl(270 40% 35% / 0.5)', background: 'none' } as React.CSSProperties;

  const renderSquares = (squares: BoardSquareType[], reverseConnector: boolean, showVerticalOnLast: boolean) =>
    squares.map((square, i) => {
      const isLast = i === squares.length - 1;
      const connSide = reverseConnector ? '-left-4' : '-right-4';
      return (
        <div key={square.id} className="relative flex-1">
          <BoardSquare square={square} size={70} />
          {!isLast && (
            <div className={`absolute top-1/2 ${connSide} w-6 h-1 z-0`} style={{ transform: 'translateY(-50%)', ...connH }} />
          )}
          {isLast && showVerticalOnLast && (
            <div className="absolute -bottom-14 left-1/2 w-1 h-16 z-0" style={{ transform: 'translateX(-50%)', ...connV }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-wrap gap-0.5 justify-center">
              {getPlayersAtPosition(square.id).map((p, idx) => (
                <PlayerPiece key={idx} color={p.color} name={p.name} size={28} emoji={EMOJIS[p.player_order] ?? '🐶'} />
              ))}
            </div>
          </div>
        </div>
      );
    });

  if (!room || dbPlayers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Carregando jogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-background">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 bg-card px-5 py-3 rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Trophy size={20} weight="fill" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-wide">A Jornada — Online</h1>
              {!winner && currentPlayerData && (
                <p className="text-xs text-muted-foreground">
                  {isMyTurn
                    ? <span className="font-semibold text-primary">Sua vez!</span>
                    : <>Vez de: <span className="font-semibold text-foreground">{currentPlayerData.name}</span></>
                  }
                </p>
              )}
              {winner && <p className="text-sm font-bold text-primary animate-pulse">Vencedor: {winner.name}!</p>}
            </div>
          </div>
          <Button variant="outline" onClick={onRestart} className="border-border/50 hover:bg-primary/10 gap-2 text-sm">
            <ArrowCounterClockwise size={15} />
            Sair
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tabuleiro */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl"
              style={{ background: 'hsl(270 20% 11%)', border: '2px solid hsl(270 20% 20%)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div className="relative z-10">
                <div className="flex gap-2 mb-12">{renderSquares(board.slice(0, 6), false, true)}</div>
                <div className="flex flex-row-reverse gap-2 mb-12">{renderSquares(board.slice(6, 12), true, true)}</div>
                <div className="flex gap-2 mb-12">{renderSquares(board.slice(12, 18), false, true)}</div>
                <div className="flex flex-row-reverse gap-2 mb-12">{renderSquares(board.slice(18, 24), true, true)}</div>
                <div className="flex gap-2 mb-4">{renderSquares(board.slice(24, 31), false, false)}</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Jogadores */}
            <Card className="p-4 bg-card border border-border/50">
              <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Jogadores</h3>
              <div className="space-y-2">
                {dbPlayers.map((player, index) => {
                  const isActive = index === room.current_player_index && !winner;
                  const isMe = player.name === myPlayerName;
                  return (
                    <div key={player.id}
                      className={`p-3 rounded-lg transition-all ${isActive ? 'bg-primary/15 border-2 border-primary' : 'bg-muted/30 border border-border/30'}`}
                      style={isActive ? { boxShadow: '0 0 12px hsl(270 60% 55% / 0.3)' } : undefined}>
                      <div className="flex items-center gap-3">
                        <PlayerPiece color={player.color} name={player.name} size={36} emoji={EMOJIS[player.player_order] ?? '🐶'} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {isActive && <Crown size={13} weight="fill" className="text-primary flex-shrink-0" />}
                            <div className="font-medium text-sm truncate">
                              {player.name}{isMe && <span className="text-xs text-muted-foreground ml-1">(você)</span>}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Casa {player.position}/{TOTAL_SQUARES} · Nível {player.difficulty_level}
                          </div>
                          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full transition-all duration-500"
                              style={{ width: `${(player.position / TOTAL_SQUARES) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Ações */}
            <Card className="p-4 bg-card border border-border/50">
              {winner ? (
                <div className="text-center py-6">
                  <Trophy size={64} weight="fill" className="text-primary mx-auto mb-3 animate-bounce" />
                  <h2 className="text-2xl font-bold text-foreground mb-1">Parabéns!</h2>
                  <p className="text-muted-foreground">{winner.name} venceu a jornada!</p>
                </div>
              ) : showCard && gameState?.current_card ? (
                isMyTurn ? (
                  // Só o jogador da vez pode responder
                  <GameCard
                    card={gameState.current_card}
                    onAnswer={handleAnswer}
                    onChallengeComplete={handleChallengeComplete}
                    onClose={() => finalizeTurn({ position: currentPlayerData!.position } as any)}
                  />
                ) : (
                  // Outros jogadores veem a carta mas não podem interagir
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 space-y-3">
                    <p className="text-sm font-semibold text-foreground text-center">
                      {currentPlayerData?.name} está respondendo...
                    </p>
                    {diceDisplayValue && (
                      <div className="flex flex-col items-center gap-2">
                        <Dice value={diceDisplayValue} isRolling={false} />
                        <p className="text-xs text-muted-foreground">Tirou {diceDisplayValue}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground text-center italic line-clamp-3">
                      {gameState.current_card.type === 'question' ? gameState.current_card.question : gameState.current_card.text}
                    </p>
                  </div>
                )
              ) : isMyTurn ? (
                // Vez do jogador atual — mostrar dado e botão
                <div className="space-y-5">
                  {diceDisplayValue && (
                    <div className="flex flex-col items-center gap-3">
                      <Dice value={diceDisplayValue} isRolling={isRollingDice} />
                      <p className="text-sm text-muted-foreground font-medium">
                        {isRollingDice ? 'Rolando...' : `Você tirou ${diceDisplayValue}!`}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={rollDice}
                    disabled={isRollingDice}
                    className="w-full bg-primary hover:bg-primary/90 text-base py-6 gap-2"
                  >
                    <DiceFive size={20} />
                    {isRollingDice ? 'Rolando dado...' : 'Jogar dado'}
                  </Button>
                </div>
              ) : (
                // Aguardando o jogador da vez
                <div className="flex flex-col items-center gap-4 py-6">
                  {diceDisplayValue && (
                    <div className="flex flex-col items-center gap-2">
                      <Dice value={diceDisplayValue} isRolling={false} />
                      <p className="text-xs text-muted-foreground">Tirou {diceDisplayValue}</p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground animate-pulse text-center">
                    Aguardando {currentPlayerData?.name}...
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
