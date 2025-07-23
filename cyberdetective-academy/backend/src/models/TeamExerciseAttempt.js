const db = require('../db/connection');

class TeamExerciseAttempt {
  static async create({ teamId, exerciseId, startedById }) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if team already attempted this exercise
      const existingQuery = 'SELECT id FROM team_exercise_attempts WHERE team_id = $1 AND exercise_id = $2';
      const existingResult = await client.query(existingQuery, [teamId, exerciseId]);
      
      if (existingResult.rows.length > 0) {
        throw new Error('Team has already attempted this exercise');
      }
      
      // Create team attempt
      const query = `
        INSERT INTO team_exercise_attempts (team_id, exercise_id, started_by_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await client.query(query, [teamId, exerciseId, startedById]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async findByTeamAndExercise(teamId, exerciseId) {
    const query = `
      SELECT tea.*, e.title, e.difficulty, e.points as max_points, e.time_limit
      FROM team_exercise_attempts tea
      JOIN exercises e ON tea.exercise_id = e.id
      WHERE tea.team_id = $1 AND tea.exercise_id = $2
    `;
    
    const result = await db.query(query, [teamId, exerciseId]);
    return result.rows[0];
  }
  
  static async findByTeam(teamId) {
    const query = `
      SELECT tea.*, e.title, e.difficulty, e.points as max_points
      FROM team_exercise_attempts tea
      JOIN exercises e ON tea.exercise_id = e.id
      WHERE tea.team_id = $1
      ORDER BY tea.started_at DESC
    `;
    
    const result = await db.query(query, [teamId]);
    return result.rows;
  }
  
  static async submitAnswer({ attemptId, finalAnswer, pointsEarned, totalTime }) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update team attempt
      const updateQuery = `
        UPDATE team_exercise_attempts 
        SET is_completed = true, 
            completed_at = CURRENT_TIMESTAMP,
            final_answer = $2,
            points_earned = $3,
            total_time = $4
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [attemptId, finalAnswer, pointsEarned, totalTime]);
      const attempt = result.rows[0];
      
      if (!attempt) {
        throw new Error('Team attempt not found');
      }
      
      // Update team points
      const updateTeamQuery = `
        UPDATE teams 
        SET total_points = total_points + $1
        WHERE id = $2
      `;
      
      await client.query(updateTeamQuery, [pointsEarned, attempt.team_id]);
      
      await client.query('COMMIT');
      return attempt;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async getTeamProgress(teamId) {
    const query = `
      SELECT 
        COUNT(*) as total_attempted,
        COUNT(*) FILTER (WHERE is_completed = true) as completed,
        SUM(points_earned) as total_points,
        AVG(total_time) FILTER (WHERE is_completed = true) as avg_time
      FROM team_exercise_attempts 
      WHERE team_id = $1
    `;
    
    const result = await db.query(query, [teamId]);
    return result.rows[0];
  }
  
  static async getAvailableExercises(teamId) {
    const query = `
      SELECT e.*, 
        CASE 
          WHEN tea.id IS NOT NULL THEN true 
          ELSE false 
        END as attempted,
        tea.is_completed,
        tea.points_earned
      FROM exercises e
      LEFT JOIN team_exercise_attempts tea ON e.id = tea.exercise_id AND tea.team_id = $1
      ORDER BY e.order_index ASC, e.id ASC
    `;
    
    const result = await db.query(query, [teamId]);
    return result.rows;
  }
  
  static async canTeamAttempt(teamId, exerciseId) {
    const query = `
      SELECT COUNT(*) as attempt_count
      FROM team_exercise_attempts 
      WHERE team_id = $1 AND exercise_id = $2
    `;
    
    const result = await db.query(query, [teamId, exerciseId]);
    return parseInt(result.rows[0].attempt_count) === 0;
  }
}

module.exports = TeamExerciseAttempt;