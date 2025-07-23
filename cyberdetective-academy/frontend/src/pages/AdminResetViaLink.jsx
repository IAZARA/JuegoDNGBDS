import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import '../styles/admin.css';

function AdminResetViaLink() {
  const { teamId, token } = useParams();
  const [isResetting, setIsResetting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el token parece válido
    if (!token || token.length < 32) {
      setIsValid(false);
    }
  }, [token]);

  const handleReset = async () => {
    setIsResetting(true);

    try {
      const response = await api.post(`/admin/reset-via-link/${token}`);
      
      toast.success(response.data.message);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error reiniciando:', error);
      toast.error(error.response?.data?.message || 'Error al reiniciar el juego');
      setIsValid(false);
    } finally {
      setIsResetting(false);
    }
  };

  if (!isValid) {
    return (
      <div className="admin-reset-page">
        <div className="admin-reset-card">
          <div className="admin-reset-icon" style={{ color: '#ef4444' }}>⚠️</div>
          <h2 className="admin-reset-title">
            Link Inválido o Expirado
          </h2>
          <p className="admin-reset-description">
            Este link de reinicio no es válido o ya ha expirado.
          </p>
          <button
            onClick={() => navigate('/')}
            className="admin-btn admin-btn-secondary"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reset-page">
      <div className="admin-reset-card">
        <div className="admin-reset-icon" style={{ color: '#fbbf24' }}>🔄</div>
        <h2 className="admin-reset-title">
          Reinicio del Juego
        </h2>
        
        <p className="admin-reset-description">
          Estás a punto de reiniciar todo el progreso del juego. 
          Esta acción eliminará todos los puntos, intentos y progreso de todos los usuarios y equipos.
        </p>
        
        <div className="admin-warning-box">
          <p className="admin-warning-text">
            ⚠️ ADVERTENCIA: Esta acción no se puede deshacer
          </p>
        </div>

        {!isResetting ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleReset}
              className="admin-btn admin-btn-primary admin-btn-full"
            >
              Confirmar Reinicio Total
            </button>
            <button
              onClick={() => navigate('/')}
              className="admin-btn admin-btn-secondary admin-btn-full"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Reiniciando el juego...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminResetViaLink;