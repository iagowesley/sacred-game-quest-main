import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerPiece } from "./PlayerPiece";
import { Copy, Crown, Users, Play } from "@phosphor-icons/react";
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, hsl(220 11% 16%) 0%, hsl(220 13% 9%) 70%)' }}
    >
      <Card className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
        <div className="space-y-6">
          {/* Código da Sala */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gradient-gold mb-1">Sala de Espera</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Compartilhe o código com seus amigos
            </p>

            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
              <div className="flex-1 p-4 bg-accent/10 rounded-xl border border-accent/30">
                <p className="text-3xl font-bold text-accent tracking-widest">{roomCode}</p>
              </div>
              <Button
                onClick={copyRoomCode}
                size="icon"
                className="h-14 w-14 bg-primary hover:bg-primary/90"
                style={{ boxShadow: 'var(--shadow-glow)' }}
              >
                <Copy size={20} />
              </Button>
            </div>
          </div>

          {/* Lista de jogadores */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-primary" />
              <h3 className="font-semibold text-base">Jogadores ({players.length}/8)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="p-3.5 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <PlayerPiece color={player.color} name={player.name} size={38} />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm">{player.name}</p>
                        {index === 0 && <Crown size={13} weight="fill" className="text-accent" />}
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

          {/* Botão de iniciar (só host) */}
          {isHost && (
            <Button
              onClick={startGame}
              disabled={players.length < 2}
              className="w-full bg-primary hover:bg-primary/90 text-base py-6 gap-2 transition-all duration-300"
              style={{ boxShadow: players.length >= 2 ? 'var(--shadow-glow)' : undefined }}
            >
              <Play size={18} weight="fill" />
              {players.length < 2 ? 'Aguardando jogadores...' : 'Iniciar jogo'}
            </Button>
          )}

          {!isHost && (
            <div className="text-center py-3">
              <p className="text-muted-foreground text-sm animate-pulse">
                Aguardando o anfitrião iniciar o jogo...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
