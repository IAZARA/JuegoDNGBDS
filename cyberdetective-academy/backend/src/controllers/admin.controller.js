const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/connection');

const adminController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          message: 'Usuario y contraseña son requeridos' 
        });
      }
      
      const result = await db.query(
        'SELECT * FROM admins WHERE username = $1',
        [username]
      );
      
      const admin = result.rows[0];
      if (!admin) {
        return res.status(401).json({ 
          message: 'Credenciales inválidas' 
        });
      }
      
      const validPassword = await bcrypt.compare(password, admin.password_hash);
      if (!validPassword) {
        return res.status(401).json({ 
          message: 'Credenciales inválidas' 
        });
      }
      
      const token = jwt.sign(
        { 
          adminId: admin.id, 
          username: admin.username,
          isSuperAdmin: admin.is_super_admin,
          type: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      
      res.json({
        message: 'Login exitoso',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          isSuperAdmin: admin.is_super_admin
        }
      });
      
    } catch (error) {
      console.error('Error en login admin:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async resetAllGame(req, res) {
    try {
      const adminId = req.admin.adminId;
      
      // Iniciar transacción
      await db.query('BEGIN');
      
      try {
        // 1. Eliminar todos los intentos de ejercicios individuales
        await db.query('DELETE FROM exercise_attempts');
        
        // 2. Eliminar todos los intentos de ejercicios de equipo
        await db.query('DELETE FROM team_exercise_attempts');
        
        // 3. Resetear puntos de todos los usuarios
        await db.query('UPDATE users SET total_points = 0');
        
        // 4. Resetear puntos de todos los equipos
        await db.query('UPDATE teams SET total_points = 0');
        
        // 5. Actualizar estado del juego
        await db.query(`
          UPDATE game_state 
          SET reset_count = reset_count + 1,
              last_reset_at = CURRENT_TIMESTAMP,
              last_reset_by = $1,
              updated_at = CURRENT_TIMESTAMP
        `, [adminId]);
        
        // 6. Opcionalmente: Limpiar invitaciones pendientes
        await db.query('DELETE FROM team_invitations WHERE status = $1', ['pending']);
        
        await db.query('COMMIT');
        
        // Emitir evento Socket.io para notificar a todos
        const io = req.app.get('io');
        if (io) {
          io.emit('globalGameReset', {
            message: 'El juego ha sido reiniciado por el administrador',
            timestamp: new Date()
          });
        }
        
        res.json({
          message: 'Juego reiniciado exitosamente',
          stats: {
            usersReset: true,
            teamsReset: true,
            exercisesCleared: true,
            timestamp: new Date()
          }
        });
        
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      console.error('Error reiniciando juego:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async generateResetLink(req, res) {
    try {
      const adminId = req.admin.adminId;
      const { expirationMinutes = 60 } = req.body;
      
      // Generar token único
      const token = crypto.randomBytes(32).toString('hex');
      const expiration = new Date(Date.now() + expirationMinutes * 60 * 1000);
      
      // Guardar token en BD
      await db.query(`
        INSERT INTO game_reset_tokens (token, admin_id, expires_at)
        VALUES ($1, $2, $3)
      `, [token, adminId, expiration]);
      
      // Generar link
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${baseUrl}/admin/reset-game/${token}`;
      
      res.json({
        message: 'Link de reinicio generado',
        resetLink,
        expiresAt: expiration,
        expiresIn: `${expirationMinutes} minutos`
      });
      
    } catch (error) {
      console.error('Error generando link:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async resetViaLink(req, res) {
    try {
      const { token } = req.params;
      
      // Verificar token
      const result = await db.query(`
        SELECT grt.*, a.username 
        FROM game_reset_tokens grt
        JOIN admins a ON grt.admin_id = a.id
        WHERE grt.token = $1 
          AND grt.expires_at > NOW()
          AND grt.used = false
      `, [token]);
      
      if (result.rows.length === 0) {
        return res.status(400).json({ 
          message: 'Link inválido o expirado' 
        });
      }
      
      const tokenData = result.rows[0];
      
      // Iniciar transacción
      await db.query('BEGIN');
      
      try {
        // Marcar token como usado
        await db.query(
          'UPDATE game_reset_tokens SET used = true WHERE id = $1',
          [tokenData.id]
        );
        
        // Ejecutar reinicio (mismo código que resetAllGame)
        await db.query('DELETE FROM exercise_attempts');
        await db.query('DELETE FROM team_exercise_attempts');
        await db.query('UPDATE users SET total_points = 0');
        await db.query('UPDATE teams SET total_points = 0');
        
        await db.query(`
          UPDATE game_state 
          SET reset_count = reset_count + 1,
              last_reset_at = CURRENT_TIMESTAMP,
              last_reset_by = $1,
              updated_at = CURRENT_TIMESTAMP
        `, [tokenData.admin_id]);
        
        await db.query('DELETE FROM team_invitations WHERE status = $1', ['pending']);
        
        await db.query('COMMIT');
        
        // Emitir evento Socket.io
        const io = req.app.get('io');
        if (io) {
          io.emit('globalGameReset', {
            message: 'El juego ha sido reiniciado por el administrador',
            resetBy: tokenData.username,
            timestamp: new Date()
          });
        }
        
        res.json({
          message: 'Juego reiniciado exitosamente vía link',
          resetBy: tokenData.username
        });
        
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      console.error('Error reiniciando via link:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async getGameStats(req, res) {
    try {
      // Obtener estadísticas generales del juego
      const stats = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM teams) as total_teams,
          (SELECT COUNT(*) FROM exercise_attempts) as total_attempts,
          (SELECT COUNT(DISTINCT user_id) FROM exercise_attempts) as active_users,
          (SELECT SUM(total_points) FROM users) as total_points_users,
          (SELECT SUM(total_points) FROM teams) as total_points_teams
      `);
      
      const gameState = await db.query('SELECT * FROM game_state LIMIT 1');
      
      res.json({
        stats: stats.rows[0],
        gameState: gameState.rows[0]
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async toggleTeams(req, res) {
    try {
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ 
          message: 'El parámetro "enabled" debe ser un booleano' 
        });
      }
      
      // Actualizar el estado de los equipos
      const result = await db.query(`
        UPDATE system_config 
        SET teams_enabled = $1
        WHERE id = 1
        RETURNING teams_enabled
      `, [enabled]);
      
      if (result.rows.length === 0) {
        return res.status(500).json({ 
          message: 'No se pudo actualizar el estado del juego' 
        });
      }
      
      // Emitir evento Socket.io para notificar a todos los clientes
      const io = req.app.get('io');
      if (io) {
        io.emit('teamsStatusChanged', {
          teamsEnabled: enabled,
          timestamp: new Date()
        });
      }
      
      res.json({
        message: enabled ? 'Equipos habilitados' : 'Equipos deshabilitados',
        teamsEnabled: result.rows[0].teams_enabled
      });
      
    } catch (error) {
      console.error('Error cambiando estado de equipos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getTeamsStatus(req, res) {
    try {
      const result = await db.query('SELECT teams_enabled FROM game_state LIMIT 1');
      
      if (result.rows.length === 0) {
        return res.status(500).json({ 
          message: 'No se encontró el estado del juego' 
        });
      }
      
      res.json({
        teamsEnabled: result.rows[0].teams_enabled
      });
      
    } catch (error) {
      console.error('Error obteniendo estado de equipos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 50, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      
      let query = `
        SELECT 
          u.id,
          u.username,
          u.email,
          u.full_name,
          u.avatar_url,
          u.total_points,
          u.level,
          u.created_at,
          u.updated_at,
          COUNT(ea.id) as exercises_completed,
          COALESCE(AVG(ea.time_taken), 0) as average_time,
          t.name as team_name,
          tm.role as team_role
        FROM users u
        LEFT JOIN exercise_attempts ea ON u.id = ea.user_id AND ea.is_correct = true
        LEFT JOIN team_members tm ON u.id = tm.user_id
        LEFT JOIN teams t ON tm.team_id = t.id AND t.is_active = true
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      // Filtro de búsqueda
      if (search) {
        query += ` AND (u.username ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      query += ` GROUP BY u.id, t.name, tm.role`;
      
      // Ordenamiento
      const validSortFields = ['username', 'email', 'total_points', 'level', 'created_at'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      query += ` ORDER BY u.${sortField} ${order}`;
      
      // Paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);
      
      const result = await db.query(query, params);
      
      // Obtener total de usuarios para paginación
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      const countParams = [];
      
      if (search) {
        countQuery += ` AND (username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1)`;
        countParams.push(`%${search}%`);
      }
      
      const countResult = await db.query(countQuery, countParams);
      const totalUsers = parseInt(countResult.rows[0].total);
      
      // Formatear datos
      const users = result.rows.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        totalPoints: user.total_points,
        level: user.level,
        exercisesCompleted: parseInt(user.exercises_completed),
        averageTime: parseFloat(user.average_time),
        teamName: user.team_name,
        teamRole: user.team_role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
      
      res.json({
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          usersPerPage: parseInt(limit)
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getPresenterGuide(req, res) {
    try {
      const { category, difficulty, search } = req.query;
      
      let query = `
        SELECT 
          id,
          title,
          description,
          difficulty,
          points,
          category,
          type,
          problem_data,
          solution_data,
          hints,
          time_limit,
          order_index,
          created_at
        FROM exercises 
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      // Filtros opcionales
      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      if (difficulty) {
        query += ` AND difficulty = $${paramIndex}`;
        params.push(parseInt(difficulty));
        paramIndex++;
      }
      
      if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      query += ` ORDER BY order_index ASC, id ASC`;
      
      const result = await db.query(query, params);
      
      // Formatear datos para el presentador
      const exercises = result.rows.map(exercise => ({
        id: exercise.id,
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        difficultyText: ['', 'Muy Fácil', 'Fácil', 'Medio', 'Difícil', 'Muy Difícil'][exercise.difficulty],
        points: exercise.points,
        category: exercise.category,
        type: exercise.type,
        timeLimit: exercise.time_limit,
        
        // Datos del problema (visible para jugadores)
        problemData: exercise.problem_data,
        
        // Datos de la solución (solo para presentador)
        correctAnswer: exercise.solution_data?.correct_answer || 'No especificada',
        explanation: exercise.solution_data?.explanation || 'Sin explicación disponible',
        alternativeAnswers: exercise.solution_data?.alternative_answers || [],
        
        // Pistas disponibles
        hints: exercise.hints || [],
        
        // Metadatos
        createdAt: exercise.created_at,
        orderIndex: exercise.order_index
      }));
      
      // Obtener estadísticas de uso
      const usageStats = await db.query(`
        SELECT 
          exercise_id,
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN is_correct = true THEN 1 END) as correct_attempts,
          ROUND(AVG(time_taken)) as avg_time_seconds,
          ROUND(
            COUNT(CASE WHEN is_correct = true THEN 1 END) * 100.0 / COUNT(*), 
            1
          ) as success_rate
        FROM exercise_attempts 
        WHERE exercise_id = ANY($1)
        GROUP BY exercise_id
      `, [exercises.map(e => e.id)]);
      
      // Agregar estadísticas a cada ejercicio
      const exercisesWithStats = exercises.map(exercise => {
        const stats = usageStats.rows.find(s => s.exercise_id === exercise.id);
        return {
          ...exercise,
          stats: stats ? {
            totalAttempts: parseInt(stats.total_attempts),
            correctAttempts: parseInt(stats.correct_attempts),
            avgTimeSeconds: stats.avg_time_seconds,
            successRate: parseFloat(stats.success_rate)
          } : {
            totalAttempts: 0,
            correctAttempts: 0,
            avgTimeSeconds: 0,
            successRate: 0
          }
        };
      });
      
      // Resumen por categorías
      const categories = await db.query(`
        SELECT 
          category,
          COUNT(*) as exercise_count,
          AVG(difficulty) as avg_difficulty,
          SUM(points) as total_points
        FROM exercises 
        GROUP BY category 
        ORDER BY category
      `);
      
      res.json({
        exercises: exercisesWithStats,
        summary: {
          totalExercises: exercises.length,
          categories: categories.rows.map(cat => ({
            name: cat.category,
            count: parseInt(cat.exercise_count),
            avgDifficulty: parseFloat(cat.avg_difficulty).toFixed(1),
            totalPoints: parseInt(cat.total_points)
          }))
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo guía del presentador:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ 
          message: 'ID de usuario inválido' 
        });
      }

      // Verificar que el usuario existe
      const userCheck = await db.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
      
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Usuario no encontrado' 
        });
      }

      const userToDelete = userCheck.rows[0];

      // Iniciar transacción para asegurar integridad
      await db.query('BEGIN');

      try {
        // Las foreign keys con CASCADE se encargarán automáticamente de:
        // - exercise_attempts
        // - team_members  
        // - team_invitations
        // - leaderboard
        // - user_badges

        // Eliminar el usuario (esto activará CASCADE deletes)
        await db.query('DELETE FROM users WHERE id = $1', [userId]);

        await db.query('COMMIT');

        console.log(`✅ Usuario eliminado: ${userToDelete.username} (${userToDelete.email})`);

        // Emitir evento Socket.io para notificar cambios
        const io = req.app.get('io');
        if (io) {
          io.emit('userDeleted', {
            userId: parseInt(userId),
            username: userToDelete.username,
            timestamp: new Date()
          });
        }

        res.json({
          message: `Usuario ${userToDelete.username} eliminado exitosamente`,
          deletedUser: {
            id: userToDelete.id,
            username: userToDelete.username,
            email: userToDelete.email
          }
        });

      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor al eliminar usuario' 
      });
    }
  }
};

module.exports = adminController;