const express = require('express');
const rankingsController = require('../controllers/rankings.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authMiddleware);

// Obtener leaderboard general
router.get('/', rankingsController.getLeaderboard);

// Obtener ranking del usuario actual
router.get('/me', rankingsController.getUserRanking);

// Obtener usuarios alrededor del usuario actual
router.get('/around-me', rankingsController.getUsersAroundMe);

// Obtener estadísticas globales
router.get('/stats', rankingsController.getStats);

// Actualizar ranking del usuario (normalmente se hace automáticamente)
router.post('/update', rankingsController.updateRanking);

module.exports = router;