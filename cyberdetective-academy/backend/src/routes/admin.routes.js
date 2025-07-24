const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');

// Login de admin (sin autenticación)
router.post('/login', adminController.login);

// Rutas protegidas - requieren autenticación de admin
router.get('/stats', adminAuth, adminController.getGameStats);
router.get('/presenter-guide', adminAuth, adminController.getPresenterGuide);
router.post('/reset-game', adminAuth, adminController.resetAllGame);
router.post('/generate-reset-link', adminAuth, adminController.generateResetLink);
router.post('/toggle-teams', adminAuth, adminController.toggleTeams);
router.get('/teams-status', adminAuth, adminController.getTeamsStatus);

// Reinicio vía link (no requiere autenticación, el token es la autenticación)
router.post('/reset-via-link/:token', adminController.resetViaLink);

module.exports = router;