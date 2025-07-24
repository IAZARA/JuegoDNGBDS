import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import PresenterGuide from '../components/admin/PresenterGuide';
import UserManagement from '../components/admin/UserManagement';
import '../styles/admin.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resetLink, setResetLink] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'guide', or 'users'
  const [teamsEnabled, setTeamsEnabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    fetchStats();
    fetchTeamsStatus();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data.stats);
      setGameState(response.data.gameState);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      toast.error('Error al cargar estadísticas');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetGame = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.post('/admin/reset-game', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(response.data.message);
      setShowConfirmReset(false);
      fetchStats();
    } catch (error) {
      console.error('Error reiniciando juego:', error);
      toast.error(error.response?.data?.message || 'Error al reiniciar el juego');
    }
  };

  const generateResetLink = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.post('/admin/generate-reset-link', 
        { expirationMinutes: 60 },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setResetLink(response.data.resetLink);
      toast.success('Link generado exitosamente');
    } catch (error) {
      console.error('Error generando link:', error);
      toast.error('Error al generar link de reinicio');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetLink);
    toast.success('Link copiado al portapapeles');
  };

  const fetchTeamsStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/teams-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTeamsEnabled(response.data.teamsEnabled);
    } catch (error) {
      console.error('Error obteniendo estado de equipos:', error);
    }
  };

  const handleToggleTeams = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const newStatus = !teamsEnabled;
      
      const response = await api.post('/admin/toggle-teams', 
        { enabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setTeamsEnabled(newStatus);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error cambiando estado de equipos:', error);
      toast.error('Error al cambiar estado de equipos');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <div style={{ fontSize: '1.5rem' }}>Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-max-width">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">Panel de Administrador</h1>
          <button
            onClick={handleLogout}
            className="admin-btn admin-btn-secondary"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          >
            👥 Usuarios
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`admin-tab ${activeTab === 'guide' ? 'active' : ''}`}
          >
            📋 Guía del Presentador
          </button>
        </div>

        {/* Contenido condicional basado en la pestaña activa */}
        {activeTab === 'dashboard' && (
          <>
            {/* Estadísticas */}
            <div className="admin-stats-grid">
              <div className="admin-card">
                <h3 className="admin-card-title">Usuarios Totales</h3>
                <p className="admin-card-value">{stats?.total_users || 0}</p>
              </div>
              
              <div className="admin-card">
                <h3 className="admin-card-title">Equipos Totales</h3>
                <p className="admin-card-value">{stats?.total_teams || 0}</p>
              </div>
              
              <div className="admin-card">
                <h3 className="admin-card-title">Usuarios Activos</h3>
                <p className="admin-card-value">{stats?.active_users || 0}</p>
              </div>
            </div>

            {/* Estado del Juego */}
            <div className="admin-game-state">
              <h2 className="admin-game-state-title">Estado del Juego</h2>
              <div className="admin-game-state-info">
                <p>Reinicios totales: <strong>{gameState?.reset_count || 0}</strong></p>
                {gameState?.last_reset_at && (
                  <p>Último reinicio: <strong>{new Date(gameState.last_reset_at).toLocaleString()}</strong></p>
                )}
                <p>Total de intentos: <strong>{stats?.total_attempts || 0}</strong></p>
              </div>
            </div>

            {/* Acciones */}
            <div className="admin-actions-grid">
              {/* Reinicio Directo */}
              <div className="admin-action-card">
                <h3 className="admin-action-title">Reinicio Directo</h3>
                <p className="admin-action-description">
                  Reinicia inmediatamente todo el progreso del juego.
                </p>
                
                {!showConfirmReset ? (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="admin-btn admin-btn-primary admin-btn-full"
                  >
                    Reiniciar Todo el Juego
                  </button>
                ) : (
                  <div className="admin-confirmation">
                    <p className="admin-warning">
                      ⚠️ ¿Estás seguro? Esta acción no se puede deshacer.
                    </p>
                    <div className="admin-button-group">
                      <button
                        onClick={handleResetGame}
                        className="admin-btn admin-btn-primary"
                      >
                        Sí, Reiniciar
                      </button>
                      <button
                        onClick={() => setShowConfirmReset(false)}
                        className="admin-btn admin-btn-secondary"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Link de Reinicio */}
              <div className="admin-action-card">
                <h3 className="admin-action-title">Link de Reinicio</h3>
                <p className="admin-action-description">
                  Genera un link temporal para reiniciar el juego remotamente.
                </p>
                
                {!resetLink ? (
                  <button
                    onClick={generateResetLink}
                    className="admin-btn admin-btn-blue admin-btn-full"
                  >
                    Generar Link de Reinicio
                  </button>
                ) : (
                  <div className="admin-reset-link-container">
                    <div className="admin-reset-link">
                      {resetLink}
                    </div>
                    <div className="admin-button-group">
                      <button
                        onClick={copyToClipboard}
                        className="admin-btn admin-btn-success"
                      >
                        Copiar Link
                      </button>
                      <button
                        onClick={() => {
                          setResetLink('');
                          generateResetLink();
                        }}
                        className="admin-btn admin-btn-blue"
                      >
                        Nuevo Link
                      </button>
                    </div>
                    <p className="admin-reset-link-info">
                      Este link expira en 60 minutos
                    </p>
                  </div>
                )}
              </div>

              {/* Control de Equipos */}
              <div className="admin-action-card">
                <h3 className="admin-action-title">Control de Equipos</h3>
                <p className="admin-action-description">
                  Habilita o deshabilita la funcionalidad de equipos en el juego.
                </p>
                
                <div className="admin-teams-control">
                  <div className="admin-teams-status">
                    Estado actual: <strong className={teamsEnabled ? 'text-success' : 'text-danger'}>
                      {teamsEnabled ? 'Habilitado' : 'Deshabilitado'}
                    </strong>
                  </div>
                  
                  <button
                    onClick={handleToggleTeams}
                    className={`admin-btn admin-btn-full ${teamsEnabled ? 'admin-btn-danger' : 'admin-btn-success'}`}
                  >
                    {teamsEnabled ? 'Deshabilitar Equipos' : 'Habilitar Equipos'}
                  </button>
                  
                  <p className="admin-teams-info">
                    {teamsEnabled 
                      ? '✅ Los usuarios pueden crear y unirse a equipos' 
                      : '🚫 La pestaña de equipos está bloqueada para todos los usuarios'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Gestión de Usuarios */}
        {activeTab === 'users' && (
          <UserManagement />
        )}

        {/* Guía del Presentador */}
        {activeTab === 'guide' && (
          <PresenterGuide />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;