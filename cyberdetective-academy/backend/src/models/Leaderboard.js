const db = require('../db/connection');

class Leaderboard {
  static async updateUserRanking(userId) {
    try {
      // Primero actualizar o insertar el registro del usuario en leaderboard
      const upsertQuery = `
        INSERT INTO leaderboard (user_id, total_points, exercises_completed, average_time)
        SELECT 
          u.id,
          u.total_points,
          COUNT(ea.id) FILTER (WHERE ea.is_correct = true),
          AVG(ea.time_taken) FILTER (WHERE ea.is_correct = true)
        FROM users u
        LEFT JOIN exercise_attempts ea ON u.id = ea.user_id
        WHERE u.id = $1
        GROUP BY u.id
        ON CONFLICT (user_id) 
        DO UPDATE SET
          total_points = EXCLUDED.total_points,
          exercises_completed = EXCLUDED.exercises_completed,
          average_time = EXCLUDED.average_time,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      await db.query(upsertQuery, [userId]);
      
      // Actualizar rankings de todos los usuarios
      const updateRankQuery = `
        WITH ranked_users AS (
          SELECT 
            user_id,
            RANK() OVER (ORDER BY total_points DESC, exercises_completed DESC, average_time ASC) as new_rank
          FROM leaderboard
        )
        UPDATE leaderboard l
        SET rank = ru.new_rank
        FROM ranked_users ru
        WHERE l.user_id = ru.user_id
      `;
      
      await db.query(updateRankQuery);
      
    } catch (error) {
      console.error('Error actualizando ranking:', error);
      throw error;
    }
  }
  
  static async getTopUsers(limit = 10) {
    const query = `
      SELECT 
        l.rank,
        l.total_points,
        l.exercises_completed,
        l.average_time,
        u.username,
        u.avatar_url,
        u.level,
        u.created_at as member_since,
        (
          SELECT COUNT(*)
          FROM user_badges ub
          WHERE ub.user_id = u.id
        ) as badges_count
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.rank ASC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  }
  
  static async getUserRanking(userId) {
    const query = `
      SELECT 
        l.rank,
        l.total_points,
        l.exercises_completed,
        l.average_time,
        u.username,
        u.level,
        (
          SELECT COUNT(*)
          FROM user_badges ub
          WHERE ub.user_id = u.id
        ) as badges_count,
        (
          SELECT COUNT(*)
          FROM leaderboard
        ) as total_users
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE l.user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
  
  static async getAroundUser(userId, range = 2) {
    const userRank = await this.getUserRanking(userId);
    if (!userRank) return [];
    
    const query = `
      SELECT 
        l.rank,
        l.total_points,
        l.exercises_completed,
        l.average_time,
        u.id,
        u.username,
        u.avatar_url,
        u.level,
        (
          SELECT COUNT(*)
          FROM user_badges ub
          WHERE ub.user_id = u.id
        ) as badges_count
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE l.rank BETWEEN $1 AND $2
      ORDER BY l.rank ASC
    `;
    
    const fromRank = Math.max(1, userRank.rank - range);
    const toRank = userRank.rank + range;
    
    const result = await db.query(query, [fromRank, toRank]);
    return result.rows;
  }
  
  static async getStats() {
    const query = `
      SELECT 
        COUNT(DISTINCT l.user_id) as total_users,
        SUM(l.exercises_completed) as total_exercises_completed,
        AVG(l.total_points) as average_points,
        MAX(l.total_points) as highest_score,
        AVG(l.average_time) as global_average_time
      FROM leaderboard l
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = Leaderboard;