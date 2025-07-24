const db = require('../db/connection');

class ExerciseAttempt {
  static async create({ userId, exerciseId, isCorrect, pointsEarned, timeTaken, hintsUsed, answerSubmitted }) {
    // Verificar si ya existe un intento para este usuario y ejercicio
    const existingAttempt = await this.findByUserAndExercise(userId, exerciseId);
    
    if (existingAttempt.length > 0) {
      // Si ya existe y fue correcto, no permitir otro intento
      if (existingAttempt[0].is_correct) {
        throw new Error('Ya completaste este ejercicio correctamente');
      }
      
      // Si existe pero fue incorrecto, actualizar el intento existente
      const updateQuery = `
        UPDATE exercise_attempts 
        SET completed_at = CURRENT_TIMESTAMP, 
            is_correct = $3, 
            points_earned = $4, 
            time_taken = $5, 
            hints_used = $6, 
            answer_submitted = $7
        WHERE user_id = $1 AND exercise_id = $2
        RETURNING *
      `;
      
      const values = [userId, exerciseId, isCorrect, pointsEarned, timeTaken, hintsUsed, answerSubmitted];
      const result = await db.query(updateQuery, values);
      return result.rows[0];
    }

    // Crear el nuevo intento si no existe
    const query = `
      INSERT INTO exercise_attempts 
      (user_id, exercise_id, completed_at, is_correct, points_earned, time_taken, hints_used, answer_submitted)
      VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [userId, exerciseId, isCorrect, pointsEarned, timeTaken, hintsUsed, answerSubmitted];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }
  
  static async findByUser(userId) {
    const query = `
      SELECT ea.*, e.title, e.difficulty, e.points as max_points
      FROM exercise_attempts ea
      JOIN exercises e ON ea.exercise_id = e.id
      WHERE ea.user_id = $1
      ORDER BY ea.completed_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
  
  static async findByUserAndExercise(userId, exerciseId) {
    const query = `
      SELECT * FROM exercise_attempts 
      WHERE user_id = $1 AND exercise_id = $2
      ORDER BY completed_at DESC
    `;
    
    const result = await db.query(query, [userId, exerciseId]);
    return result.rows; // Retorna todos los intentos
  }

  static async getUserAttemptInfo(userId, exerciseId) {
    const query = `
      SELECT 
        COUNT(*) as total_attempts,
        COALESCE(bool_or(is_correct), false) as has_completed
      FROM exercise_attempts 
      WHERE user_id = $1 AND exercise_id = $2
    `;
    
    const result = await db.query(query, [userId, exerciseId]);
    const info = result.rows[0];
    
    // Si no hay intentos previos, asignar valores por defecto
    if (info.total_attempts === '0') {
      return {
        total_attempts: 0,
        remaining_attempts: 1,
        has_completed: false,
        can_attempt: true
      };
    }
    
    return {
      total_attempts: parseInt(info.total_attempts),
      remaining_attempts: info.has_completed ? 0 : 1,
      has_completed: info.has_completed,
      can_attempt: !info.has_completed
    };
  }
  
  static async getUserProgress(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_attempted,
        COUNT(*) FILTER (WHERE is_correct = true) as completed,
        SUM(points_earned) as total_points,
        AVG(time_taken) FILTER (WHERE is_correct = true) as avg_time
      FROM exercise_attempts 
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = ExerciseAttempt;