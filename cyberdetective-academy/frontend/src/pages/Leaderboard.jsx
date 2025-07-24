import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import rankingService from '../services/rankingService';
import TeamRanking from '../components/teams/TeamRanking';
import toast from 'react-hot-toast';
import api from '../services/api';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('individuals');
  const [teamsEnabled, setTeamsEnabled] = useState(true);

  useEffect(() => {
    checkTeamsStatus();
    loadLeaderboardData();
  }, []);

  const checkTeamsStatus = async () => {
    try {
      const response = await api.get('/public/teams-enabled');
      setTeamsEnabled(response.data.teamsEnabled);
      
      // Si los equipos están deshabilitados y el tab activo es 'teams', cambiar a 'individuals'
      if (!response.data.teamsEnabled && activeTab === 'teams') {
        setActiveTab('individuals');
      }
    } catch (error) {
      console.error('Error checking teams status:', error);
    }
  };

  const loadLeaderboardData = async () => {
    try {
      const [leaderboardData, myRankingData, statsData] = await Promise.all([
        rankingService.getLeaderboard(20),
        rankingService.getMyRanking(),
        rankingService.getStats()
      ]);
      
      setLeaderboard(leaderboardData.leaderboard);
      setMyRanking(myRankingData.ranking);
      setStats(statsData.stats);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getLevelName = (level) => {
    const levels = {
      1: 'Detective Junior',
      2: 'Analista de Datos',
      3: 'Investigador Senior',
      4: 'Jefe de Inteligencia'
    };
    return levels[level] || 'Detective';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando rankings...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h1>🏆 Rankings</h1>
        <p>Los mejores detectives y equipos de la academia</p>
        
        {/* Tabs */}
        <div className="ranking-tabs">
          <button 
            className={`tab-button ${activeTab === 'individuals' ? 'active' : ''}`}
            onClick={() => setActiveTab('individuals')}
          >
            👤 Detectives
          </button>
          {teamsEnabled && (
            <button 
              className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
              onClick={() => setActiveTab('teams')}
            >
              👥 Equipos
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'individuals' && (
        <>
          {stats && (
            <div className="global-stats">
            <div className="stat">
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-label">Detectives Activos</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.totalExercisesCompleted}</span>
              <span className="stat-label">Ejercicios Resueltos</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.highestScore}</span>
              <span className="stat-label">Puntuación Máxima</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatTime(stats.globalAverageTime)}</span>
              <span className="stat-label">Tiempo Promedio</span>
            </div>
          </div>
        )}

        {myRanking && (
        <div className="my-ranking-card">
          <h3>Tu Posición</h3>
          <div className="ranking-info">
            <div className="rank-position">
              <span className="rank-icon">{getRankIcon(myRanking.rank)}</span>
              <div className="rank-details">
                <span className="rank-number">Puesto {myRanking.rank}</span>
                <span className="rank-total">de {myRanking.total_users} detectives</span>
              </div>
            </div>
            
            <div className="user-stats">
              <div className="user-stat">
                <span className="stat-value">{myRanking.total_points}</span>
                <span className="stat-label">Puntos</span>
              </div>
              <div className="user-stat">
                <span className="stat-value">{myRanking.exercises_completed}</span>
                <span className="stat-label">Completados</span>
              </div>
              <div className="user-stat">
                <span className="stat-value">{formatTime(myRanking.average_time)}</span>
                <span className="stat-label">Promedio</span>
              </div>
              <div className="user-stat">
                <span className="stat-value">{myRanking.badges_count}</span>
                <span className="stat-label">Badges</span>
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="leaderboard-content">
        {leaderboard.length === 0 ? (
          <div className="no-rankings">
            <h2>📊 Sin Rankings Aún</h2>
            <p>¡Sé el primero en completar ejercicios y aparecer en el ranking!</p>
          </div>
        ) : (
          <div className="rankings-table">
            <div className="table-header">
              <div className="col-rank">Posición</div>
              <div className="col-user">Detective</div>
              <div className="col-level">Nivel</div>
              <div className="col-points">Puntos</div>
              <div className="col-exercises">Ejercicios</div>
              <div className="col-time">Tiempo Promedio</div>
              <div className="col-badges">Badges</div>
            </div>
            
            {leaderboard.map((detective, index) => (
              <div 
                key={detective.username} 
                className={`ranking-row ${detective.username === user?.username ? 'current-user' : ''}`}
              >
                <div className="col-rank">
                  <span className="rank-icon">{getRankIcon(detective.rank)}</span>
                </div>
                
                <div className="col-user">
                  <div className="user-info">
                    <div className="user-avatar">
                      {detective.avatar_url ? (
                        <img src={detective.avatar_url} alt={detective.username} />
                      ) : (
                        <span className="avatar-initial">
                          {detective.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="user-details">
                      <span className="username">{detective.username}</span>
                      {detective.username === user?.username && (
                        <span className="you-indicator">Tú</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-level">
                  <span className="level-badge" style={{ backgroundColor: `var(--level-${detective.level}-color, var(--primary-color))` }}>
                    {getLevelName(detective.level)}
                  </span>
                </div>
                
                <div className="col-points">
                  <span className="points-value">{detective.total_points}</span>
                </div>
                
                <div className="col-exercises">
                  <span className="exercises-value">{detective.exercises_completed}</span>
                </div>
                
                <div className="col-time">
                  <span className="time-value">{formatTime(detective.average_time)}</span>
                </div>
                
                <div className="col-badges">
                  <span className="badges-count">{detective.badges_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {activeTab === 'teams' && teamsEnabled && (
        <TeamRanking />
      )}
    </div>
  );
};

export default Leaderboard;