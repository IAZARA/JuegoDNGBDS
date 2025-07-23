const express = require('express');
const exercisesController = require('../controllers/exercises.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authMiddleware);

// Obtener todos los ejercicios con progreso del usuario
router.get('/', exercisesController.getAllExercises);

// Obtener ejercicios por nivel
router.get('/level/:level', exercisesController.getExercisesByLevel);

// Obtener ejercicio específico
router.get('/:id', exercisesController.getExerciseById);

// Enviar respuesta a un ejercicio
router.post('/:id/submit', exercisesController.submitAnswer);

// Obtener pista para un ejercicio
router.get('/:id/hint', exercisesController.getHint);

// Obtener progreso del usuario
router.get('/user/progress', exercisesController.getUserProgress);

// Obtener información de intentos para un ejercicio específico
router.get('/:id/attempts', exercisesController.getExerciseAttempts);

// Obtener solución de un ejercicio (para ejercicios fallidos/completados)
router.get('/:id/solution', exercisesController.getSolution);

module.exports = router;