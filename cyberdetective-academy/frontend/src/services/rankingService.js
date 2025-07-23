import api from './api';

class RankingService {
  async getLeaderboard(limit = 10) {
    try {
      const response = await api.get(`/rankings?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo leaderboard');
    }
  }

  async getMyRanking() {
    try {
      const response = await api.get('/rankings/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo mi ranking');
    }
  }

  async getUsersAroundMe(range = 3) {
    try {
      const response = await api.get(`/rankings/around-me?range=${range}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo usuarios cercanos');
    }
  }

  async getStats() {
    try {
      const response = await api.get('/rankings/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas');
    }
  }

  async updateMyRanking() {
    try {
      const response = await api.post('/rankings/update');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando ranking');
    }
  }
}

export default new RankingService();