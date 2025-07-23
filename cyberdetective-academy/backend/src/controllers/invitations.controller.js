const TeamInvitation = require('../models/TeamInvitation');

const invitationsController = {
  async getMyInvitations(req, res) {
    try {
      const userId = req.user.userId;
      
      const invitations = await TeamInvitation.getByUserId(userId);
      
      res.json({
        invitations
      });
      
    } catch (error) {
      console.error('Error obteniendo invitaciones:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async respondToInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const { response } = req.body;
      const userId = req.user.userId;
      
      if (!response || !['accepted', 'rejected'].includes(response)) {
        return res.status(400).json({ 
          message: 'Respuesta debe ser "accepted" o "rejected"' 
        });
      }
      
      const result = await TeamInvitation.respond(
        parseInt(invitationId), 
        userId, 
        response
      );
      
      const message = response === 'accepted' 
        ? 'Te has unido al equipo exitosamente'
        : 'Invitación rechazada';
      
      res.json({
        message,
        status: result.status
      });
      
    } catch (error) {
      console.error('Error respondiendo invitación:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ 
          message: 'Invitación no encontrada o ya respondida' 
        });
      }
      if (error.message.includes('expired')) {
        return res.status(400).json({ 
          message: 'La invitación ha expirado' 
        });
      }
      if (error.message.includes('already in a team')) {
        return res.status(400).json({ 
          message: 'Ya perteneces a un equipo' 
        });
      }
      if (error.message.includes('Team is full')) {
        return res.status(400).json({ 
          message: 'El equipo está lleno' 
        });
      }
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async getTeamInvitations(req, res) {
    try {
      const { teamId } = req.params;
      const userId = req.user.userId;
      
      // Check if user is team leader
      const Team = require('../models/Team');
      const team = await Team.findById(teamId);
      if (!team || team.leader_id !== userId) {
        return res.status(403).json({ 
          message: 'Solo el líder puede ver las invitaciones del equipo' 
        });
      }
      
      const invitations = await TeamInvitation.getTeamInvitations(parseInt(teamId));
      
      res.json({
        invitations
      });
      
    } catch (error) {
      console.error('Error obteniendo invitaciones del equipo:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async cancelInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const { teamId } = req.body;
      const userId = req.user.userId;
      
      if (!teamId) {
        return res.status(400).json({ 
          message: 'ID del equipo es requerido' 
        });
      }
      
      const result = await TeamInvitation.cancelInvitation(
        parseInt(invitationId),
        parseInt(teamId),
        userId
      );
      
      if (!result) {
        return res.status(404).json({ 
          message: 'Invitación no encontrada o no autorizada' 
        });
      }
      
      res.json({
        message: 'Invitación cancelada exitosamente'
      });
      
    } catch (error) {
      console.error('Error cancelando invitación:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = invitationsController;