-- Add difficulty_level column to game_players table
ALTER TABLE public.game_players 
ADD COLUMN difficulty_level integer NOT NULL DEFAULT 1;

-- Add check constraint to ensure difficulty_level is between 1 and 3
ALTER TABLE public.game_players 
ADD CONSTRAINT difficulty_level_check CHECK (difficulty_level >= 1 AND difficulty_level <= 3);