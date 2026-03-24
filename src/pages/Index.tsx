import { useState } from "react";
import { PlayerSetup } from "@/components/PlayerSetup";
import { GameBoard } from "@/components/GameBoard";
import { Lobby } from "@/components/Lobby";
import { WaitingRoom } from "@/components/WaitingRoom";
import { useGameRoom } from "@/hooks/useGameRoom";
import { Button } from "@/components/ui/button";
import { WifiHigh, UsersThree } from "@phosphor-icons/react";

const Index = () => {
  const [mode, setMode] = useState<'menu' | 'local' | 'online'>('menu');
  const [players, setPlayers] = useState<Array<{ name: string; emoji: string }>>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  const { room, players: onlinePlayers, loading } = useGameRoom(roomCode);

  const handlePlayersSubmit = (playerData: Array<{ name: string; emoji: string }>) => {
    setPlayers(playerData);
    setGameStarted(true);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setPlayers([]);
    setMode('menu');
    setRoomCode(null);
  };

  const handleJoinRoom = (code: string, name: string) => {
    setRoomCode(code);
    setPlayerName(name);
  };

  if (mode === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between py-16 px-4 bg-background">
        {/* Centro — logo e título */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
          <img
            src="/biblia34.png"
            alt="A Jornada"
            className="w-28 h-28 object-contain"
          />

          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              A Jornada
            </h1>
            <p className="text-muted-foreground italic text-lg">
              Uma aventura bíblica
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 border-t border-border/40" />
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <div className="w-16 border-t border-border/40" />
          </div>
        </div>

        {/* Botões na parte inferior */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={() => setMode('online')}
            className="w-full bg-primary hover:bg-primary/90 text-lg py-7 gap-3 transition-all duration-300"
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

  // Modo Local
  if (mode === 'local') {
    if (!gameStarted) {
      return <PlayerSetup onStartGame={handlePlayersSubmit} />;
    }
    return <GameBoard players={players} onRestart={handleRestart} />;
  }

  // Modo Online
  if (mode === 'online') {
    // Lobby - criar/entrar sala
    if (!roomCode) {
      return <Lobby onJoinRoom={handleJoinRoom} />;
    }

    // Sala de espera
    if (room && room.status === 'waiting') {
      const isHost = onlinePlayers[0]?.name === playerName;
      return (
        <WaitingRoom
          roomCode={roomCode}
          players={onlinePlayers}
          isHost={isHost}
          roomId={room.id}
        />
      );
    }

    // Jogo em andamento
    if (room && room.status === 'playing') {
      return (
        <GameBoard
          players={onlinePlayers.map(p => ({ name: p.name, emoji: '🐶' }))}
          onRestart={handleRestart}
        />
      );
    }

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-muted-foreground text-lg animate-pulse">Carregando...</p>
        </div>
      );
    }
  }

  return null;
};

export default Index;
