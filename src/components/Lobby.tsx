import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Plus, SignIn, ArrowLeft } from "@phosphor-icons/react";

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
      <div
        className="min-h-screen flex flex-col items-center justify-between py-16 px-4"
        style={{ background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)' }}
      >
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm relative bg-card border border-accent/30 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
            {/* Cantoneiras */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent/50 rounded-tl" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-accent/50 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-accent/50 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-accent/50 rounded-br" />

            <div className="flex flex-col items-center gap-6">
              <BookOpen size={48} className="text-accent/80" />
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gradient-gold">A Jornada</h1>
                <p className="text-muted-foreground italic text-sm mt-1">Uma aventura bíblica multijogador</p>
              </div>

              <div className="w-full space-y-3">
                <Button
                  onClick={() => setMode('create')}
                  className="w-full bg-primary hover:bg-primary/90 text-base py-6 gap-2"
                  style={{ boxShadow: 'var(--shadow-glow)' }}
                >
                  <Plus size={20} />
                  Criar Sala
                </Button>
                <Button
                  onClick={() => setMode('join')}
                  variant="outline"
                  className="w-full border-2 border-primary/40 hover:bg-primary/10 hover:border-primary text-base py-6 gap-2"
                >
                  <SignIn size={20} />
                  Entrar em Sala
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, hsl(270 30% 15%) 0%, hsl(270 20% 8%) 70%)' }}
    >
      <div className="w-full max-w-md relative bg-card border border-accent/30 rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
        {/* Cantoneiras */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent/50 rounded-tl" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-accent/50 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-accent/50 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-accent/50 rounded-br" />

        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gradient-gold">
              {mode === 'create' ? 'Criar Nova Sala' : 'Entrar na Sala'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1 italic">
              {mode === 'create' ? 'Prepare-se para a aventura...' : 'Digite o código secreto...'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                Seu Nome
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={20}
                className="bg-input border-border focus:border-accent text-foreground placeholder:text-muted-foreground text-base py-5"
              />
            </div>

            {mode === 'join' && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  Código da Sala
                </label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  maxLength={6}
                  className="bg-input border-border focus:border-accent text-foreground placeholder:text-muted-foreground text-base py-5 uppercase tracking-[0.2em] font-bold text-center"
                />
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={mode === 'create' ? createRoom : joinRoom}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-base py-6 transition-all duration-300"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              {loading ? 'Preparando...' : mode === 'create' ? 'Iniciar Jornada' : 'Juntar-se'}
            </Button>

            <Button
              onClick={() => setMode('menu')}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground gap-2"
            >
              <ArrowLeft size={15} />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
