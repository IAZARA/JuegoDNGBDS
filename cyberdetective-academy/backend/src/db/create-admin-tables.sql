-- Crear tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para tokens de reinicio
CREATE TABLE IF NOT EXISTS game_reset_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de estado del juego
CREATE TABLE IF NOT EXISTS game_state (
    id SERIAL PRIMARY KEY,
    reset_count INTEGER DEFAULT 0,
    last_reset_at TIMESTAMP,
    last_reset_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar estado inicial del juego si no existe
INSERT INTO game_state (reset_count, created_at) 
SELECT 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM game_state);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_game_reset_tokens_token ON game_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_game_reset_tokens_expires ON game_reset_tokens(expires_at);