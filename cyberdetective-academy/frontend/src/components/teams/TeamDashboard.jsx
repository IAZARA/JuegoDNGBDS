import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import teamService from '../../services/teamService';

const TeamDashboard = ({ team, onTeamUpdate, onLeaveTeam }) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ username: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isLeader = team.leader_id === user.id;

  useEffect(() => {
    if (isLeader) {
      loadTeamInvitations();
    }
  }, [isLeader]);

  const loadTeamInvitations = async () => {
    try {
      const response = await teamService.getTeamInvitations(team.id);
      setInvitations(response.data.invitations);
    } catch (error) {
      console.error('Error loading team invitations:', error);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    
    if (!inviteData.username.trim()) {
      toast.error('El username es requerido');
      return;
    }

    try {
      setLoading(true);
      await teamService.inviteMember(
        team.id, 
        inviteData.username.trim(), 
        inviteData.message.trim()
      );
      
      toast.success('Invitación enviada exitosamente');
      setInviteData({ username: '', message: '' });
      setShowInviteForm(false);
      loadTeamInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error.response?.data?.message || 'Error al enviar invitación');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`¿Estás seguro de que quieres remover a ${memberName} del equipo?`)) {
      return;
    }

    try {
      await teamService.removeMember(team.id, memberId);
      toast.success('Miembro removido exitosamente');
      
      // Reload team data
      const response = await teamService.getMyTeam();
      onTeamUpdate(response.data.team);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.message || 'Error al remover miembro');
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('¿Estás seguro de que quieres abandonar el equipo?')) {
      return;
    }

    try {
      await teamService.removeMember(team.id, user.id);
      onLeaveTeam();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error(error.response?.data?.message || 'Error al abandonar equipo');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await teamService.cancelInvitation(invitationId, team.id);
      toast.success('Invitación cancelada');
      loadTeamInvitations();
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast.error('Error al cancelar invitación');
    }
  };

  return (
    <div className="team-dashboard">
      <div className="page-header">
        <h1>🏃‍♂️ {team.name}</h1>
        {team.description && <p className="team-description">{team.description}</p>}
      </div>

      {/* Team Tabs */}
      <div className="team-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Resumen
        </button>
        <button 
          className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Miembros
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Team Stats */}
          <div className="team-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>Líder</h3>
            <p>{team.leader_username}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Miembros</h3>
            <p>{team.current_members}/{team.max_members}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Puntos</h3>
            <p>{team.total_points}</p>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="card">
        <h2>ℹ️ Información del Equipo</h2>
        <div className="team-info-content">
          <p>
            <strong>📋 ¿Cómo funcionan los equipos?</strong>
          </p>
          <ul>
            <li>• Los miembros van a la sección normal de <strong>🎯 Ejercicios</strong></li>
            <li>• Resuelven ejercicios individualmente como siempre</li>
            <li>• Los puntos se suman automáticamente al equipo en lugar del usuario</li>
            <li>• El equipo compite en el ranking general de equipos</li>
            <li>• Cada ejercicio se puede resolver una vez por usuario</li>
          </ul>
          
          <div className="team-exercise-tip">
            <p>
              <strong>💡 Consejo:</strong> Ve a la pestaña "🎯 Ejercicios" en el menú principal para resolver ejercicios. 
              Cuando completes uno correctamente, los puntos se sumarán automáticamente a este equipo.
            </p>
          </div>
        </div>
      </div>

        </>
      )}


      {activeTab === 'members' && (
        <>
          {/* Team Members */}
          <div className="card">
        <div className="card-header">
          <h2>👥 Miembros del Equipo</h2>
          {isLeader && team.current_members < team.max_members && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowInviteForm(!showInviteForm)}
            >
              ➕ Invitar Miembro
            </button>
          )}
        </div>
        
        {showInviteForm && (
          <div className="invite-form">
            <form onSubmit={handleInviteMember}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Username del usuario"
                  value={inviteData.username}
                  onChange={(e) => setInviteData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Mensaje opcional"
                  value={inviteData.message}
                  onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                />
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Enviando...' : '📤 Enviar'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowInviteForm(false)}
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="members-list">
          {team.members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-info">
                <div className="member-avatar">
                  {member.role === 'leader' ? '👑' : '👤'}
                </div>
                <div className="member-details">
                  <h4>{member.username}</h4>
                  <p>{member.full_name}</p>
                  <small>Miembro desde: {new Date(member.joined_at).toLocaleDateString()}</small>
                </div>
              </div>
              
              <div className="member-actions">
                {isLeader && member.role !== 'leader' && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveMember(member.id, member.username)}
                  >
                    🗑️ Remover
                  </button>
                )}
                {member.id === user.id && member.role !== 'leader' && (
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={handleLeaveTeam}
                  >
                    🚪 Abandonar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Pending Invitations */}
        {isLeader && invitations.length > 0 && (
          <div className="card">
            <h2>📨 Invitaciones Pendientes</h2>
            <div className="invitations-list">
              {invitations.map(invitation => (
                <div key={invitation.id} className="invitation-item">
                  <div className="invitation-info">
                    <strong>{invitation.invited_username}</strong>
                    <span>{invitation.invited_full_name}</span>
                    {invitation.message && <p>"{invitation.message}"</p>}
                    <small>Enviada: {new Date(invitation.created_at).toLocaleDateString()}</small>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancelInvitation(invitation.id)}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
      )}

      {/* Team Actions */}
      <div className="team-actions">
        {!isLeader && (
          <button 
            className="btn btn-warning"
            onClick={handleLeaveTeam}
          >
            🚪 Abandonar Equipo
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamDashboard;