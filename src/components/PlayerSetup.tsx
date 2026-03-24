import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserPlus, X, Play } from "@phosphor-icons/react";

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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)' }}
    >
      <Card className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/biblia34.png"
            alt="A Jornada"
            className="w-20 h-20 object-contain mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 0 12px hsl(45 95% 52% / 0.4))' }}
          />
          <h1 className="text-3xl font-bold text-gradient-gold mb-1">A Jornada</h1>
          <p className="text-muted-foreground">Perguntas e desafios sobre a bíblia e a igreja</p>
        </div>

        <div className="space-y-3 mb-6">
          <h2 className="text-base font-semibold text-foreground">
            Jogadores ({players.length}/8)
          </h2>

          {players.map((player, index) => (
            <div key={index} className="space-y-2 p-4 bg-muted/30 border border-border/40 rounded-xl">
              <div className="flex gap-2">
                <Input
                  placeholder={`Jogador ${index + 1}`}
                  value={player.name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-1 bg-input border-border focus:border-accent text-foreground placeholder:text-muted-foreground"
                />
                {players.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    className="border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
                  >
                    <X size={16} className="text-destructive" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => updatePlayerAvatar(index, avatar.src)}
                    className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all hover:scale-110 ${
                      player.avatar === avatar.src
                        ? 'border-accent'
                        : 'border-border/40 hover:border-primary/50'
                    }`}
                    style={player.avatar === avatar.src ? { boxShadow: 'var(--shadow-gold)' } : undefined}
                    title={avatar.name}
                  >
                    <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {players.length < 8 && (
            <Button
              variant="outline"
              onClick={addPlayer}
              className="w-full border-dashed border-primary/30 hover:bg-primary/10 hover:border-primary gap-2"
            >
              <UserPlus size={16} />
              Adicionar jogador
            </Button>
          )}

          {error && <p className="text-destructive text-sm text-center">{error}</p>}
        </div>

        <Button
          onClick={handleStartGame}
          className="w-full bg-primary hover:bg-primary/90 text-lg py-6 gap-2 transition-all duration-300"
          style={{ boxShadow: 'var(--shadow-glow)' }}
        >
          <Play size={20} weight="fill" />
          Iniciar jogo
        </Button>
      </Card>
    </div>
  );
};
