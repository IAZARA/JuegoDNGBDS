const db = require('../db/connection');

class Team {
  static async create({ name, description, leaderId }) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create team
      const teamQuery = `
        INSERT INTO teams (name, description, leader_id)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, leader_id, max_members, current_members, total_points, created_at
      `;
      const teamResult = await client.query(teamQuery, [name, description, leaderId]);
      const team = teamResult.rows[0];
      
      // Add leader as team member
      const memberQuery = `
        INSERT INTO team_members (team_id, user_id, role)
        VALUES ($1, $2, 'leader')
      `;
      await client.query(memberQuery, [team.id, leaderId]);
      
      await client.query('COMMIT');
      return team;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async findById(teamId) {
    const query = `
      SELECT t.*, u.username as leader_username
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.id = $1 AND t.is_active = true
    `;
    const result = await db.query(query, [teamId]);
    return result.rows[0];
  }
  
  static async findByUserId(userId) {
    const query = `
      SELECT t.*, u.username as leader_username
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE tm.user_id = $1 AND t.is_active = true
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
  
  static async getMembers(teamId) {
    const query = `
      SELECT tm.role, u.id, u.username, u.full_name, u.avatar_url, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.team_id = $1 AND t.is_active = true
      ORDER BY 
        CASE WHEN tm.role = 'leader' THEN 0 ELSE 1 END,
        tm.joined_at ASC
    `;
    const result = await db.query(query, [teamId]);
    return result.rows;
  }
  
  static async addMember(teamId, userId) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check team capacity
      const teamCheck = await client.query(
        'SELECT current_members, max_members FROM teams WHERE id = $1 AND is_active = true',
        [teamId]
      );
      
      if (!teamCheck.rows[0]) {
        throw new Error('Team not found or inactive');
      }
      
      const { current_members, max_members } = teamCheck.rows[0];
      if (current_members >= max_members) {
        throw new Error('Team is full');
      }
      
      // Add member
      const memberQuery = `
        INSERT INTO team_members (team_id, user_id, role)
        VALUES ($1, $2, 'member')
        RETURNING *
      `;
      const result = await client.query(memberQuery, [teamId, userId]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async removeMember(teamId, userId, removedByLeader = false) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if user is team leader
      const memberCheck = await client.query(
        'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
      );
      
      if (!memberCheck.rows[0]) {
        throw new Error('User is not a team member');
      }
      
      const isLeader = memberCheck.rows[0].role === 'leader';
      
      // Remove member
      await client.query(
        'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
      );
      
      // Check remaining members
      const remainingMembers = await client.query(
        'SELECT COUNT(*) as count FROM team_members WHERE team_id = $1',
        [teamId]
      );
      
      const memberCount = parseInt(remainingMembers.rows[0].count);
      
      if (memberCount === 0) {
        // Deactivate team if no members left
        await client.query(
          'UPDATE teams SET is_active = false WHERE id = $1',
          [teamId]
        );
      } else if (isLeader && memberCount > 0) {
        // Transfer leadership to oldest member
        const newLeader = await client.query(`
          SELECT user_id FROM team_members 
          WHERE team_id = $1 
          ORDER BY joined_at ASC 
          LIMIT 1
        `, [teamId]);
        
        if (newLeader.rows[0]) {
          await client.query(
            'UPDATE team_members SET role = $1 WHERE team_id = $2 AND user_id = $3',
            ['leader', teamId, newLeader.rows[0].user_id]
          );
          
          await client.query(
            'UPDATE teams SET leader_id = $1 WHERE id = $2',
            [newLeader.rows[0].user_id, teamId]
          );
        }
      }
      
      await client.query('COMMIT');
      return { success: true, memberCount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async updatePoints(teamId, points) {
    const query = `
      UPDATE teams 
      SET total_points = total_points + $2
      WHERE id = $1
      RETURNING total_points
    `;
    const result = await db.query(query, [teamId, points]);
    return result.rows[0];
  }
  
  static async getTeamRanking(limit = 20) {
    const query = `
      SELECT 
        t.id, t.name, t.total_points, t.current_members,
        u.username as leader_username,
        ROW_NUMBER() OVER (ORDER BY t.total_points DESC, t.created_at ASC) as rank
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.is_active = true
      ORDER BY t.total_points DESC, t.created_at ASC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }
  
  static async searchTeams(searchTerm, limit = 10) {
    const query = `
      SELECT 
        t.id, t.name, t.description, t.current_members, t.max_members, t.total_points,
        u.username as leader_username
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.is_active = true 
        AND (t.name ILIKE $1 OR t.description ILIKE $1)
        AND t.current_members < t.max_members
      ORDER BY t.total_points DESC
      LIMIT $2
    `;
    const result = await db.query(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  }
  
  static async updateTeam(teamId, { name, description }) {
    const query = `
      UPDATE teams 
      SET name = COALESCE($2, name), 
          description = COALESCE($3, description)
      WHERE id = $1 AND is_active = true
      RETURNING id, name, description, leader_id, current_members, max_members, total_points
    `;
    const result = await db.query(query, [teamId, name, description]);
    return result.rows[0];
  }
}

module.exports = Team;