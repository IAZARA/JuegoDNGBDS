import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import exerciseService from '../services/exerciseService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progressData = await exerciseService.getUserProgress();
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelName = (level) => {
    const levels = {
      1: 'Nivel 1',
      2: 'Nivel 2', 
      3: 'Nivel 3',
      4: 'Nivel 4'
    };
    return levels[level] || 'Nivel 1';
  };

  const getLevelProgress = (points) => {
    const thresholds = [0, 200, 500, 1000];
    const currentLevel = user?.level || 1;
    const currentThreshold = thresholds[currentLevel - 1];
    const nextThreshold = thresholds[currentLevel] || 1000;
    
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {user?.username}</h1>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card profile-card">
          <div className="card-header">
            <h3>Tu Perfil</h3>
            <span className="level-badge">{getLevelName(user?.level)}</span>
          </div>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{user?.totalPoints || 0}</span>
              <span className="stat-label">Puntos Totales</span>
            </div>
            <div className="level-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${getLevelProgress(user?.totalPoints)}%` }}
                ></div>
              </div>
              <span className="progress-text">Nivel {user?.level || 1}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Estadísticas Rápidas</h3>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-icon">🎯</span>
                <span className="stat-text">
                  {progress?.completed_exercises || 0} Ejercicios Completados
                </span>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">⚡</span>
                <span className="stat-text">
                  {progress?.average_time ? 
                    `${Math.round(progress.average_time)}s Tiempo Promedio` : 
                    '-- Tiempo Promedio'
                  }
                </span>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">📊</span>
                <span className="stat-text">
                  {progress?.total_points || 0} Puntos Ganados
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card action-card">
          <h3>Acciones Rápidas</h3>
          <div className="action-buttons">
            <button 
              className="action-btn primary"
              onClick={() => navigate('/exercises')}
            >
              🎯 Comenzar Ejercicios
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/leaderboard')}
            >
              🏆 Ver Ranking
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;