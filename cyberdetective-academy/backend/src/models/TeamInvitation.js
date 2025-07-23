const db = require('../db/connection');

class TeamInvitation {
  static async create({ teamId, invitedUserId, invitedById, message }) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if user is already in a team
      const userTeamCheck = await client.query(
        'SELECT team_id FROM team_members WHERE user_id = $1',
        [invitedUserId]
      );
      
      if (userTeamCheck.rows.length > 0) {
        throw new Error('User is already in a team');
      }
      
      // Check if team has space
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
      
      // Check if invitation already exists
      const existingInvitation = await client.query(
        'SELECT id FROM team_invitations WHERE team_id = $1 AND invited_user_id = $2 AND status = $3',
        [teamId, invitedUserId, 'pending']
      );
      
      if (existingInvitation.rows.length > 0) {
        throw new Error('Invitation already exists');
      }
      
      // Create invitation
      const query = `
        INSERT INTO team_invitations (team_id, invited_user_id, invited_by_id, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id, team_id, invited_user_id, invited_by_id, status, message, created_at, expires_at
      `;
      
      const result = await client.query(query, [teamId, invitedUserId, invitedById, message]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async getByUserId(userId) {
    const query = `
      SELECT 
        ti.*,
        t.name as team_name,
        t.description as team_description,
        t.current_members,
        t.max_members,
        t.total_points,
        u_inviter.username as inviter_username,
        u_leader.username as leader_username
      FROM team_invitations ti
      JOIN teams t ON ti.team_id = t.id
      JOIN users u_inviter ON ti.invited_by_id = u_inviter.id
      LEFT JOIN users u_leader ON t.leader_id = u_leader.id
      WHERE ti.invited_user_id = $1 
        AND ti.status = 'pending'
        AND ti.expires_at > CURRENT_TIMESTAMP
        AND t.is_active = true
      ORDER BY ti.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
  
  static async respond(invitationId, userId, response) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get invitation details
      const invitationQuery = `
        SELECT ti.*, t.current_members, t.max_members
        FROM team_invitations ti
        JOIN teams t ON ti.team_id = t.id
        WHERE ti.id = $1 AND ti.invited_user_id = $2 AND ti.status = 'pending'
      `;
      
      const invitationResult = await client.query(invitationQuery, [invitationId, userId]);
      
      if (!invitationResult.rows[0]) {
        throw new Error('Invitation not found or already responded');
      }
      
      const invitation = invitationResult.rows[0];
      
      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        await client.query(
          'UPDATE team_invitations SET status = $1 WHERE id = $2',
          ['expired', invitationId]
        );
        throw new Error('Invitation has expired');
      }
      
      if (response === 'accepted') {
        // Check if user is already in a team
        const userTeamCheck = await client.query(
          'SELECT team_id FROM team_members WHERE user_id = $1',
          [userId]
        );
        
        if (userTeamCheck.rows.length > 0) {
          throw new Error('User is already in a team');
        }
        
        // Check team capacity
        if (invitation.current_members >= invitation.max_members) {
          throw new Error('Team is full');
        }
        
        // Add user to team
        await client.query(
          'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
          [invitation.team_id, userId, 'member']
        );
      }
      
      // Update invitation status
      await client.query(
        'UPDATE team_invitations SET status = $1 WHERE id = $2',
        [response, invitationId]
      );
      
      await client.query('COMMIT');
      return { success: true, status: response };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async expireOldInvitations() {
    const query = `
      UPDATE team_invitations 
      SET status = 'expired'
      WHERE status = 'pending' AND expires_at < CURRENT_TIMESTAMP
      RETURNING id
    `;
    
    const result = await db.query(query);
    return result.rows.length;
  }
  
  static async getTeamInvitations(teamId) {
    const query = `
      SELECT 
        ti.*,
        u.username as invited_username,
        u.full_name as invited_full_name
      FROM team_invitations ti
      JOIN users u ON ti.invited_user_id = u.id
      WHERE ti.team_id = $1 AND ti.status = 'pending'
      ORDER BY ti.created_at DESC
    `;
    
    const result = await db.query(query, [teamId]);
    return result.rows;
  }
  
  static async cancelInvitation(invitationId, teamId, canceledById) {
    const query = `
      UPDATE team_invitations 
      SET status = 'expired'
      WHERE id = $1 AND team_id = $2 AND invited_by_id = $3 AND status = 'pending'
      RETURNING id
    `;
    
    const result = await db.query(query, [invitationId, teamId, canceledById]);
    return result.rows[0];
  }
}

module.exports = TeamInvitation;