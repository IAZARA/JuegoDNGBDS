const express = require('express');
const teamsController = require('../controllers/teams.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes (no authentication required)
router.get('/ranking', teamsController.getTeamRanking);
router.get('/search', teamsController.searchTeams);

// Protected routes (authentication required)
router.use(authMiddleware);

// Team management
router.post('/', teamsController.createTeam);
router.get('/my-team', teamsController.getMyTeam);
router.get('/:teamId', teamsController.getTeam);
router.put('/:teamId', teamsController.updateTeam);

// Member management
router.post('/:teamId/invite', teamsController.inviteMember);
router.delete('/:teamId/members/:memberId', teamsController.removeMember);

// Team exercises
router.get('/:teamId/exercises', teamsController.getTeamExercises);
router.post('/:teamId/exercises/:exerciseId/start', teamsController.startTeamExercise);
router.get('/:teamId/exercises/:exerciseId/attempt', teamsController.getTeamAttempt);
router.post('/attempts/:attemptId/submit', teamsController.submitTeamAnswer);

module.exports = router;