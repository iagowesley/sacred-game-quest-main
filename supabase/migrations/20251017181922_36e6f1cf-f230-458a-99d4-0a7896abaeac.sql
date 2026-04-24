-- Add difficulty_level column to game_players table
ALTER TABLE public.game_players 
ADD COLUMN difficulty_level integer NOT NULL DEFAULT 2;

-- Add check constraint to ensure difficulty_level is medium or hard
ALTER TABLE public.game_players 
ADD CONSTRAINT difficulty_level_check CHECK (difficulty_level >= 2 AND difficulty_level <= 3);
