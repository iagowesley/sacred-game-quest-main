import { useState } from "react";
import { PlayerSetup } from "@/components/PlayerSetup";
import { GameBoard } from "@/components/GameBoard";
import { Lobby } from "@/components/Lobby";
import { WaitingRoom } from "@/components/WaitingRoom";
import { useGameRoom } from "@/hooks/useGameRoom";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff } from "lucide-react";

const Index = () => {
  const [mode, setMode] = useState<'menu' | 'local' | 'online'>('menu');
  const [players, setPlayers] = useState<Array<{ name: string; avatar: string }>>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  const { room, players: onlinePlayers, loading } = useGameRoom(roomCode);

  const handlePlayersSubmit = (playerData: Array<{ name: string; avatar: string }>) => {
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

  // Menu inicial
  if (mode === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))]">
        <div className="text-center space-y-8 max-w-md">
          <h1 className="text-4xl font-bold text-primary">
            Jogo bíblico
          </h1>
          
          <div className="space-y-4">
            <Button
              onClick={() => setMode('online')}
              className="w-full bg-primary hover:bg-primary/90 hover:shadow-[var(--shadow-glow)] transition-all duration-300 text-lg py-8"
            >
              <Wifi className="w-6 h-6 mr-2" />
              Jogar online
            </Button>
            
            <Button
              onClick={() => setMode('local')}
              variant="outline"
              className="w-full border-2 border-primary/30 hover:bg-primary/10 text-lg py-8"
            >
              <WifiOff className="w-6 h-6 mr-2" />
              Jogar local
            </Button>
          </div>
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
          players={onlinePlayers.map(p => ({ name: p.name, avatar: '/avatars/dog.png' }))} 
          onRestart={handleRestart}
        />
      );
    }

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      );
    }
  }

  return null;
};

export default Index;
