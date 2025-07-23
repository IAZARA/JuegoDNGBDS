const db = require('../db/connection');

class ExerciseAttempt {
  static async create({ userId, exerciseId, isCorrect, pointsEarned, timeTaken, hintsUsed, answerSubmitted }) {
    // Primero verificamos si el usuario puede hacer más intentos
    const canAttemptQuery = `SELECT can_attempt_exercise($1, $2) as can_attempt`;
    const canAttemptResult = await db.query(canAttemptQuery, [userId, exerciseId]);
    
    if (!canAttemptResult.rows[0].can_attempt) {
      throw new Error('Ya no puedes hacer más intentos en este ejercicio o ya lo completaste correctamente');
    }

    // Obtener el siguiente número de intento
    const nextAttemptQuery = `SELECT get_next_attempt_number($1, $2) as attempt_number`;
    const nextAttemptResult = await db.query(nextAttemptQuery, [userId, exerciseId]);
    const attemptNumber = nextAttemptResult.rows[0].attempt_number;

    // Crear el nuevo intento
    const query = `
      INSERT INTO exercise_attempts 
      (user_id, exercise_id, attempt_number, completed_at, is_correct, points_earned, time_taken, hints_used, answer_submitted)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [userId, exerciseId, attemptNumber, isCorrect, pointsEarned, timeTaken, hintsUsed, answerSubmitted];
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
      ORDER BY attempt_number DESC
    `;
    
    const result = await db.query(query, [userId, exerciseId]);
    return result.rows; // Retorna todos los intentos
  }

  static async getUserAttemptInfo(userId, exerciseId) {
    const query = `
      SELECT 
        COUNT(*) as total_attempts,
        MAX(attempt_number) as last_attempt,
        3 - COUNT(*) as remaining_attempts,
        bool_or(is_correct) as has_completed,
        can_attempt_exercise($1, $2) as can_attempt
      FROM exercise_attempts 
      WHERE user_id = $1 AND exercise_id = $2
    `;
    
    const result = await db.query(query, [userId, exerciseId]);
    const info = result.rows[0];
    
    // Si no hay intentos previos, asignar valores por defecto
    if (info.total_attempts === '0') {
      return {
        total_attempts: 0,
        last_attempt: 0,
        remaining_attempts: 3,
        has_completed: false,
        can_attempt: true
      };
    }
    
    return {
      total_attempts: parseInt(info.total_attempts),
      last_attempt: parseInt(info.last_attempt),
      remaining_attempts: Math.max(0, parseInt(info.remaining_attempts)),
      has_completed: info.has_completed,
      can_attempt: info.can_attempt
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