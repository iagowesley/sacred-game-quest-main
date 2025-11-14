import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Copy, Users } from "lucide-react";

interface LobbyProps {
  onJoinRoom: (roomCode: string, playerName: string) => void;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const Lobby = ({ onJoinRoom }: LobbyProps) => {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Digite seu nome!");
      return;
    }

    setLoading(true);
    const newRoomCode = generateRoomCode();

    try {
      // Criar sala
      const { data: roomData, error: roomError } = await supabase
        .from("game_rooms")
        .insert({
          room_code: newRoomCode,
          host_name: playerName,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Adicionar host como primeiro jogador
      const { error: playerError } = await supabase
        .from("game_players")
        .insert({
          room_id: roomData.id,
          name: playerName,
          color: PLAYER_COLORS[0],
          player_order: 0
        });

      if (playerError) throw playerError;

      // Criar estado inicial do jogo
      await supabase
        .from("game_state")
        .insert({
          room_id: roomData.id,
          game_phase: 'roll'
        });

      toast.success("Sala criada! Compartilhe o código com os amigos.");
      onJoinRoom(newRoomCode, playerName);
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      toast.error("Erro ao criar sala. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Digite seu nome!");
      return;
    }

    if (!roomCode.trim()) {
      toast.error("Digite o código da sala!");
      return;
    }

    setLoading(true);

    try {
      // Verificar se a sala existe
      const { data: roomData, error: roomError } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("room_code", roomCode.toUpperCase())
        .single();

      if (roomError || !roomData) {
        toast.error("Sala não encontrada!");
        setLoading(false);
        return;
      }

      if (roomData.status === 'playing') {
        toast.error("Jogo já começou!");
        setLoading(false);
        return;
      }

      // Verificar quantos jogadores já tem
      const { data: playersData } = await supabase
        .from("game_players")
        .select("*")
        .eq("room_id", roomData.id);

      if (playersData && playersData.length >= 8) {
        toast.error("Sala cheia! Máximo 8 jogadores.");
        setLoading(false);
        return;
      }

      // Adicionar jogador
      const { error: playerError } = await supabase
        .from("game_players")
        .insert({
          room_id: roomData.id,
          name: playerName,
          color: PLAYER_COLORS[playersData?.length || 0],
          player_order: playersData?.length || 0
        });

      if (playerError) throw playerError;

      toast.success("Entrou na sala!");
      onJoinRoom(roomCode.toUpperCase(), playerName);
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
      toast.error("Erro ao entrar na sala. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast.success("Código copiado!");
    }
  };

  if (mode === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))]">
        <Card className="w-full max-w-md p-8 bg-card shadow-[var(--shadow-card-3d)]">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary mb-2">
                Jogo Bíblico Online
              </h1>
              <p className="text-muted-foreground">
                Jogue com amigos online!
              </p>
            </div>

            <div className="w-full space-y-3">
              <Button
                onClick={() => setMode('create')}
                className="w-full bg-primary hover:bg-primary/90 hover:shadow-[var(--shadow-glow)] transition-all duration-300 text-lg py-6"
              >
                <Users className="w-5 h-5 mr-2" />
                Criar Sala
              </Button>
              
              <Button
                onClick={() => setMode('join')}
                variant="outline"
                className="w-full border-2 border-primary/30 hover:bg-primary/10 text-lg py-6"
              >
                Entrar em uma Sala
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))]">
      <Card className="w-full max-w-md p-8 bg-card shadow-[var(--shadow-card-3d)]">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {mode === 'create' ? 'Criar Nova Sala' : 'Entrar na Sala'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'create' 
                ? 'Escolha seu nome e crie uma sala para seus amigos' 
                : 'Digite o código da sala e seu nome'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Seu Nome
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={20}
                className="border-2 border-primary/20 focus:border-primary"
              />
            </div>

            {mode === 'join' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Código da Sala
                </label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  maxLength={6}
                  className="border-2 border-primary/20 focus:border-primary uppercase"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              onClick={mode === 'create' ? createRoom : joinRoom}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              {loading ? 'Aguarde...' : mode === 'create' ? 'Criar Sala' : 'Entrar'}
            </Button>
            
            <Button
              onClick={() => setMode('menu')}
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
