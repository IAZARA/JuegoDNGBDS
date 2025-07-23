-- Crear tabla de administradores/presentadores
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para tokens de reinicio global
CREATE TABLE IF NOT EXISTS game_reset_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  admin_id INTEGER REFERENCES admins(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para el estado global del juego
CREATE TABLE IF NOT EXISTS game_state (
  id SERIAL PRIMARY KEY,
  is_active BOOLEAN DEFAULT true,
  reset_count INTEGER DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE,
  last_reset_by INTEGER REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar estado inicial del juego
INSERT INTO game_state (is_active) VALUES (true) ON CONFLICT DO NOTHING;

-- Insertar un admin por defecto
-- Usuario: ivan.zarate / Contraseña: Vortex733- (hasheada con bcrypt)
INSERT INTO admins (username, password_hash, name, email, is_super_admin) 
VALUES (
  'ivan.zarate', 
  '$2b$10$e4y1xVP51C5.02N13WGrvuLNQepDTh9EqP6jQa0KH3IXJUiB2BSb2',
  'Iván Zárate - Administrador Principal',
  'ivan.zarate@cyberdetective.academy',
  true
) ON CONFLICT (username) DO NOTHING;

-- Índices para mejorar rendimiento
CREATE INDEX idx_game_reset_tokens_token ON game_reset_tokens(token);
CREATE INDEX idx_game_reset_tokens_expires ON game_reset_tokens(expires_at);
CREATE INDEX idx_admins_username ON admins(username);