const Exercise = require('../models/Exercise');
const ExerciseAttempt = require('../models/ExerciseAttempt');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const Team = require('../models/Team');

const exercisesController = {
  // Método helper para calcular multiplicador de puntos según intento
  getAttemptMultiplier(attemptNumber) {
    switch (attemptNumber) {
      case 1: return 1.0;    // 100%
      case 2: return 0.75;   // 75%
      case 3: return 0.50;   // 50%
      default: return 0;     // 0% para intentos adicionales
    }
  },
  async getAllExercises(req, res) {
    try {
      const exercises = await Exercise.findAll();
      const userAttempts = await ExerciseAttempt.findByUser(req.user.userId);
      
      const exercisesWithProgress = await Promise.all(exercises.map(async (exercise) => {
        const attempt = userAttempts.find(a => a.exercise_id === exercise.id);
        const attemptInfo = await ExerciseAttempt.getUserAttemptInfo(req.user.userId, exercise.id);
        const isCompleted = attempt ? attempt.is_correct : false;
        const isFailed = !isCompleted && !attemptInfo.can_attempt && attemptInfo.total_attempts > 0;
        
        return {
          ...exercise,
          completed: isCompleted,
          failed: isFailed,
          points_earned: attempt ? attempt.points_earned : 0,
          time_taken: attempt ? attempt.time_taken : null,
          user_answer: attempt ? attempt.answer_submitted : null
        };
      }));
      
      res.json({ exercises: exercisesWithProgress });
    } catch (error) {
      console.error('Error obteniendo ejercicios:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getExerciseById(req, res) {
    try {
      const { id } = req.params;
      const exercise = await Exercise.findById(id);
      
      if (!exercise) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }

      const attempts = await ExerciseAttempt.findByUserAndExercise(req.user.userId, id);
      const attemptInfo = await ExerciseAttempt.getUserAttemptInfo(req.user.userId, id);
      const lastAttempt = attempts.length > 0 ? attempts[0] : null;
      
      const isCompleted = attemptInfo.has_completed;
      const isFailed = !isCompleted && !attemptInfo.can_attempt && attemptInfo.total_attempts > 0;
      
      const exerciseData = {
        id: exercise.id,
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        points: exercise.points,
        category: exercise.category,
        type: exercise.type,
        problem_data: exercise.problem_data,
        hints: exercise.hints,
        time_limit: exercise.time_limit,
        completed: isCompleted,
        failed: isFailed,
        points_earned: lastAttempt ? lastAttempt.points_earned : 0,
        time_taken: lastAttempt ? lastAttempt.time_taken : null,
        user_answer: lastAttempt ? lastAttempt.answer_submitted : null,
        attempt_info: {
          total_attempts: attemptInfo.total_attempts,
          remaining_attempts: attemptInfo.remaining_attempts,
          can_attempt: attemptInfo.can_attempt,
          max_attempts: 3
        },
        all_attempts: attempts
      };

      res.json({ exercise: exerciseData });
    } catch (error) {
      console.error('Error obteniendo ejercicio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async submitAnswer(req, res) {
    try {
      const { id } = req.params;
      const { answer, timeTaken, hintsUsed = 0 } = req.body;
      
      if (!answer) {
        return res.status(400).json({ message: 'Respuesta requerida' });
      }

      const exercise = await Exercise.findById(id);
      if (!exercise) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }

      // Verificar información de intentos
      const attemptInfo = await ExerciseAttempt.getUserAttemptInfo(req.user.userId, id);
      
      if (!attemptInfo.can_attempt) {
        return res.status(400).json({ 
          message: attemptInfo.has_completed 
            ? 'Ya completaste este ejercicio correctamente'
            : 'Ya no tienes más intentos disponibles para este ejercicio'
        });
      }

      // Verificar si es timeout
      const isTimeout = answer === 'TIEMPO_AGOTADO';
      
      let validation;
      if (isTimeout) {
        // Si es timeout, obtener la respuesta correcta pero marcar como incorrecto
        validation = await Exercise.validateAnswer(id, '');
        validation.isCorrect = false;
      } else {
        validation = await Exercise.validateAnswer(id, answer);
      }
      
      const nextAttemptNumber = attemptInfo.total_attempts + 1;
      
      let pointsEarned = 0;
      if (validation.isCorrect && !isTimeout) {
        // Calcular puntos base según el número de intento
        const basePoints = Math.round(exercise.points * exercisesController.getAttemptMultiplier(nextAttemptNumber));
        pointsEarned = basePoints;
        
        // Penalizar por usar pistas
        if (hintsUsed > 0) {
          pointsEarned = Math.max(pointsEarned - (hintsUsed * 2), Math.floor(basePoints * 0.5));
        }
        
        // Bonus por velocidad (si completó en menos del 50% del tiempo límite)
        if (exercise.time_limit && timeTaken < (exercise.time_limit * 0.5)) {
          pointsEarned += Math.floor(basePoints * 0.2);
        }
      }

      const attempt = await ExerciseAttempt.create({
        userId: req.user.userId,
        exerciseId: id,
        isCorrect: validation.isCorrect,
        pointsEarned,
        timeTaken,
        hintsUsed,
        answerSubmitted: answer
      });

      if (validation.isCorrect) {
        // Verificar si el usuario está en un equipo
        const userTeam = await Team.findByUserId(req.user.userId);
        
        if (userTeam) {
          // Si está en un equipo, sumar puntos al equipo
          await Team.updatePoints(userTeam.id, pointsEarned);
          
          // Emitir actualización de ranking de equipos si io está disponible
          if (req.app.locals.io) {
            req.app.locals.io.emit('teamRankingUpdated', {
              teamId: userTeam.id,
              teamName: userTeam.name,
              points: userTeam.total_points + pointsEarned
            });
          }
        } else {
          // Si no está en equipo, funcionalidad normal (sumar al usuario)
          const updatedUser = await User.updatePoints(req.user.userId, pointsEarned);
          
          // Actualizar ranking en la base de datos
          await Leaderboard.updateUserRanking(req.user.userId);
          
          // Emitir actualización de ranking en tiempo real si io está disponible
          if (req.app.locals.io) {
            req.app.locals.io.emit('rankingUpdated', {
              userId: req.user.userId,
              points: updatedUser.total_points,
              level: updatedUser.level
            });
          }
        }
      }

      // Obtener información actualizada de intentos
      const updatedAttemptInfo = await ExerciseAttempt.getUserAttemptInfo(req.user.userId, id);
      
      // Verificar si el usuario está en un equipo para mostrar mensaje apropiado
      const userTeam = await Team.findByUserId(req.user.userId);
      
      res.json({
        correct: validation.isCorrect,
        points_earned: pointsEarned,
        explanation: isTimeout 
          ? 'Se agotó el tiempo. La respuesta correcta se muestra a continuación.' 
          : validation.explanation,
        correct_answer: validation.isCorrect ? undefined : validation.correctAnswer,
        is_timeout: isTimeout,
        attempt_id: attempt.id,
        team_info: userTeam ? {
          team_name: userTeam.name,
          points_added_to_team: validation.isCorrect
        } : null,
        attempt_info: {
          attempt_number: nextAttemptNumber,
          total_attempts: updatedAttemptInfo.total_attempts,
          remaining_attempts: updatedAttemptInfo.remaining_attempts,
          can_attempt: updatedAttemptInfo.can_attempt,
          max_attempts: 3,
          points_multiplier: exercisesController.getAttemptMultiplier(nextAttemptNumber)
        }
      });

    } catch (error) {
      console.error('Error enviando respuesta:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getHint(req, res) {
    try {
      const { id } = req.params;
      const { hintIndex } = req.query;
      
      const exercise = await Exercise.findById(id);
      if (!exercise) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }

      const hints = exercise.hints || [];
      const index = parseInt(hintIndex) || 0;
      
      if (index >= hints.length) {
        return res.status(404).json({ message: 'Pista no disponible' });
      }

      res.json({
        hint: hints[index],
        hint_index: index,
        total_hints: hints.length,
        points_penalty: 2
      });

    } catch (error) {
      console.error('Error obteniendo pista:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getUserProgress(req, res) {
    try {
      const progress = await ExerciseAttempt.getUserProgress(req.user.userId);
      const userAttempts = await ExerciseAttempt.findByUser(req.user.userId);
      const allExercises = await Exercise.findAll();
      
      const difficultyProgress = {
        1: { completed: 0, total: 0 },
        2: { completed: 0, total: 0 },
        3: { completed: 0, total: 0 },
        4: { completed: 0, total: 0 },
        5: { completed: 0, total: 0 }
      };

      // Contar el total de ejercicios por dificultad
      allExercises.forEach(exercise => {
        difficultyProgress[exercise.difficulty].total++;
      });

      // Contar los completados por el usuario
      userAttempts.forEach(attempt => {
        if (attempt.is_correct) {
          difficultyProgress[attempt.difficulty].completed++;
        }
      });

      res.json({
        total_exercises: allExercises.length,
        completed_exercises: parseInt(progress.completed) || 0,
        total_points: parseInt(progress.total_points) || 0,
        average_time: parseFloat(progress.avg_time) || 0,
        difficulty_progress: difficultyProgress,
        recent_attempts: userAttempts.slice(0, 5)
      });

    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getExercisesByLevel(req, res) {
    try {
      const { level } = req.params;
      const exercises = await Exercise.findByDifficulty(parseInt(level));
      const userAttempts = await ExerciseAttempt.findByUser(req.user.userId);
      
      const exercisesWithProgress = exercises.map(exercise => {
        const attempt = userAttempts.find(a => a.exercise_id === exercise.id);
        return {
          ...exercise,
          completed: attempt ? attempt.is_correct : false,
          points_earned: attempt ? attempt.points_earned : 0,
          time_taken: attempt ? attempt.time_taken : null
        };
      });
      
      res.json({ exercises: exercisesWithProgress });
    } catch (error) {
      console.error('Error obteniendo ejercicios por dificultad:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getExercisesByDifficulty(req, res) {
    try {
      const { difficulty } = req.params;
      const exercises = await Exercise.findByDifficulty(parseInt(difficulty));
      const userAttempts = await ExerciseAttempt.findByUser(req.user.userId);
      
      const exercisesWithProgress = exercises.map(exercise => {
        const attempt = userAttempts.find(a => a.exercise_id === exercise.id);
        return {
          ...exercise,
          completed: attempt ? attempt.is_correct : false,
          points_earned: attempt ? attempt.points_earned : 0,
          time_taken: attempt ? attempt.time_taken : null
        };
      });
      
      res.json({ exercises: exercisesWithProgress });
    } catch (error) {
      console.error('Error obteniendo ejercicios por dificultad:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getExerciseAttempts(req, res) {
    try {
      const { id } = req.params;
      const attempts = await ExerciseAttempt.findByUserAndExercise(req.user.userId, id);
      const attemptInfo = await ExerciseAttempt.getUserAttemptInfo(req.user.userId, id);
      
      res.json({
        attempts,
        attempt_info: attemptInfo
      });
    } catch (error) {
      console.error('Error obteniendo intentos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getSolution(req, res) {
    try {
      const { id } = req.params;
      
      const exercise = await Exercise.findById(id);
      if (!exercise) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }

      // Verificar que el usuario tenga permitido ver la solución
      const attemptInfo = await ExerciseAttempt.getUserAttemptInfo(req.user.userId, id);
      
      // Solo permitir ver la solución si el ejercicio está completado O ya no tiene más intentos
      if (!attemptInfo.has_completed && attemptInfo.can_attempt) {
        return res.status(403).json({ message: 'No puedes ver la solución aún' });
      }

      const solutionData = exercise.solution_data || {};
      
      res.json({
        correct_answer: solutionData.correct_answer,
        explanation: solutionData.explanation,
        reasoning: solutionData.reasoning
      });
    } catch (error) {
      console.error('Error obteniendo solución:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = exercisesController;