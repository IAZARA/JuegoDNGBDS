const Leaderboard = require('../models/Leaderboard');

const rankingsController = {
  async getLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;
      const topUsers = await Leaderboard.getTopUsers(parseInt(limit));
      
      res.json({
        success: true,
        leaderboard: topUsers
      });
    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getUserRanking(req, res) {
    try {
      const userId = req.user.userId;
      const userRanking = await Leaderboard.getUserRanking(userId);
      
      if (!userRanking) {
        // Si el usuario no tiene ranking, actualizar primero
        await Leaderboard.updateUserRanking(userId);
        const newRanking = await Leaderboard.getUserRanking(userId);
        return res.json({
          success: true,
          ranking: newRanking
        });
      }
      
      res.json({
        success: true,
        ranking: userRanking
      });
    } catch (error) {
      console.error('Error obteniendo ranking del usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getUsersAroundMe(req, res) {
    try {
      const userId = req.user.userId;
      const { range = 3 } = req.query;
      
      const usersAround = await Leaderboard.getAroundUser(userId, parseInt(range));
      
      res.json({
        success: true,
        users: usersAround
      });
    } catch (error) {
      console.error('Error obteniendo usuarios cercanos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await Leaderboard.getStats();
      
      res.json({
        success: true,
        stats: {
          totalUsers: parseInt(stats.total_users) || 0,
          totalExercisesCompleted: parseInt(stats.total_exercises_completed) || 0,
          averagePoints: Math.round(parseFloat(stats.average_points)) || 0,
          highestScore: parseInt(stats.highest_score) || 0,
          globalAverageTime: Math.round(parseFloat(stats.global_average_time)) || 0
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async updateRanking(req, res) {
    try {
      const userId = req.user.userId;
      await Leaderboard.updateUserRanking(userId);
      
      res.json({
        success: true,
        message: 'Ranking actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando ranking:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = rankingsController;