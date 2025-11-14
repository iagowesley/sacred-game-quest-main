import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerPiece } from "./PlayerPiece";
import { Copy, Crown, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WaitingRoomProps {
  roomCode: string;
  players: Array<{
    id: string;
    name: string;
    color: string;
    player_order: number;
  }>;
  isHost: boolean;
  roomId: string;
}

export const WaitingRoom = ({ roomCode, players, isHost, roomId }: WaitingRoomProps) => {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Código copiado!");
  };

  const startGame = async () => {
    if (players.length < 2) {
      toast.error("Precisa de pelo menos 2 jogadores!");
      return;
    }

    try {
      await supabase
        .from("game_rooms")
        .update({ status: 'playing' })
        .eq("id", roomId);

      toast.success("Jogo iniciado!");
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
      toast.error("Erro ao iniciar jogo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))]">
      <Card className="w-full max-w-2xl p-8 bg-card shadow-[var(--shadow-card-3d)]">
        <div className="space-y-6">
          {/* Código da Sala */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Sala de Espera
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Compartilhe o código com seus amigos
            </p>
            
            <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
              <div className="flex-1 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                <p className="text-3xl font-bold text-primary tracking-wider">
                  {roomCode}
                </p>
              </div>
              <Button
                onClick={copyRoomCode}
                size="icon"
                className="h-14 w-14 bg-primary hover:bg-primary/90 hover:shadow-[var(--shadow-glow)]"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Lista de Jogadores */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">
                Jogadores ({players.length}/8)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="p-4 bg-muted/30 rounded-lg border-2 border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <PlayerPiece color={player.color} name={player.name} size={40} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{player.name}</p>
                        {index === 0 && (
                          <Crown className="w-4 h-4 text-accent" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {index === 0 ? 'Anfitrião' : `Jogador ${index + 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Iniciar (só para o host) */}
          {isHost && (
            <Button
              onClick={startGame}
              disabled={players.length < 2}
              className="w-full bg-primary hover:bg-primary/90 hover:shadow-[var(--shadow-glow)] transition-all duration-300 text-lg py-6"
            >
              {players.length < 2 
                ? 'Aguardando Jogadores...' 
                : 'Iniciar jogo'}
            </Button>
          )}

          {!isHost && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Aguardando o anfitrião iniciar o jogo...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
