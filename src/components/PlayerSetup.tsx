import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserPlus, X, Play } from "@phosphor-icons/react";

const AVATARS = [
  { id: 'dog', emoji: '🐶', name: 'Cachorro' },
  { id: 'cat', emoji: '🐱', name: 'Gato' },
  { id: 'fox', emoji: '🦊', name: 'Raposa' },
  { id: 'bear', emoji: '🐻', name: 'Urso' },
  { id: 'pig', emoji: '🐷', name: 'Porco' },
  { id: 'cow', emoji: '🐮', name: 'Vaca' },
  { id: 'lion', emoji: '🦁', name: 'Leão' },
  { id: 'koala', emoji: '🐨', name: 'Coala' },
];

interface PlayerSetupProps {
  onStartGame: (players: Array<{ name: string; emoji: string }>) => void;
}

interface PlayerData {
  name: string;
  emoji: string;
}

export const PlayerSetup = ({ onStartGame }: PlayerSetupProps) => {
  const [players, setPlayers] = useState<PlayerData[]>([{ name: "", emoji: AVATARS[0].emoji }]);
  const [error, setError] = useState("");

  const addPlayer = () => {
    if (players.length < 8) {
      const usedEmojis = players.map(p => p.emoji);
      const availableEmoji = AVATARS.find(a => !usedEmojis.includes(a.emoji))?.emoji || AVATARS[0].emoji;
      setPlayers([...players, { name: "", emoji: availableEmoji }]);
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

  const updatePlayerEmoji = (index: number, emoji: string) => {
    const newPlayers = [...players];
    newPlayers[index].emoji = emoji;
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/cross.svg"
            alt="A Jornada"
            className="w-20 h-20 object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground mb-1">A Jornada</h1>
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
                  className="flex-1 bg-input border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
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
                    onClick={() => updatePlayerEmoji(index, avatar.emoji)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110 border-2 ${player.emoji === avatar.emoji
                        ? 'border-primary bg-primary/15'
                        : 'border-border/40 hover:border-primary/50 bg-muted/30'
                      }`}
                    title={avatar.name}
                  >
                    {avatar.emoji}
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
        >
          <Play size={20} weight="fill" />
          Iniciar jogo
        </Button>
      </Card>
    </div>
  );
};
