import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import teamService from '../services/teamService';
import TeamDashboard from '../components/teams/TeamDashboard';
import CreateTeam from '../components/teams/CreateTeam';
import JoinTeam from '../components/teams/JoinTeam';

const Teams = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await teamService.getMyTeam();
      setTeam(response.data.team);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error loading team:', error);
        toast.error('Error al cargar el equipo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = (newTeam) => {
    setTeam(newTeam);
    setActiveTab('dashboard');
    toast.success('Equipo creado exitosamente');
  };

  const handleTeamJoined = () => {
    loadTeam();
    setActiveTab('dashboard');
    toast.success('Te has unido al equipo');
  };

  const handleLeaveTeam = () => {
    setTeam(null);
    toast.success('Has abandonado el equipo');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="teams-page">
        <div className="page-header">
          <h1>🏃‍♂️ Equipos</h1>
          <p>Únete o crea un equipo para resolver ejercicios colaborativamente</p>
        </div>

        <div className="team-tabs">
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            🆕 Crear Equipo
          </button>
          <button 
            className={`tab-button ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            🔍 Buscar Equipos
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'create' && (
            <CreateTeam onTeamCreated={handleTeamCreated} />
          )}
          {activeTab === 'join' && (
            <JoinTeam onTeamJoined={handleTeamJoined} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <TeamDashboard 
        team={team} 
        onTeamUpdate={setTeam}
        onLeaveTeam={handleLeaveTeam}
      />
    </div>
  );
};

export default Teams;