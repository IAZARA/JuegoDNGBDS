const Team = require('../models/Team');
const TeamInvitation = require('../models/TeamInvitation');
const User = require('../models/User');
const TeamExerciseAttempt = require('../models/TeamExerciseAttempt');
const Exercise = require('../models/Exercise');
const db = require('../db/connection');

const teamsController = {
  async createTeam(req, res) {
    try {
      const { name, description } = req.body;
      const leaderId = req.user.userId;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ 
          message: 'El nombre del equipo es requerido' 
        });
      }
      
      if (name.length > 100) {
        return res.status(400).json({ 
          message: 'El nombre del equipo no puede tener más de 100 caracteres' 
        });
      }
      
      // Check if user is already in a team
      const existingTeam = await Team.findByUserId(leaderId);
      if (existingTeam) {
        return res.status(400).json({ 
          message: 'Ya perteneces a un equipo' 
        });
      }
      
      const team = await Team.create({ 
        name: name.trim(), 
        description: description?.trim(), 
        leaderId 
      });
      
      res.status(201).json({
        message: 'Equipo creado exitosamente',
        team
      });
      
    } catch (error) {
      console.error('Error creando equipo:', error);
      if (error.constraint === 'teams_name_key') {
        return res.status(400).json({ 
          message: 'Ya existe un equipo con ese nombre' 
        });
      }
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async getMyTeam(req, res) {
    try {
      const userId = req.user.userId;
      
      const team = await Team.findByUserId(userId);
      if (!team) {
        return res.status(404).json({ message: 'No perteneces a ningún equipo' });
      }
      
      const members = await Team.getMembers(team.id);
      
      res.json({
        team: {
          ...team,
          members
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo equipo:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async getTeam(req, res) {
    try {
      const { teamId } = req.params;
      
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      
      const members = await Team.getMembers(teamId);
      
      res.json({
        team: {
          ...team,
          members
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo equipo:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async inviteMember(req, res) {
    try {
      const { teamId } = req.params;
      const { username, message } = req.body;
      const inviterId = req.user.userId;
      
      if (!username || username.trim().length === 0) {
        return res.status(400).json({ 
          message: 'El username es requerido' 
        });
      }
      
      // Check if user is team leader
      const team = await Team.findById(teamId);
      if (!team || team.leader_id !== inviterId) {
        return res.status(403).json({ 
          message: 'Solo el líder puede invitar miembros' 
        });
      }
      
      // Find user to invite
      const userToInvite = await User.findByUsername(username.trim());
      if (!userToInvite) {
        return res.status(404).json({ 
          message: 'Usuario no encontrado' 
        });
      }
      
      // Don't allow self-invitation
      if (userToInvite.id === inviterId) {
        return res.status(400).json({ 
          message: 'No puedes invitarte a ti mismo' 
        });
      }
      
      const invitation = await TeamInvitation.create({
        teamId: parseInt(teamId),
        invitedUserId: userToInvite.id,
        invitedById: inviterId,
        message: message?.trim()
      });
      
      res.status(201).json({
        message: 'Invitación enviada exitosamente',
        invitation
      });
      
    } catch (error) {
      console.error('Error enviando invitación:', error);
      if (error.message.includes('already in a team')) {
        return res.status(400).json({ 
          message: 'El usuario ya pertenece a un equipo' 
        });
      }
      if (error.message.includes('Team is full')) {
        return res.status(400).json({ 
          message: 'El equipo está lleno' 
        });
      }
      if (error.message.includes('already exists')) {
        return res.status(400).json({ 
          message: 'Ya existe una invitación pendiente para este usuario' 
        });
      }
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async removeMember(req, res) {
    try {
      const { teamId, memberId } = req.params;
      const requesterId = req.user.userId;
      
      // Check if requester is team leader or removing themselves
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      
      const isLeader = team.leader_id === requesterId;
      const isRemovingSelf = parseInt(memberId) === requesterId;
      
      if (!isLeader && !isRemovingSelf) {
        return res.status(403).json({ 
          message: 'Solo el líder puede remover miembros o puedes abandonar el equipo' 
        });
      }
      
      const result = await Team.removeMember(parseInt(teamId), parseInt(memberId), isLeader);
      
      if (result.memberCount === 0) {
        return res.json({
          message: 'Equipo disuelto al no quedar miembros'
        });
      }
      
      res.json({
        message: isRemovingSelf ? 'Has abandonado el equipo' : 'Miembro removido exitosamente'
      });
      
    } catch (error) {
      console.error('Error removiendo miembro:', error);
      if (error.message.includes('not a team member')) {
        return res.status(400).json({ 
          message: 'El usuario no es miembro del equipo' 
        });
      }
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async updateTeam(req, res) {
    try {
      const { teamId } = req.params;
      const { name, description } = req.body;
      const userId = req.user.userId;
      
      // Check if user is team leader
      const team = await Team.findById(teamId);
      if (!team || team.leader_id !== userId) {
        return res.status(403).json({ 
          message: 'Solo el líder puede actualizar el equipo' 
        });
      }
      
      if (name && (name.trim().length === 0 || name.length > 100)) {
        return res.status(400).json({ 
          message: 'El nombre debe tener entre 1 y 100 caracteres' 
        });
      }
      
      const updatedTeam = await Team.updateTeam(parseInt(teamId), { 
        name: name?.trim(), 
        description: description?.trim() 
      });
      
      res.json({
        message: 'Equipo actualizado exitosamente',
        team: updatedTeam
      });
      
    } catch (error) {
      console.error('Error actualizando equipo:', error);
      if (error.constraint === 'teams_name_key') {
        return res.status(400).json({ 
          message: 'Ya existe un equipo con ese nombre' 
        });
      }
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async getTeamRanking(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      
      if (limit > 100) {
        return res.status(400).json({ 
          message: 'El límite máximo es 100' 
        });
      }
      
      const ranking = await Team.getTeamRanking(limit);
      
      res.json({
        ranking
      });
      
    } catch (error) {
      console.error('Error obteniendo ranking:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async searchTeams(req, res) {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit) || 10;
      
      if (!q || q.trim().length === 0) {
        return res.status(400).json({ 
          message: 'Término de búsqueda requerido' 
        });
      }
      
      if (limit > 50) {
        return res.status(400).json({ 
          message: 'El límite máximo es 50' 
        });
      }
      
      const teams = await Team.searchTeams(q.trim(), limit);
      
      res.json({
        teams
      });
      
    } catch (error) {
      console.error('Error buscando equipos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // Team Exercise Methods
  async getTeamExercises(req, res) {
    try {
      const { teamId } = req.params;
      const userId = req.user.userId;
      
      // Check if user is team member
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      
      const members = await Team.getMembers(teamId);
      const isMember = members.some(member => member.id === userId);
      
      if (!isMember) {
        return res.status(403).json({ 
          message: 'Solo los miembros del equipo pueden ver los ejercicios' 
        });
      }
      
      const exercises = await TeamExerciseAttempt.getAvailableExercises(teamId);
      
      res.json({
        exercises
      });
      
    } catch (error) {
      console.error('Error obteniendo ejercicios del equipo:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async startTeamExercise(req, res) {
    try {
      const { teamId, exerciseId } = req.params;
      const userId = req.user.userId;
      
      // Check if user is team member
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      
      const members = await Team.getMembers(teamId);
      const isMember = members.some(member => member.id === userId);
      
      if (!isMember) {
        return res.status(403).json({ 
          message: 'Solo los miembros del equipo pueden iniciar ejercicios' 
        });
      }
      
      // Check if exercise exists
      const exercise = await Exercise.findById(exerciseId);
      if (!exercise) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }
      
      // Check if team can attempt this exercise
      const canAttempt = await TeamExerciseAttempt.canTeamAttempt(teamId, exerciseId);
      if (!canAttempt) {
        return res.status(400).json({ 
          message: 'El equipo ya intentó este ejercicio' 
        });
      }
      
      const attempt = await TeamExerciseAttempt.create({
        teamId: parseInt(teamId),
        exerciseId: parseInt(exerciseId),
        startedById: userId
      });
      
      res.status(201).json({
        message: 'Ejercicio iniciado para el equipo',
        attempt
      });
      
    } catch (error) {
      console.error('Error iniciando ejercicio:', error);
      if (error.message.includes('already attempted')) {
        return res.status(400).json({ 
          message: 'El equipo ya intentó este ejercicio' 
        });
      }
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async submitTeamAnswer(req, res) {
    try {
      const { attemptId } = req.params;
      const { answer, timeTaken } = req.body;
      const userId = req.user.userId;
      
      if (!answer || answer.trim().length === 0) {
        return res.status(400).json({ 
          message: 'La respuesta es requerida' 
        });
      }
      
      // Get attempt details
      const attempt = await db.query(`
        SELECT tea.*, e.solution_data, e.points
        FROM team_exercise_attempts tea
        JOIN exercises e ON tea.exercise_id = e.id
        WHERE tea.id = $1
      `, [attemptId]);
      
      if (!attempt.rows[0]) {
        return res.status(404).json({ message: 'Intento no encontrado' });
      }
      
      const attemptData = attempt.rows[0];
      
      if (attemptData.is_completed) {
        return res.status(400).json({ 
          message: 'Este ejercicio ya fue completado' 
        });
      }
      
      // Check if user is team member
      const members = await Team.getMembers(attemptData.team_id);
      const isMember = members.some(member => member.id === userId);
      
      if (!isMember) {
        return res.status(403).json({ 
          message: 'Solo los miembros del equipo pueden enviar respuestas' 
        });
      }
      
      // Check answer
      const solutionData = attemptData.solution_data;
      const isCorrect = solutionData.correct_answer.toLowerCase().trim() === answer.toLowerCase().trim();
      
      const pointsEarned = isCorrect ? attemptData.points : 0;
      
      const completedAttempt = await TeamExerciseAttempt.submitAnswer({
        attemptId: parseInt(attemptId),
        finalAnswer: answer.trim(),
        pointsEarned,
        totalTime: timeTaken || null
      });
      
      res.json({
        message: isCorrect ? 'Respuesta correcta! Puntos otorgados al equipo' : 'Respuesta incorrecta',
        isCorrect,
        pointsEarned,
        attempt: completedAttempt
      });
      
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async getTeamAttempt(req, res) {
    try {
      const { teamId, exerciseId } = req.params;
      const userId = req.user.userId;
      
      // Check if user is team member
      const members = await Team.getMembers(teamId);
      const isMember = members.some(member => member.id === userId);
      
      if (!isMember) {
        return res.status(403).json({ 
          message: 'Solo los miembros del equipo pueden ver los intentos' 
        });
      }
      
      const attempt = await TeamExerciseAttempt.findByTeamAndExercise(
        parseInt(teamId), 
        parseInt(exerciseId)
      );
      
      if (!attempt) {
        return res.status(404).json({ message: 'Intento no encontrado' });
      }
      
      res.json({
        attempt
      });
      
    } catch (error) {
      console.error('Error obteniendo intento:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async resetTeamProgress(req, res) {
    try {
      const { teamId } = req.params;
      const userId = req.user.userId;
      
      // Check if user is team leader
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      
      if (team.leader_id !== userId) {
        return res.status(403).json({ 
          message: 'Solo el líder del equipo puede reiniciar el progreso' 
        });
      }
      
      // Delete all team exercise attempts
      await db.query('DELETE FROM team_exercise_attempts WHERE team_id = $1', [teamId]);
      
      // Reset team points
      await db.query('UPDATE teams SET total_points = 0 WHERE id = $1', [teamId]);
      
      // Emit socket event to notify team members
      const io = req.app.get('io');
      if (io) {
        io.to(`team-${teamId}`).emit('teamProgressReset', {
          teamId,
          message: 'El progreso del equipo ha sido reiniciado'
        });
      }
      
      res.json({
        message: 'Progreso del equipo reiniciado exitosamente',
        team: {
          id: team.id,
          name: team.name,
          points: 0
        }
      });
      
    } catch (error) {
      console.error('Error reiniciando progreso del equipo:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async generateResetLink(req, res) {
    try {
      const { teamId } = req.params;
      const userId = req.user.userId;
      
      // Check if user is team leader
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      
      if (team.leader_id !== userId) {
        return res.status(403).json({ 
          message: 'Solo el líder del equipo puede generar links de reinicio' 
        });
      }
      
      // Generate temporary token with expiration (30 minutes)
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      
      // Store token in database
      await db.query(`
        INSERT INTO team_reset_tokens (team_id, token, expires_at, created_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (team_id) 
        DO UPDATE SET token = $2, expires_at = $3, created_by = $4
      `, [teamId, token, expiration, userId]);
      
      // Generate link
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${baseUrl}/reset-team/${teamId}/${token}`;
      
      res.json({
        message: 'Link de reinicio generado exitosamente',
        resetLink,
        expiresAt: expiration,
        expiresIn: '30 minutos'
      });
      
    } catch (error) {
      console.error('Error generando link de reinicio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async resetViaLink(req, res) {
    try {
      const { teamId, token } = req.params;
      
      // Verify token
      const result = await db.query(`
        SELECT * FROM team_reset_tokens 
        WHERE team_id = $1 AND token = $2 AND expires_at > NOW()
      `, [teamId, token]);
      
      if (result.rows.length === 0) {
        return res.status(400).json({ 
          message: 'Link inválido o expirado' 
        });
      }
      
      // Delete all team exercise attempts
      await db.query('DELETE FROM team_exercise_attempts WHERE team_id = $1', [teamId]);
      
      // Reset team points
      await db.query('UPDATE teams SET total_points = 0 WHERE id = $1', [teamId]);
      
      // Delete used token
      await db.query('DELETE FROM team_reset_tokens WHERE team_id = $1', [teamId]);
      
      // Emit socket event to notify team members
      const io = req.app.get('io');
      if (io) {
        io.to(`team-${teamId}`).emit('teamProgressReset', {
          teamId,
          message: 'El progreso del equipo ha sido reiniciado'
        });
      }
      
      res.json({
        message: 'Progreso del equipo reiniciado exitosamente',
        teamId
      });
      
    } catch (error) {
      console.error('Error reiniciando via link:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = teamsController;