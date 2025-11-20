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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))] bg-cover bg-center"
        style={{ backgroundImage: 'var(--wood-texture)' }}>
        <div className="w-full max-w-md p-8 bg-[#f5e6d3] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden border-8 border-[#5d4037]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.6\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")' }}>

          {/* Cantoneiras Douradas */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#ffd700] rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#ffd700] rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#ffd700] rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#ffd700] rounded-br-lg"></div>

          <div className="flex flex-col items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.6)] border-4 border-[#ffd700]">
              <Trophy className="w-12 h-12 text-[#ffd700]" />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-[#5d4037] font-serif tracking-wider drop-shadow-sm">
                A Jornada
              </h1>
              <p className="text-[#8d6e63] font-medium italic">
                Uma aventura bíblica multijogador
              </p>
            </div>

            <div className="w-full space-y-4">
              <Button
                onClick={() => setMode('create')}
                className="w-full bg-[#8b4513] hover:bg-[#a0522d] text-[#ffdead] border-2 border-[#d2691e] shadow-lg hover:shadow-xl transition-all duration-300 text-xl py-8 font-serif tracking-wide"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                <Users className="w-6 h-6 mr-3" />
                Criar Sala
              </Button>

              <Button
                onClick={() => setMode('join')}
                variant="outline"
                className="w-full bg-[#deb887] hover:bg-[#eecfa1] text-[#5d4037] border-2 border-[#8b4513] shadow-md hover:shadow-lg transition-all duration-300 text-xl py-8 font-serif tracking-wide"
              >
                Entrar em Sala
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))] bg-cover bg-center"
      style={{ backgroundImage: 'var(--wood-texture)' }}>
      <div className="w-full max-w-md p-8 bg-[#f5e6d3] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden border-8 border-[#5d4037]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.6\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")' }}>

        <div className="flex flex-col gap-6 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#5d4037] mb-2 font-serif">
              {mode === 'create' ? 'Criar Nova Sala' : 'Entrar na Sala'}
            </h2>
            <p className="text-[#8d6e63] italic">
              {mode === 'create'
                ? 'Prepare-se para a aventura...'
                : 'Digite o código secreto...'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-[#5d4037] mb-2 block uppercase tracking-wider">
                Seu Nome
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={20}
                className="bg-[#fff8dc] border-2 border-[#8b4513] focus:border-[#d2691e] text-[#5d4037] placeholder:text-[#8d6e63]/50 text-lg py-6"
              />
            </div>

            {mode === 'join' && (
              <div>
                <label className="text-sm font-bold text-[#5d4037] mb-2 block uppercase tracking-wider">
                  Código da Sala
                </label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  maxLength={6}
                  className="bg-[#fff8dc] border-2 border-[#8b4513] focus:border-[#d2691e] text-[#5d4037] placeholder:text-[#8d6e63]/50 text-lg py-6 uppercase tracking-[0.2em] font-bold text-center"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={mode === 'create' ? createRoom : joinRoom}
              disabled={loading}
              className="w-full bg-[#8b4513] hover:bg-[#a0522d] text-[#ffdead] border-2 border-[#d2691e] shadow-lg transition-all duration-300 text-lg py-6 font-serif"
            >
              {loading ? 'Preparando...' : mode === 'create' ? 'Iniciar Jornada' : 'Juntar-se'}
            </Button>

            <Button
              onClick={() => setMode('menu')}
              variant="ghost"
              className="w-full text-[#5d4037] hover:bg-[#8b4513]/10 hover:text-[#8b4513]"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
