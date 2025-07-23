import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import teamService from '../../services/teamService';

const JoinTeam = ({ onTeamJoined }) => {
  const [invitations, setInvitations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await teamService.getMyInvitations();
      setInvitations(response.data.invitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('Error al cargar invitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Ingresa un término de búsqueda');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await teamService.searchTeams(searchQuery.trim());
      setSearchResults(response.data.teams);
    } catch (error) {
      console.error('Error searching teams:', error);
      toast.error('Error al buscar equipos');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRespondInvitation = async (invitationId, response) => {
    try {
      await teamService.respondToInvitation(invitationId, response);
      
      if (response === 'accepted') {
        onTeamJoined();
      } else {
        toast.success('Invitación rechazada');
        loadInvitations();
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error(error.response?.data?.message || 'Error al responder invitación');
    }
  };

  return (
    <div className="join-team-container">
      {/* Invitations Section */}
      <div className="card">
        <h2>📨 Mis Invitaciones</h2>
        
        {loading ? (
          <div className="loading-spinner"></div>
        ) : invitations.length === 0 ? (
          <p className="no-data">No tienes invitaciones pendientes</p>
        ) : (
          <div className="invitations-list">
            {invitations.map(invitation => (
              <div key={invitation.id} className="invitation-card">
                <div className="invitation-header">
                  <h3>{invitation.team_name}</h3>
                  <span className="member-count">
                    {invitation.current_members}/{invitation.max_members} miembros
                  </span>
                </div>
                
                <div className="invitation-details">
                  <p className="team-description">{invitation.team_description}</p>
                  <p className="invitation-info">
                    <strong>Líder:</strong> {invitation.leader_username} • 
                    <strong> Invitado por:</strong> {invitation.inviter_username}
                  </p>
                  <p className="team-points">🏆 {invitation.total_points} puntos</p>
                  
                  {invitation.message && (
                    <div className="invitation-message">
                      <strong>Mensaje:</strong> {invitation.message}
                    </div>
                  )}
                </div>
                
                <div className="invitation-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleRespondInvitation(invitation.id, 'accepted')}
                  >
                    ✅ Aceptar
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleRespondInvitation(invitation.id, 'rejected')}
                  >
                    ❌ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Teams Section */}
      <div className="card">
        <h2>🔍 Buscar Equipos</h2>
        <p className="subtitle">Busca equipos públicos con espacios disponibles</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="search-input"
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={searchLoading}
            >
              {searchLoading ? 'Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Resultados de búsqueda:</h3>
            {searchResults.map(team => (
              <div key={team.id} className="team-search-card">
                <div className="team-header">
                  <h4>{team.name}</h4>
                  <span className="member-count">
                    {team.current_members}/{team.max_members} miembros
                  </span>
                </div>
                
                <div className="team-details">
                  <p className="team-description">{team.description}</p>
                  <p className="team-info">
                    <strong>Líder:</strong> {team.leader_username} • 
                    <strong> Puntos:</strong> 🏆 {team.total_points}
                  </p>
                </div>
                
                <div className="team-actions">
                  <button 
                    className="btn btn-outline"
                    disabled
                  >
                    💌 Solicitar Invitación
                  </button>
                  <small className="note">
                    Nota: Contacta al líder para solicitar una invitación
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTeam;