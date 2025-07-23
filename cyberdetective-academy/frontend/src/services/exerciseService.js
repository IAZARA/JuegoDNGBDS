import api from './api';

class ExerciseService {
  async getAllExercises() {
    try {
      const response = await api.get('/exercises');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo ejercicios');
    }
  }

  async getExerciseById(id) {
    try {
      const response = await api.get(`/exercises/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo ejercicio');
    }
  }

  async getExercisesByLevel(level) {
    try {
      const response = await api.get(`/exercises/level/${level}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo ejercicios por nivel');
    }
  }

  async submitAnswer(exerciseId, answer, timeTaken, hintsUsed = 0) {
    try {
      const response = await api.post(`/exercises/${exerciseId}/submit`, {
        answer,
        timeTaken,
        hintsUsed
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error enviando respuesta');
    }
  }

  async getHint(exerciseId, hintIndex = 0) {
    try {
      const response = await api.get(`/exercises/${exerciseId}/hint?hintIndex=${hintIndex}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo pista');
    }
  }

  async getUserProgress() {
    try {
      const response = await api.get('/exercises/user/progress');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo progreso');
    }
  }

  async getSolution(exerciseId) {
    try {
      const response = await api.get(`/exercises/${exerciseId}/solution`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo solución');
    }
  }
}

export default new ExerciseService();