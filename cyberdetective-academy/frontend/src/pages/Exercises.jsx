import { useState, useEffect } from 'react';
import ExerciseCard from '../components/exercises/ExerciseCard';
import exerciseService from '../services/exerciseService';
import toast from 'react-hot-toast';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [exercisesData, progressData] = await Promise.all([
        exerciseService.getAllExercises(),
        exerciseService.getUserProgress()
      ]);
      
      setExercises(exercisesData.exercises);
      setProgress(progressData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedExercises = exercises.sort((a, b) => a.difficulty - b.difficulty);


  const getProgressStats = () => {
    if (!progress) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = progress.completed_exercises;
    const total = progress.total_exercises;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando ejercicios...</p>
      </div>
    );
  }

  const stats = getProgressStats();

  return (
    <div className="exercises">
      <div className="exercises-header">
        <h1>🎯 Ejercicios</h1>
        <p>Pon a prueba tus habilidades de detective digital</p>
        
        {progress && (
          <div className="progress-overview">
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-value">{stats.completed}</span>
                <span className="stat-label">Completados</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">{progress.total_points}</span>
                <span className="stat-label">Puntos</span>
              </div>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{stats.percentage}% Completado</span>
          </div>
        )}
      </div>


      <div className="exercises-content">
        {sortedExercises.length === 0 ? (
          <div className="no-exercises">
            <h2>📋 No hay ejercicios disponibles</h2>
            <p>Aún no hay ejercicios cargados en el sistema.</p>
          </div>
        ) : (
          <div className="exercises-grid">
            {sortedExercises.map(exercise => (
              <ExerciseCard 
                key={exercise.id} 
                exercise={exercise}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exercises;