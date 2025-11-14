import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GameRoom {
  id: string;
  room_code: string;
  host_name: string;
  status: string;
  current_player_index: number;
  winner_name: string | null;
}

interface GamePlayer {
  id: string;
  room_id: string;
  name: string;
  color: string;
  position: number;
  player_order: number;
}

interface GameState {
  id: string;
  room_id: string;
  current_card: any;
  dice_value: number | null;
  game_phase: string;
}

export const useGameRoom = (roomCode: string | null) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar sala e jogadores
  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      const { data: roomData, error: roomError } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("room_code", roomCode)
        .single();

      if (roomError || !roomData) {
        toast.error("Sala não encontrada!");
        setLoading(false);
        return;
      }

      setRoom(roomData);

      const { data: playersData } = await supabase
        .from("game_players")
        .select("*")
        .eq("room_id", roomData.id)
        .order("player_order");

      setPlayers(playersData || []);

      const { data: stateData } = await supabase
        .from("game_state")
        .select("*")
        .eq("room_id", roomData.id)
        .maybeSingle();

      setGameState(stateData);
      setLoading(false);
    };

    fetchRoom();
  }, [roomCode]);

  // Realtime - Escutar mudanças na sala
  useEffect(() => {
    if (!room) return;

    const roomChannel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          setRoom(payload.new as GameRoom);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("game_players")
            .select("*")
            .eq("room_id", room.id)
            .order("player_order");
          setPlayers(data || []);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_state",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setGameState(payload.new as GameState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [room]);

  return { room, players, gameState, loading };
};
