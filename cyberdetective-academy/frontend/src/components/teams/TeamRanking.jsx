import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import teamService from '../../services/teamService';

const TeamRanking = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    loadRankings();
  }, [limit]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const response = await teamService.getTeamRanking(limit);
      setRankings(response.data.ranking);
    } catch (error) {
      console.error('Error loading team rankings:', error);
      toast.error('Error al cargar el ranking de equipos');
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

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-first';
    if (rank === 2) return 'rank-second';
    if (rank === 3) return 'rank-third';
    return 'rank-other';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando ranking...</p>
      </div>
    );
  }

  return (
    <div className="team-ranking">
      <div className="ranking-controls">
        <label htmlFor="limit">Mostrar:</label>
        <select 
          id="limit"
          value={limit} 
          onChange={(e) => setLimit(parseInt(e.target.value))}
        >
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
        </select>
      </div>

      {rankings.length === 0 ? (
        <div className="no-rankings">
          <p>No hay equipos registrados aún</p>
        </div>
      ) : (
        <div className="rankings-list">
          {rankings.map((team, index) => (
            <div 
              key={team.id} 
              className={`ranking-item ${getRankClass(team.rank)}`}
            >
              <div className="rank-position">
                <span className="rank-icon">{getRankIcon(team.rank)}</span>
              </div>
              
              <div className="team-info">
                <h3>{team.name}</h3>
                <div className="team-details">
                  <span className="leader">
                    👑 {team.leader_username}
                  </span>
                  <span className="members">
                    👥 {team.current_members} miembros
                  </span>
                </div>
              </div>
              
              <div className="team-stats">
                <div className="points">
                  <span className="points-label">Puntos</span>
                  <span className="points-value">🏆 {team.total_points}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ranking-info">
        <h3>ℹ️ Información</h3>
        <ul>
          <li>• Los equipos ganan puntos resolviendo ejercicios colaborativamente</li>
          <li>• Solo se cuenta un intento por ejercicio por equipo</li>
          <li>• Los puntos se acumulan para todo el equipo</li>
          <li>• El ranking se actualiza en tiempo real</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamRanking;