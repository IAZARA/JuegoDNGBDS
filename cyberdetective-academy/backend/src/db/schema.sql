-- Crear base de datos
CREATE DATABASE cyberdetective_db;

-- Conectar a la base de datos
\c cyberdetective_db;

-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ejercicios
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5), -- 1=muy_facil, 2=facil, 3=medio, 4=dificil, 5=muy_dificil
    points INTEGER NOT NULL,
    category VARCHAR(50),
    type VARCHAR(50),
    problem_data JSON NOT NULL,
    solution_data JSON NOT NULL,
    hints JSON,
    time_limit INTEGER, -- en segundos
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de intentos de ejercicios
CREATE TABLE exercise_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    time_taken INTEGER, -- en segundos
    hints_used INTEGER DEFAULT 0,
    answer_submitted TEXT,
    UNIQUE(user_id, exercise_id)
);

-- Tabla de badges/insignias
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    criteria JSON NOT NULL,
    points_required INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de badges obtenidos por usuarios
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Tabla de ranking/leaderboard
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    average_time INTEGER, -- promedio en segundos
    rank INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Índices para mejorar performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_exercise_attempts_user ON exercise_attempts(user_id);
CREATE INDEX idx_exercise_attempts_exercise ON exercise_attempts(exercise_id);
CREATE INDEX idx_leaderboard_points ON leaderboard(total_points DESC);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en leaderboard
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();