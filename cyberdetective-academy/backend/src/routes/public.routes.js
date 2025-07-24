const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Endpoint público para verificar si los equipos están habilitados
router.get('/teams-enabled', async (req, res) => {
  try {
    const result = await db.query('SELECT teams_enabled FROM game_state LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.json({ teamsEnabled: true }); // Por defecto habilitado
    }
    
    res.json({
      teamsEnabled: result.rows[0].teams_enabled
    });
    
  } catch (error) {
    console.error('Error obteniendo estado de equipos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;