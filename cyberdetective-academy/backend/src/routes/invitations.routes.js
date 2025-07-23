const express = require('express');
const invitationsController = require('../controllers/invitations.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All invitation routes require authentication
router.use(authMiddleware);

// User invitations
router.get('/', invitationsController.getMyInvitations);
router.post('/:invitationId/respond', invitationsController.respondToInvitation);

// Team invitations (for leaders)
router.get('/team/:teamId', invitationsController.getTeamInvitations);
router.delete('/:invitationId', invitationsController.cancelInvitation);

module.exports = router;