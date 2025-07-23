import { useNavigate } from 'react-router-dom';

const ExerciseCard = ({ exercise, getDifficultyName, getDifficultyColor }) => {
  const navigate = useNavigate();

  const getLocalDifficultyName = (difficulty) => {
    if (getDifficultyName) return getDifficultyName(difficulty);
    const difficulties = {
      1: 'Muy Fácil',
      2: 'Fácil', 
      3: 'Medio',
      4: 'Difícil',
      5: 'Muy Difícil'
    };
    return difficulties[difficulty];
  };

  const getLocalDifficultyColor = (difficulty) => {
    if (getDifficultyColor) return getDifficultyColor(difficulty);
    const colors = {
      1: '#10b981', // verde
      2: '#22d3ee', // cyan
      3: '#f59e0b', // amarillo
      4: '#f97316', // naranja
      5: '#ef4444'  // rojo
    };
    return colors[difficulty] || '#6b7280';
  };

  const getDifficultyEmoji = (difficulty) => {
    const emojis = {
      1: '🟢',
      2: '🔵', 
      3: '🟡',
      4: '🟠',
      5: '🔴'
    };
    return emojis[difficulty] || '⚪';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryName = (category) => {
    const names = {
      data_cleaning: 'Limpieza',
      pattern_detection: 'Patrones',
      fraud_detection: 'Fraude',
      network_analysis: 'Redes',
      cybersecurity: 'Seguridad',
      blockchain_analysis: 'Blockchain',
      ai_analysis: 'IA'
    };
    return names[category] || category;
  };

  const handleStartExercise = () => {
    navigate(`/exercises/${exercise.id}`);
  };

  return (
    <div className={`exercise-card-compact ${exercise.completed ? 'completed' : exercise.failed ? 'failed' : ''}`}>
      <div className="exercise-header-compact">
        <div className="exercise-title-section">
          <h3 className="exercise-title-compact">{exercise.title}</h3>
          <div className="exercise-meta-inline">
            <span className="category-label">{getCategoryName(exercise.category)}</span>
            <span 
              className="difficulty-badge-compact"
              style={{ backgroundColor: getLocalDifficultyColor(exercise.difficulty) }}
            >
              {getDifficultyEmoji(exercise.difficulty)} {getLocalDifficultyName(exercise.difficulty)}
            </span>
            <span className="points-badge-compact">
              {exercise.points} pts
            </span>
          </div>
        </div>
      </div>

      <div className="exercise-content-compact">
        <p className="exercise-description-compact">{exercise.description}</p>
        
        <div className="exercise-stats-inline">
          <span className="stat-inline">
            ⏱️ {exercise.time_limit ? formatTime(exercise.time_limit) : '∞'}
          </span>
          
          {exercise.completed && (
            <>
              <span className="stat-inline success">
                ✅ {exercise.points_earned} pts
              </span>
              <span className="stat-inline">
                🏃 {exercise.time_taken ? formatTime(exercise.time_taken) : '--'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="exercise-footer-compact">
        <button 
          className={`exercise-button-compact ${exercise.completed ? 'review' : exercise.failed ? 'failed' : 'start'}`}
          onClick={handleStartExercise}
        >
          {exercise.completed ? 'Revisar' : exercise.failed ? 'Sin intentos' : 'Comenzar'}
        </button>
        
        {exercise.completed && (
          <span className="completion-indicator-compact">🏆</span>
        )}
        
        {exercise.failed && (
          <span className="completion-indicator-compact">❌</span>
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;