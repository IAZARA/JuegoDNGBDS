const { pool } = require('./connection');
const path = require('path');
const fs = require('fs').promises;

async function autoSetupDatabase() {
  try {
    console.log('🚀 Inicializando base de datos completa para CyberDetective Academy...');
    
    // Verificar si ya está configurada completamente
    try {
      const exerciseCheck = await pool.query('SELECT COUNT(*) FROM exercises');
      const exerciseCount = parseInt(exerciseCheck.rows[0].count);
      
      if (exerciseCount >= 24) {
        console.log(`✅ Base de datos completa (${exerciseCount} ejercicios encontrados)`);
        return;
      } else {
        console.log(`🔧 Base de datos incompleta (${exerciseCount}/24 ejercicios). Recreando...`);
      }
    } catch (error) {
      console.log('🔧 Inicializando base de datos desde cero...');
    }
    
    // PASO 1: Crear esquema completo con TODOS los statements SQL necesarios
    const setupSteps = [
      {
        name: 'Funciones y triggers',
        sql: `
          -- Función para actualizar updated_at
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
          END;
          $$ language 'plpgsql';
          
          -- Función para contar miembros del equipo
          CREATE OR REPLACE FUNCTION update_team_member_count()
          RETURNS TRIGGER AS $$
          BEGIN
            IF TG_OP = 'INSERT' THEN
              UPDATE teams SET member_count = member_count + 1 WHERE id = NEW.team_id;
              RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
              UPDATE teams SET member_count = member_count - 1 WHERE id = OLD.team_id;
              RETURN OLD;
            END IF;
            RETURN NULL;
          END;
          $$ LANGUAGE plpgsql;
        `
      },
      {
        name: 'Tablas principales',
        sql: \`
          -- Tabla users
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            points INTEGER DEFAULT 0,
            level VARCHAR(50) DEFAULT 'Detective Junior',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Tabla exercises
          CREATE TABLE IF NOT EXISTS exercises (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(100) NOT NULL,
            difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
            max_points INTEGER NOT NULL DEFAULT 30,
            time_limit_minutes INTEGER DEFAULT 5,
            type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
            problem_data JSONB NOT NULL,
            solution_data JSONB NOT NULL,
            hints JSONB DEFAULT '[]',
            order_index INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Tabla badges
          CREATE TABLE IF NOT EXISTS badges (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            icon VARCHAR(255),
            requirement_type VARCHAR(100),
            requirement_value INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Tabla leaderboard
          CREATE TABLE IF NOT EXISTS leaderboard (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            total_points INTEGER DEFAULT 0,
            exercises_completed INTEGER DEFAULT 0,
            average_score DECIMAL(5,2) DEFAULT 0.00,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            rank_position INTEGER DEFAULT 0
          );
          
          -- Tabla exercise_attempts
          CREATE TABLE IF NOT EXISTS exercise_attempts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
            attempt_number INTEGER DEFAULT 1,
            user_answer JSONB,
            is_correct BOOLEAN DEFAULT false,
            points_earned INTEGER DEFAULT 0,
            time_taken INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            hints_used INTEGER DEFAULT 0
          );
          
          -- Tabla user_badges
          CREATE TABLE IF NOT EXISTS user_badges (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, badge_id)
          );
        \`
      }
    
    // NUCLEAR FIX: Borrar y recrear system_config
    try {
      console.log('🔥 NUCLEAR FIX: Recreando system_config...');
      
      // Borrar tabla si existe
      await pool.query('DROP TABLE IF EXISTS system_config CASCADE');
      
      // Recrear desde cero
      await pool.query(`
        CREATE TABLE system_config (
          id SERIAL PRIMARY KEY,
          teams_enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insertar dato inicial
      await pool.query(`
        INSERT INTO system_config (id, teams_enabled) 
        VALUES (1, true)
      `);
      
      // Verificar que funcionó
      const result = await pool.query('SELECT teams_enabled FROM system_config WHERE id = 1');
      console.log(`✅ system_config recreada. teams_enabled = ${result.rows[0]?.teams_enabled}`);
      
    } catch (err) {
      console.log(`❌ NUCLEAR FIX FAILED: ${err.message}`);
    }
    
    // Crear tabla users si no existe
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          points INTEGER DEFAULT 0,
          level VARCHAR(50) DEFAULT 'Detective Junior',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabla users creada');
    } catch (err) {
      console.log(`⚠️  users table: ${err.message}`);
    }
    
    console.log('🎉 Setup automático completado');
    
  } catch (error) {
    console.error('❌ Error en setup automático:', error.message);
    // No crashear la app, solo logear
  }
}

module.exports = { autoSetupDatabase };