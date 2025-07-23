import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import teamService from '../../services/teamService';

const TeamExercises = ({ team }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamExercises();
  }, [team.id]);

  const loadTeamExercises = async () => {
    try {
      setLoading(true);
      const response = await teamService.getTeamExercises(team.id);
      setExercises(response.data.exercises);
    } catch (error) {
      console.error('Error loading team exercises:', error);
      toast.error('Error al cargar ejercicios del equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = async (exerciseId) => {
    try {
      await teamService.startTeamExercise(team.id, exerciseId);
      toast.success('Ejercicio iniciado para el equipo');
      loadTeamExercises(); // Reload to update status
    } catch (error) {
      console.error('Error starting exercise:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar ejercicio');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      1: '#28a745', // Verde - Muy fácil
      2: '#17a2b8', // Azul - Fácil  
      3: '#ffc107', // Amarillo - Medio
      4: '#fd7e14', // Naranja - Difícil
      5: '#dc3545'  // Rojo - Muy difícil
    };
    return colors[difficulty] || '#6c757d';
  };

  const getDifficultyText = (difficulty) => {
    const levels = {
      1: 'Muy Fácil',
      2: 'Fácil',
      3: 'Medio',
      4: 'Difícil',
      5: 'Muy Difícil'
    };
    return levels[difficulty] || 'Desconocido';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando ejercicios...</p>
      </div>
    );
  }

  return (
    <div className="team-exercises">
      <div className="exercises-header">
        <h2>🎯 Ejercicios de Equipo</h2>
        <p>Resuelve ejercicios colaborativamente y gana puntos para tu equipo</p>
      </div>

      {exercises.length === 0 ? (
        <div className="no-exercises">
          <p>No hay ejercicios disponibles</p>
        </div>
      ) : (
        <div className="exercises-grid">
          {exercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-header">
                <h3>{exercise.title}</h3>
                <div className="exercise-meta">
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(exercise.difficulty) }}
                  >
                    {getDifficultyText(exercise.difficulty)}
                  </span>
                  <span className="points-badge">
                    🏆 {exercise.points} pts
                  </span>
                </div>
              </div>

              <div className="exercise-description">
                <p>{exercise.description}</p>
              </div>

              <div className="exercise-status">
                {exercise.attempted ? (
                  exercise.is_completed ? (
                    <div className="status-completed">
                      <span className="status-icon">✅</span>
                      <span>Completado - {exercise.points_earned} puntos ganados</span>
                    </div>
                  ) : (
                    <div className="status-in-progress">
                      <span className="status-icon">🔄</span>
                      <span>En progreso</span>
                    </div>
                  )
                ) : (
                  <div className="status-available">
                    <span className="status-icon">🆕</span>
                    <span>Disponible</span>
                  </div>
                )}
              </div>

              <div className="exercise-actions">
                {!exercise.attempted && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStartExercise(exercise.id)}
                  >
                    🚀 Iniciar Ejercicio
                  </button>
                )}
                {exercise.attempted && !exercise.is_completed && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      // TODO: Navigate to team exercise player
                      toast.info('Funcionalidad de ejercicio en equipo próximamente');
                    }}
                  >
                    📝 Continuar
                  </button>
                )}
                {exercise.attempted && exercise.is_completed && (
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      // TODO: Show exercise results
                      toast.info('Ver resultados próximamente');
                    }}
                  >
                    📊 Ver Resultados
                  </button>
                )}
              </div>

              <div className="exercise-info">
                <small>
                  <strong>Categoría:</strong> {exercise.category} | 
                  <strong> Tipo:</strong> {exercise.type}
                  {exercise.time_limit && (
                    <> | <strong>Límite:</strong> {Math.floor(exercise.time_limit / 60)} min</>
                  )}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="team-progress">
        <h3>📈 Progreso del Equipo</h3>
        <div className="progress-stats">
          <div className="stat">
            <strong>Ejercicios Completados:</strong> 
            {exercises.filter(e => e.is_completed).length} / {exercises.length}
          </div>
          <div className="stat">
            <strong>Puntos Totales:</strong> 🏆 {team.total_points}
          </div>
          <div className="stat">
            <strong>En Progreso:</strong> 
            {exercises.filter(e => e.attempted && !e.is_completed).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamExercises;