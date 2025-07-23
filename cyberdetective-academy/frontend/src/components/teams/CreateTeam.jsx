import { useState } from 'react';
import { toast } from 'react-hot-toast';
import teamService from '../../services/teamService';

const CreateTeam = ({ onTeamCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre del equipo es requerido');
      return;
    }

    if (formData.name.length > 100) {
      toast.error('El nombre no puede tener más de 100 caracteres');
      return;
    }

    try {
      setLoading(true);
      const response = await teamService.createTeam({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      onTeamCreated(response.data.team);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error.response?.data?.message || 'Error al crear el equipo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-team-container">
      <div className="card">
        <h2>🆕 Crear Nuevo Equipo</h2>
        <p className="subtitle">Crea tu equipo y empieza a invitar miembros</p>
        
        <form onSubmit={handleSubmit} className="create-team-form">
          <div className="form-group">
            <label htmlFor="name">Nombre del Equipo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Los Ciberdetectives"
              maxLength={100}
              required
            />
            <small className="char-count">{formData.name.length}/100</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción (opcional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu equipo y sus objetivos..."
              rows={4}
              maxLength={500}
            />
            <small className="char-count">{formData.description.length}/500</small>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Creando...' : '🚀 Crear Equipo'}
          </button>
        </form>

        <div className="team-info">
          <h3>📋 Información sobre Equipos</h3>
          <ul>
            <li>• Los equipos pueden tener hasta 5 miembros</li>
            <li>• Como líder, podrás invitar y remover miembros</li>
            <li>• Los puntos se acumulan como equipo</li>
            <li>• Solo puedes estar en un equipo a la vez</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;