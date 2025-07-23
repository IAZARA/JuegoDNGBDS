const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: 'Rutas de usuarios - próximamente' });
});

module.exports = router;