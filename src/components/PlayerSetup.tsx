import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

const AVATARS = [
  { id: 'dog', src: '/avatars/dog.png', name: 'Cachorro' },
  { id: 'cat', src: '/avatars/cat.png', name: 'Gato' },
  { id: 'fox', src: '/avatars/fox.png', name: 'Raposa' },
  { id: 'bear', src: '/avatars/bear.png', name: 'Urso' },
  { id: 'pig', src: '/avatars/pig.png', name: 'Porco' },
  { id: 'cow', src: '/avatars/cow.png', name: 'Vaca' },
  { id: 'lion', src: '/avatars/lion.png', name: 'Leão' },
  { id: 'koala', src: '/avatars/koala.png', name: 'Coala' },
];

interface PlayerSetupProps {
  onStartGame: (players: Array<{ name: string; avatar: string }>) => void;
}

interface PlayerData {
  name: string;
  avatar: string;
}

export const PlayerSetup = ({ onStartGame }: PlayerSetupProps) => {
  const [players, setPlayers] = useState<PlayerData[]>([{ name: "", avatar: AVATARS[0].src }]);
  const [error, setError] = useState("");

  const addPlayer = () => {
    if (players.length < 8) {
      const usedAvatars = players.map(p => p.avatar);
      const availableAvatar = AVATARS.find(a => !usedAvatars.includes(a.src))?.src || AVATARS[0].src;
      setPlayers([...players, { name: "", avatar: availableAvatar }]);
      setError("");
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
      setError("");
    }
  };

  const updatePlayerName = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = value;
    setPlayers(newPlayers);
    setError("");
  };

  const updatePlayerAvatar = (index: number, avatar: string) => {
    const newPlayers = [...players];
    newPlayers[index].avatar = avatar;
    setPlayers(newPlayers);
    setError("");
  };

  const handleStartGame = () => {
    const validPlayers = players.filter(p => p.name.trim() !== "");
    if (validPlayers.length < 2) {
      setError("É necessário pelo menos 2 jogadores");
      return;
    }
    onStartGame(validPlayers);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))]">
      <Card className="w-full max-w-2xl p-8 shadow-[var(--shadow-card)] bg-card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-30 h-30 mb-4 shadow-[var(--shadow-glow)] p-4">
            <img src="/biblia34.png" alt="Bíblia" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-primary">
            Jogo bíblico
          </h1>
          <p className="text-muted-foreground text-lg">
            Perguntas e desafios sobre a bíblia e a igreja
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            Jogadores ({players.length}/8)
          </h2>
          
          {players.map((player, index) => (
            <div key={index} className="space-y-2 p-4 bg-muted/30 border border-border">
              <div className="flex gap-2">
                <Input
                  placeholder={`Jogador ${index + 1}`}
                  value={player.name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-1 bg-background/50 border-primary/20 focus:border-primary transition-colors"
                />
                {players.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    className="border-destructive/20 hover:bg-destructive/10 hover:border-destructive"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => updatePlayerAvatar(index, avatar.src)}
                    className={`w-12 h-12 border-2 transition-all hover:scale-110 ${
                      player.avatar === avatar.src 
                        ? 'border-primary shadow-[var(--shadow-glow)]' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    title={avatar.name}
                  >
                    <img src={avatar.src} alt={avatar.name} className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {players.length < 8 && (
            <Button
              variant="outline"
              onClick={addPlayer}
              className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar jogador
            </Button>
          )}

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
        </div>

        <Button
          onClick={handleStartGame}
          className="w-full bg-primary hover:bg-primary/90 hover:shadow-[var(--shadow-glow)] transition-all duration-300 text-lg py-6"
        >
          Iniciar jogo
        </Button>
      </Card>
    </div>
  );
};
