-- Agregar columna para controlar si los equipos están habilitados
ALTER TABLE game_state 
ADD COLUMN IF NOT EXISTS teams_enabled BOOLEAN DEFAULT true;

-- Agregar comentario explicativo
COMMENT ON COLUMN game_state.teams_enabled IS 'Controla si la funcionalidad de equipos está habilitada en el juego';