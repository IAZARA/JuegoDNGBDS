import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import '../../styles/admin.css';

function PresenterGuide() {
  const [exercises, setExercises] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    fetchPresenterGuide();
  }, [filters]);

  const fetchPresenterGuide = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/admin/presenter-guide?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setExercises(response.data.exercises);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error cargando guía:', error);
      toast.error('Error al cargar la guía del presentador');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      1: '#10b981', // verde - muy fácil
      2: '#3b82f6', // azul - fácil  
      3: '#f59e0b', // amarillo - medio
      4: '#f97316', // naranja - difícil
      5: '#ef4444'  // rojo - muy difícil
    };
    return colors[difficulty] || '#6b7280';
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <div>Cargando guía del presentador...</div>
      </div>
    );
  }

  return (
    <div className="presenter-guide">
      <div className="presenter-guide-header">
        <h2 className="presenter-guide-title">📋 Guía del Presentador</h2>
        <p className="presenter-guide-subtitle">
          Referencia completa de todos los ejercicios con respuestas correctas y estadísticas
        </p>
      </div>

      {/* Filtros */}
      <div className="presenter-guide-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="admin-input"
            style={{ maxWidth: '300px' }}
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="admin-input"
            style={{ maxWidth: '200px' }}
          >
            <option value="">Todas las categorías</option>
            {summary?.categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            className="admin-input"
            style={{ maxWidth: '200px' }}
          >
            <option value="">Todas las dificultades</option>
            <option value="1">Muy Fácil</option>
            <option value="2">Fácil</option>
            <option value="3">Medio</option>
            <option value="4">Difícil</option>
            <option value="5">Muy Difícil</option>
          </select>
        </div>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="presenter-summary">
          <div className="presenter-summary-card">
            <h3>📊 Total de ejercicios</h3>
            <div className="summary-value">{summary.totalExercises}</div>
          </div>
          <div className="presenter-summary-card">
            <h3>📚 Categorías</h3>
            <div className="summary-value">{summary.categories.length}</div>
          </div>
          <div className="presenter-summary-card">
            <h3>🎯 Puntos totales</h3>
            <div className="summary-value">
              {summary.categories.reduce((total, cat) => total + cat.totalPoints, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Lista de ejercicios */}
      <div className="presenter-exercises-grid">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="presenter-exercise-card">
            <div className="exercise-header">
              <div className="exercise-title-section">
                <h4 className="exercise-title">{exercise.title}</h4>
                <div className="exercise-meta">
                  <span className="exercise-category">{exercise.category}</span>
                  <span 
                    className="exercise-difficulty"
                    style={{ color: getDifficultyColor(exercise.difficulty) }}
                  >
                    {exercise.difficultyText}
                  </span>
                  <span className="exercise-points">{exercise.points} pts</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedExercise(selectedExercise === exercise.id ? null : exercise.id)}
                className="admin-btn admin-btn-blue"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {selectedExercise === exercise.id ? 'Ocultar' : 'Ver detalles'}
              </button>
            </div>

            <p className="exercise-description">{exercise.description}</p>

            {/* Respuesta rápida visible */}
            <div className="quick-answer">
              <strong>Respuesta correcta: </strong>
              <span className="answer-highlight">{exercise.correctAnswer}</span>
            </div>

            {/* Estadísticas básicas */}
            <div className="exercise-quick-stats">
              <span>Intentos: {exercise.stats.totalAttempts}</span>
              <span>Éxito: {exercise.stats.successRate}%</span>
              {exercise.timeLimit && <span>Límite: {formatTime(exercise.timeLimit)}</span>}
            </div>

            {/* Detalles expandibles */}
            {selectedExercise === exercise.id && (
              <div className="exercise-details">
                <div className="exercise-details-section">
                  <h5>🎯 Datos del problema</h5>
                  <div className="problem-data">
                    {typeof exercise.problemData === 'object' ? 
                      Object.entries(exercise.problemData).map(([key, value]) => (
                        <div key={key} className="problem-item">
                          <strong>{key}:</strong> {JSON.stringify(value)}
                        </div>
                      )) :
                      <p>{exercise.problemData}</p>
                    }
                  </div>
                </div>

                <div className="exercise-details-section">
                  <h5>✅ Solución completa</h5>
                  <div className="solution-section">
                    <div className="solution-item">
                      <strong>Respuesta correcta:</strong>
                      <div className="solution-answer">{exercise.correctAnswer}</div>
                    </div>
                    
                    {exercise.explanation && (
                      <div className="solution-item">
                        <strong>Explicación:</strong>
                        <div className="solution-explanation">{exercise.explanation}</div>
                      </div>
                    )}
                    
                    {exercise.alternativeAnswers.length > 0 && (
                      <div className="solution-item">
                        <strong>Respuestas alternativas:</strong>
                        <div className="alternative-answers">
                          {exercise.alternativeAnswers.map((alt, index) => (
                            <span key={index} className="alt-answer">{alt}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {exercise.hints.length > 0 && (
                  <div className="exercise-details-section">
                    <h5>💡 Pistas disponibles</h5>
                    <div className="hints-list">
                      {exercise.hints.map((hint, index) => (
                        <div key={index} className="hint-item">
                          <strong>Pista {index + 1}:</strong> {hint}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="exercise-details-section">
                  <h5>📊 Estadísticas detalladas</h5>
                  <div className="detailed-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total de intentos:</span>
                      <span className="stat-value">{exercise.stats.totalAttempts}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Intentos correctos:</span>
                      <span className="stat-value">{exercise.stats.correctAttempts}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tasa de éxito:</span>
                      <span className="stat-value">{exercise.stats.successRate}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tiempo promedio:</span>
                      <span className="stat-value">{formatTime(exercise.stats.avgTimeSeconds)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="no-exercises">
          <p>No se encontraron ejercicios que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}

export default PresenterGuide;