import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import exerciseService from '../../services/exerciseService';
import toast from 'react-hot-toast';

const ExercisePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUserPoints } = useAuth();
  
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHints, setCurrentHints] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [attemptInfo, setAttemptInfo] = useState({
    total_attempts: 0,
    remaining_attempts: 3,
    can_attempt: true,
    max_attempts: 3
  });
  
  const timerRef = useRef(null);

  useEffect(() => {
    loadExercise();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (exercise && exercise.time_limit && !exercise.completed && !startTime) {
      setTimeLeft(exercise.time_limit);
      setStartTime(Date.now());
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [exercise, startTime]);

  const loadExercise = async () => {
    try {
      const data = await exerciseService.getExerciseById(id);
      setExercise(data.exercise);
      
      // Actualizar información de intentos
      if (data.exercise.attempt_info) {
        setAttemptInfo(data.exercise.attempt_info);
      }
      
      if (data.exercise.completed) {
        setAnswer(data.exercise.user_answer || '');
        setShowResult(true);
        setResult({
          correct: true,
          points_earned: data.exercise.points_earned,
          explanation: 'Ya completaste este ejercicio correctamente.'
        });
      } else if (!data.exercise.attempt_info.can_attempt) {
        // Obtener la explicación correcta del ejercicio
        try {
          const solutionResponse = await exerciseService.getSolution(id);
          setShowResult(true);
          setResult({
            correct: false,
            points_earned: 0,
            explanation: solutionResponse.explanation || 'Ya no tienes más intentos disponibles para este ejercicio.',
            correct_answer: solutionResponse.correct_answer,
            is_failed: true
          });
        } catch (error) {
          setShowResult(true);
          setResult({
            correct: false,
            points_earned: 0,
            explanation: 'Ya no tienes más intentos disponibles para este ejercicio.',
            is_failed: true
          });
        }
      }
    } catch (error) {
      toast.error(error.message);
      navigate('/exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    toast.error('⏰ ¡Se acabó el tiempo! Se mostrará la respuesta correcta.');
    handleSubmit(true);
  };

  const handleSubmit = async (timeUp = false) => {
    if (!answer.trim() && !timeUp) {
      toast.error('Por favor ingresa una respuesta');
      return;
    }

    setSubmitting(true);
    
    try {
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const response = await exerciseService.submitAnswer(
        id, 
        timeUp ? 'TIEMPO_AGOTADO' : answer, 
        timeTaken, 
        hintsUsed
      );
      
      setResult(response);
      setShowResult(true);
      
      // Actualizar información de intentos
      if (response.attempt_info) {
        setAttemptInfo(response.attempt_info);
      }
      
      if (response.correct) {
        toast.success(`¡Correcto! +${response.points_earned} puntos`);
        updateUserPoints(response.points_earned);
      } else {
        if (response.is_timeout) {
          // No mostrar toast adicional para timeout, ya se mostró arriba
        } else {
          const remaining = response.attempt_info?.remaining_attempts || 0;
          if (remaining > 0) {
            toast.error(`Respuesta incorrecta. Te quedan ${remaining} intentos.`);
          } else {
            toast.error('Respuesta incorrecta. Ya no tienes más intentos.');
          }
        }
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    try {
      const hintData = await exerciseService.getHint(id, hintsUsed);
      setCurrentHints([...currentHints, hintData.hint]);
      setHintsUsed(hintsUsed + 1);
      toast.info(`Pista obtenida (-${hintData.points_penalty} puntos)`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAttemptMultiplier = (attemptNumber) => {
    switch (attemptNumber) {
      case 1: return 1.0;    // 100%
      case 2: return 0.75;   // 75%
      case 3: return 0.50;   // 50%
      default: return 0;     // 0% para intentos adicionales
    }
  };

  const getDefaultPlaceholder = (exercise) => {
    const data = exercise.problem_data;
    const question = data?.question?.toLowerCase() || '';
    const category = exercise.category?.toLowerCase() || '';
    
    // Placeholders específicos basados en el contenido
    if (question.includes('zona') && question.includes('horario')) {
      return 'Ej: Centro, 22:00-02:00, viernes';
    } else if (question.includes('ip') || category.includes('redes')) {
      return 'Ej: 192.168.1.100 o dirección IP completa';
    } else if (question.includes('bitcoin') || question.includes('billetera') || category.includes('blockchain')) {
      return 'Ej: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (dirección completa)';
    } else if (question.includes('líder') || question.includes('miembro')) {
      return 'Ej: A, B, C (identificador del nodo)';
    } else if (question.includes('transacción') && question.includes('id')) {
      return 'Ej: T001, T002 (ID de transacción)';
    } else if (question.includes('documento') || question.includes('falso')) {
      return 'Ej: DOC001, DOC002 (ID del documento)';
    } else if (question.includes('email') || question.includes('phishing')) {
      return 'Ej: Email 1, Email 2 (número de email)';
    } else if (question.includes('patrón') || question.includes('lavado')) {
      return 'Ej: Estructuración, Smurfing (tipo de patrón)';
    }
    
    return 'Ingresa tu respuesta aquí...';
  };

  const renderProblemData = () => {
    if (!exercise?.problem_data) return null;

    const data = exercise.problem_data;

    switch (exercise.type) {
      case 'multiple_choice':
        return (
          <div className="problem-content">
            <h4>{data.question}</h4>
            
            {data.context && (
              <div className="context-section">
                <p><strong>Contexto:</strong> {data.context}</p>
              </div>
            )}
            
            {data.dataset_sample && (
              <div className="data-display">
                <h5>Muestra del Dataset:</h5>
                <pre>{JSON.stringify(data.dataset_sample, null, 2)}</pre>
              </div>
            )}
            
            {data.transaction && (
              <div className="data-display">
                <h5>Registro de Transacción:</h5>
                <pre>{JSON.stringify(data.transaction, null, 2)}</pre>
              </div>
            )}
            {data.emails && (
              <div className="emails-display">
                {data.emails.map((email, index) => (
                  <div key={index} className="email-item">
                    <h5>Email {index + 1}</h5>
                    <p><strong>De:</strong> {email.from}</p>
                    <p><strong>Asunto:</strong> {email.subject}</p>
                    <p><strong>URL:</strong> {email.url}</p>
                  </div>
                ))}
              </div>
            )}
            
            {data.routes && (
              <div className="data-display">
                <h5>🚚 Análisis de Rutas de Transporte:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID Ruta</th>
                      <th>Origen</th>
                      <th>Destino</th>
                      <th>Frecuencia</th>
                      <th>Horario</th>
                      <th>Tipo de Carga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.routes.map((route, index) => {
                      const isSuspicious = route.time.includes('02:00') || route.time.includes('03:00') || route.time.includes('04:00');
                      const isFrequentNight = route.frequency === '3x semana' && isSuspicious;
                      const isBorderRoute = route.origin.includes('Frontera');
                      
                      return (
                        <tr key={index} className={`${isSuspicious ? 'suspicious-time' : ''} ${isFrequentNight ? 'high-risk' : ''} ${isBorderRoute ? 'border-route' : ''}`}>
                          <td><strong>{route.id}</strong></td>
                          <td className={isBorderRoute ? 'border-origin' : ''}>{route.origin}</td>
                          <td>{route.destination}</td>
                          <td className={isFrequentNight ? 'suspicious-frequency' : ''}>{route.frequency}</td>
                          <td className={isSuspicious ? 'night-time' : ''}>{route.time}</td>
                          <td>{route.cargo}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                <div className="route-analysis-legend">
                  <h6>🔍 Indicadores de Riesgo:</h6>
                  <ul>
                    <li>🌙 <strong>Horarios nocturnos (02:00-04:00):</strong> Evitan controles</li>
                    <li>🚧 <strong>Rutas fronterizas:</strong> Puntos de entrada común</li>
                    <li>🔄 <strong>Frecuencia irregular:</strong> Patrones evasivos</li>
                    <li>📦 <strong>Carga genérica:</strong> Puede ocultar sustancias</li>
                  </ul>
                </div>
              </div>
            )}

            {data.videos && (
              <div className="data-display">
                <h5>🎬 Análisis Forense de Videos:</h5>
                <div className="videos-analysis-grid">
                  {data.videos.map((video, index) => {
                    const hasIrregularBlinking = video.visual_analysis.includes('irregular');
                    const hasBlurryEdges = video.visual_analysis.includes('borroso');
                    const hasLowFrameRate = video.metadata.fps < 30;
                    const isDeepfakeSuspicious = hasIrregularBlinking || hasBlurryEdges;
                    
                    return (
                      <div key={index} className={`video-analysis-card ${isDeepfakeSuspicious ? 'suspicious-video' : 'normal-video'}`}>
                        <div className="video-header">
                          <h6>📹 {video.id}</h6>
                        </div>
                        
                        <div className="technical-specs">
                          <h6>📊 Especificaciones Técnicas:</h6>
                          <div className="specs-grid">
                            <div className="spec-item">
                              <span className="spec-label">FPS:</span>
                              <span className={`spec-value ${hasLowFrameRate ? 'unusual-spec' : ''}`}>
                                {video.metadata.fps}
                              </span>
                            </div>
                            <div className="spec-item">
                              <span className="spec-label">Resolución:</span>
                              <span className="spec-value">{video.metadata.resolution}</span>
                            </div>
                            <div className="spec-item">
                              <span className="spec-label">Compresión:</span>
                              <span className="spec-value">{video.metadata.compression}</span>
                            </div>
                            <div className="spec-item">
                              <span className="spec-label">Tamaño:</span>
                              <span className="spec-value">{video.metadata.file_size}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="forensic-analysis">
                          <h6>🔍 Análisis Forense Visual:</h6>
                          <div className={`analysis-text ${isDeepfakeSuspicious ? 'suspicious-analysis' : 'normal-analysis'}`}>
                            <p>{video.visual_analysis}</p>
                          </div>
                          
                          {hasIrregularBlinking && (
                            <div className="detection-alert">
                              <span className="alert-icon">🚨</span>
                              <span>Patrón de parpadeo anómalo detectado</span>
                            </div>
                          )}
                          
                          {hasBlurryEdges && (
                            <div className="detection-alert">
                              <span className="alert-icon">🚨</span>
                              <span>Bordes faciales inconsistentes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="deepfake-detection-guide">
                  <h6>🎯 Indicadores de Deepfake:</h6>
                  <div className="indicators-grid">
                    <div className="indicator-category">
                      <h6>👁️ Comportamiento Ocular:</h6>
                      <ul>
                        <li>Parpadeo irregular o ausente</li>
                        <li>Movimientos oculares no naturales</li>
                        <li>Falta de sincronización entre ojos</li>
                      </ul>
                    </div>
                    <div className="indicator-category">
                      <h6>👄 Sincronización Labial:</h6>
                      <ul>
                        <li>Desajuste audio-video</li>
                        <li>Movimientos labiales extraños</li>
                        <li>Transiciones bruscas</li>
                      </ul>
                    </div>
                    <div className="indicator-category">
                      <h6>🎭 Bordes y Texturas:</h6>
                      <ul>
                        <li>Bordes faciales borrosos</li>
                        <li>Cambios de color de piel</li>
                        <li>Inconsistencias en iluminación</li>
                      </ul>
                    </div>
                    <div className="indicator-category">
                      <h6>📱 Metadatos Técnicos:</h6>
                      <ul>
                        <li>Compresión inusual</li>
                        <li>Resolución inconsistente</li>
                        <li>Frame rate anómalo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {data.network_data && (
              <div className="data-display">
                <h5>📊 Análisis de Red Criminal:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Miembro</th>
                      <th>Conexiones</th>
                      <th>Llamadas Hechas</th>
                      <th>Llamadas Recibidas</th>
                      <th>Ratio Recibidas/Hechas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.network_data.nodes.map((node, index) => {
                      const ratio = node.calls_made > 0 ? (node.calls_received / node.calls_made).toFixed(1) : '∞';
                      const isHighConnections = node.connections >= 10;
                      const isHighReceived = node.calls_received >= 50;
                      
                      return (
                        <tr key={index} className={`${isHighConnections ? 'high-connections' : ''} ${isHighReceived ? 'high-received' : ''}`}>
                          <td><strong>{node.id}</strong></td>
                          <td className="connections-count">{node.connections}</td>
                          <td>{node.calls_made}</td>
                          <td className="calls-received">{node.calls_received}</td>
                          <td className="ratio-value">{ratio}:1</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {data.network_data.communications && (
                  <div className="network-analysis">
                    <h6>📈 Análisis de Patrones:</h6>
                    <p>{data.network_data.communications}</p>
                  </div>
                )}
              </div>
            )}
            
            {data.data_hints && (
              <div className="hints-section">
                <h5>💡 Pistas para el análisis:</h5>
                <ul>
                  {data.data_hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="options-container">
              {data.options && data.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${answer === (typeof option === 'object' ? option.id : option) ? 'selected' : ''}`}
                  onClick={() => setAnswer(typeof option === 'object' ? option.id : option)}
                  disabled={showResult}
                >
                  {typeof option === 'object' ? `${option.id}) ${option.text}` : option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'data_analysis':
        return (
          <div className="problem-content">
            <h4>{data.question}</h4>
            
            {data.context && (
              <div className="context-section">
                <p><strong>Contexto:</strong> {data.context}</p>
              </div>
            )}
            
            {data.historical_data && (
              <div className="data-display">
                <h5>📊 Datos Históricos de Robos:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Zona</th>
                      <th>Horario</th>
                      <th>Día</th>
                      <th>Cantidad de Robos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.historical_data.map((record, index) => (
                      <tr key={index} className={record.robberies >= 10 ? 'high-risk' : ''}>
                        <td><strong>{record.zone}</strong></td>
                        <td>{record.time}</td>
                        <td>{record.day}</td>
                        <td className="robberies-count">{record.robberies} robos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {data.current_conditions && (
              <div className="current-conditions">
                <h5>🎯 Condiciones Actuales:</h5>
                <div className="conditions-box">
                  <p>{data.current_conditions}</p>
                </div>
              </div>
            )}
            
            {data.transactions && (
              <div className="data-display">
                <h5>Transacciones:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Monto</th>
                      <th>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx, index) => (
                      <tr key={index}>
                        <td>{tx.id}</td>
                        <td>${tx.amount}</td>
                        <td>{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data.connections && (
              <div className="data-display">
                <h5>Log de Conexiones:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>IP</th>
                      <th>Intentos</th>
                      <th>Éxitos</th>
                      <th>Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.connections.map((conn, index) => (
                      <tr key={index}>
                        <td>{conn.ip}</td>
                        <td>{conn.attempts}</td>
                        <td>{conn.success}</td>
                        <td>{conn.time_span}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data.network && (
              <div className="data-display">
                <h5>Red Criminal:</h5>
                <div className="network-nodes">
                  {data.network.nodes.map((node, index) => (
                    <div key={index} className="network-node">
                      <strong>Nodo {node.id}</strong>
                      <p>Conexiones: {node.connections}</p>
                      <p>Transacciones: ${node.transactions.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {data.network_data && (
              <div className="data-display">
                <h5>📊 Análisis de Red Criminal:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Miembro</th>
                      <th>Conexiones</th>
                      <th>Llamadas Hechas</th>
                      <th>Llamadas Recibidas</th>
                      <th>Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.network_data.nodes.map((node, index) => {
                      const ratio = node.calls_made > 0 ? (node.calls_received / node.calls_made).toFixed(1) : '∞';
                      const isHighConnections = node.connections >= 10;
                      const isHighReceived = node.calls_received >= 50;
                      
                      return (
                        <tr key={index} className={`${isHighConnections ? 'high-connections' : ''} ${isHighReceived ? 'high-received' : ''}`}>
                          <td><strong>{node.id}</strong></td>
                          <td className="connections-count">{node.connections}</td>
                          <td>{node.calls_made}</td>
                          <td className="calls-received">{node.calls_received}</td>
                          <td className="ratio-value">{ratio}:1</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {data.network_data.communications && (
                  <div className="network-analysis">
                    <h6>📈 Análisis de Patrones:</h6>
                    <p>{data.network_data.communications}</p>
                  </div>
                )}
              </div>
            )}
            {data.blockchain && (
              <div className="data-display">
                <h5>Cadena de Transacciones Bitcoin:</h5>
                <div className="blockchain-chain">
                  {data.blockchain.transactions.map((tx, index) => (
                    <div key={index} className="blockchain-tx">
                      <p><strong>Transacción {index + 1}</strong></p>
                      <p><strong>De:</strong> {tx.from}</p>
                      <p><strong>Para:</strong> {tx.to}</p>
                      <p><strong>Cantidad:</strong> {tx.amount} BTC</p>
                      {index < data.blockchain.transactions.length - 1 && (
                        <div className="blockchain-arrow">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.companies && (
              <div className="data-display">
                <h5>🏢 Empresas:</h5>
                {data.companies.map((company, index) => (
                  <div key={index} className="company-card">
                    <h6>{company.name}</h6>
                    <p><strong>Empleados:</strong> {company.employees}</p>
                    <p><strong>Ingresos:</strong> {company.revenue}</p>
                    <p><strong>Transacciones:</strong> {company.transactions}</p>
                    <p><strong>Oficina:</strong> {company.office}</p>
                    <p><strong>Website:</strong> {company.website}</p>
                  </div>
                ))}
              </div>
            )}


            {data.crime_sequence && (
              <div className="data-display">
                <h5>🔍 Secuencia del Crimen:</h5>
                <div className="crime-timeline">
                  {data.crime_sequence.map((event, index) => (
                    <div key={index} className="crime-event">
                      <div className="event-number">{event.order || index + 1}</div>
                      <div className="event-details">
                        {event.date && <p><strong>Fecha:</strong> {event.date}</p>}
                        {event.crime && <p><strong>Crimen:</strong> {event.crime}</p>}
                        {event.target && <p><strong>Objetivo:</strong> {event.target}</p>}
                        {event.purpose && <p><strong>Propósito:</strong> {event.purpose}</p>}
                        {event.time && <p><strong>Hora:</strong> {event.time}</p>}
                        {event.location && <p><strong>Ubicación:</strong> {event.location}</p>}
                        {event.action && <p><strong>Acción:</strong> {event.action}</p>}
                        {event.description && <p><strong>Descripción:</strong> {event.description}</p>}
                        {event.evidence && <p><strong>Evidencia:</strong> {event.evidence}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.next_targets && (
              <div className="data-display">
                <h5>🎯 Próximos Objetivos:</h5>
                <div className="targets-list">
                  {data.next_targets.map((target, index) => (
                    <div key={index} className="target-card">
                      <h6>{typeof target === 'string' ? target : (target.name || target.id)}</h6>
                      {target.location && <p><strong>Ubicación:</strong> {target.location}</p>}
                      {target.value && <p><strong>Valor:</strong> {target.value}</p>}
                      {target.security && <p><strong>Seguridad:</strong> {target.security}</p>}
                      {target.risk && <p><strong>Riesgo:</strong> {target.risk}</p>}
                      {target.probability && <p><strong>Probabilidad:</strong> {target.probability}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.transaction_data && (
              <div className="data-display">
                <h5>💳 Datos de Transacciones:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Monto</th>
                      <th>Hora</th>
                      <th>Ubicación</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transaction_data.map((tx, index) => (
                      <tr key={index}>
                        <td><strong>{tx.id}</strong></td>
                        <td>{tx.amount < 0 ? `${tx.amount}` : `$${tx.amount.toLocaleString()}`}</td>
                        <td>{tx.time}</td>
                        <td>{tx.location}</td>
                        <td>{
                          tx.type === 'Purchase' ? 'Compra' : 
                          tx.type === 'Withdrawal' || tx.type === 'withdrawal' ? 'Retiro' : 
                          tx.type === 'Deposit' || tx.type === 'deposit' ? 'Depósito' : 
                          tx.type === 'Transfer' || tx.type === 'transfer' ? 'Transferencia' : 
                          tx.type
                        }</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.purchases && (
              <div className="data-display">
                <h5>🛒 Órdenes de Compra:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Productos</th>
                      <th>Envío</th>
                      <th>Facturación</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.purchases.map((purchase, index) => (
                      <tr key={index}>
                        <td><strong>{purchase.order}</strong></td>
                        <td>{purchase.items}</td>
                        <td>{purchase.shipping}</td>
                        <td>{purchase.billing}</td>
                        <td>{purchase.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.crime_scenes && (
              <div className="data-display">
                <h5>🏠 Escenas del Crimen:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Crimen</th>
                      <th>Método</th>
                      <th>Hora</th>
                      <th>Objetos Robados</th>
                      <th>Evidencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.crime_scenes.map((scene, index) => (
                      <tr key={index}>
                        <td><strong>{scene.id}</strong></td>
                        <td>{scene.crime}</td>
                        <td>{scene.method}</td>
                        <td>{scene.time}</td>
                        <td>{scene.items}</td>
                        <td>{scene.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.communication_network && (
              <div className="data-display">
                <h5>📡 Análisis de Red de Comunicaciones:</h5>
                <div className="network-instructions">
                  <p><strong>📋 Instrucciones de análisis:</strong></p>
                  <ul>
                    <li><strong>Líder:</strong> Muchos contactos locales + Pocos/cero llamadas internacionales (evita detección)</li>
                    <li><strong>Operativos:</strong> Muchas llamadas internacionales (coordinación con otras células)</li>
                    <li><strong>Cifrado:</strong> Indica actividad sospechosa (mayor número = más sospechoso)</li>
                  </ul>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nodo</th>
                      <th>Contactos Locales</th>
                      <th>Mensajes Cifrados</th>
                      <th>Llamadas Internacionales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.communication_network.nodes.map((node, index) => (
                      <tr key={index}>
                        <td><strong>{node.id}</strong></td>
                        <td>{node.contacts}</td>
                        <td>{node.encrypted_msgs}</td>
                        <td>{node.international_calls}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.communication_network.connections && (
                  <div className="connections-info">
                    <h6>🔗 Patrones de Comunicación:</h6>
                    {data.communication_network.connections.map((conn, index) => (
                      <p key={index}>
                        <strong>{conn.from}</strong> ↔ <strong>{conn.to}</strong> 
                        <span className="frequency-badge">
                          {conn.frequency === 'daily' ? ' (Diario - Alta coordinación)' : 
                           conn.frequency === 'weekly' ? ' (Semanal - Coordinación regular)' : 
                           conn.frequency === 'rare' ? ' (Esporádico - Contacto mínimo)' : 
                           ` (${conn.frequency})`}
                        </span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'metadata_analysis':
        return (
          <div className="problem-content">
            <h4>{data.question}</h4>
            <div className="data-display">
              <h5>Metadatos de Documentos:</h5>
              <div className="documents-grid">
                {data.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <h6>{doc.id}</h6>
                    <p><strong>Creado:</strong> {doc.created}</p>
                    <p><strong>Modificado:</strong> {doc.modified}</p>
                    <p><strong>Tamaño:</strong> {doc.size}</p>
                    <p><strong>Hash:</strong> {doc.hash}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'text_input':
        return (
          <div className="problem-content">
            <h4>{data.question}</h4>
            
            {data.context && (
              <div className="context-section">
                <p><strong>Contexto:</strong> {data.context}</p>
              </div>
            )}
            
            {data.historical_data && (
              <div className="data-display">
                <h5>📊 Datos Históricos de Robos:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Zona</th>
                      <th>Horario</th>
                      <th>Día</th>
                      <th>Cantidad de Robos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.historical_data.map((record, index) => (
                      <tr key={index} className={record.robberies >= 10 ? 'high-risk' : ''}>
                        <td><strong>{record.zone}</strong></td>
                        <td>{record.time}</td>
                        <td>{record.day}</td>
                        <td className="robberies-count">{record.robberies} robos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {data.current_conditions && (
              <div className="current-conditions">
                <h5>🎯 Condiciones Actuales:</h5>
                <div className="conditions-box">
                  <p>{data.current_conditions}</p>
                </div>
              </div>
            )}
            
            {data.transactions && (
              <div className="data-display">
                <h5>💰 Transacciones:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Monto</th>
                      <th>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx, index) => (
                      <tr key={index}>
                        <td><strong>{tx.id}</strong></td>
                        <td>{tx.amount}</td>
                        <td>{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.contracts && (
              <div className="data-display">
                <h5>📋 Smart Contracts:</h5>
                {data.contracts.map((contract, index) => (
                  <div key={index} className="contract-card">
                    <h6>Plataforma {contract.address}</h6>
                    <p><strong>Descripción:</strong> {contract.description}</p>
                    {contract.functions && (
                      <div>
                        <p><strong>Funciones disponibles:</strong></p>
                        <ul className="functions-list">
                          {contract.functions.map((func, idx) => (
                            <li key={idx}><code>{func}</code></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.atm_withdrawals && (
              <div className="data-display">
                <h5>🏧 Retiros de Cajero:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tarjeta</th>
                      <th>Hora</th>
                      <th>Monto</th>
                      <th>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.atm_withdrawals.map((withdrawal, index) => (
                      <tr key={index}>
                        <td><strong>{withdrawal.card}</strong></td>
                        <td>{withdrawal.time}</td>
                        <td>{withdrawal.amount}</td>
                        <td>{withdrawal.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.nft_transfers && (
              <div className="data-display">
                <h5>🖼️ Transferencias de NFT:</h5>
                <div className="nft-chain">
                  {data.nft_transfers.map((transfer, index) => (
                    <div key={index} className="nft-transfer">
                      <p><strong>Transferencia {index + 1}</strong></p>
                      <p><strong>De:</strong> {transfer.from}</p>
                      <p><strong>Para:</strong> {transfer.to}</p>
                      <p><strong>Fecha:</strong> {transfer.timestamp}</p>
                      {transfer.price && <p><strong>Precio:</strong> {transfer.price}</p>}
                      {transfer.note && <p><strong>Nota:</strong> {transfer.note}</p>}
                      {index < data.nft_transfers.length - 1 && (
                        <div className="blockchain-arrow">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.purchases && (
              <div className="data-display">
                <h5>🛒 Órdenes de Compra:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Productos</th>
                      <th>Envío</th>
                      <th>Facturación</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.purchases.map((purchase, index) => (
                      <tr key={index}>
                        <td><strong>{purchase.order}</strong></td>
                        <td>{purchase.items}</td>
                        <td>{purchase.shipping}</td>
                        <td>{purchase.billing}</td>
                        <td>{purchase.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.accounts && (
              <div className="data-display">
                <h5>👥 Cuentas de Redes Sociales:</h5>
                {data.accounts.map((account, index) => (
                  <div key={index} className="account-card">
                    <h6>{account.username}</h6>
                    <p><strong>Seguidores:</strong> {account.followers?.toLocaleString()}</p>
                    <p><strong>Siguiendo:</strong> {account.following?.toLocaleString()}</p>
                    <p><strong>Posts:</strong> {account.posts?.toLocaleString()}</p>
                    <p><strong>Creada:</strong> {account.created}</p>
                    <p><strong>Actividad:</strong> {account.activity}</p>
                  </div>
                ))}
              </div>
            )}

            {data.companies && (
              <div className="data-display">
                <h5>🏢 Empresas:</h5>
                {data.companies.map((company, index) => (
                  <div key={index} className="company-card">
                    <h6>{company.name}</h6>
                    <p><strong>Empleados:</strong> {company.employees}</p>
                    <p><strong>Ingresos:</strong> {company.revenue}</p>
                    <p><strong>Transacciones:</strong> {company.transactions}</p>
                    <p><strong>Oficina:</strong> {company.office}</p>
                    <p><strong>Website:</strong> {company.website}</p>
                  </div>
                ))}
              </div>
            )}

            {data.criminal_records && (
              <div className="data-display">
                <h5>📋 Registros Criminales:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nacimiento</th>
                      <th>Fecha Crimen</th>
                      <th>Fecha Arresto</th>
                      <th>Fecha Sentencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.criminal_records.map((record, index) => (
                      <tr key={index}>
                        <td><strong>{record.id}</strong></td>
                        <td>{record.birth_date}</td>
                        <td>{record.crime_date}</td>
                        <td>{record.arrest_date}</td>
                        <td>{record.sentence_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.suspects && (
              <div className="data-display">
                <h5>🕵️ Sospechosos:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>Teléfono</th>
                      <th>Dirección</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.suspects.map((suspect, index) => (
                      <tr key={index}>
                        <td><strong>{suspect.id}</strong></td>
                        <td>{suspect.name}</td>
                        <td>{suspect.dni}</td>
                        <td>{suspect.phone}</td>
                        <td>{suspect.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.contacts && (
              <div className="data-display">
                <h5>📞 Datos de Contacto:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contacts.map((contact, index) => (
                      <tr key={index}>
                        <td><strong>{contact.id}</strong></td>
                        <td>{contact.name}</td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.transaction_data && (
              <div className="data-display">
                <h5>💳 Datos de Transacciones:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Monto</th>
                      <th>Hora</th>
                      <th>Ubicación</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transaction_data.map((tx, index) => (
                      <tr key={index}>
                        <td><strong>{tx.id}</strong></td>
                        <td>{tx.amount < 0 ? `${tx.amount}` : `$${tx.amount.toLocaleString()}`}</td>
                        <td>{tx.time}</td>
                        <td>{tx.location}</td>
                        <td>{
                          tx.type === 'Purchase' ? 'Compra' : 
                          tx.type === 'Withdrawal' || tx.type === 'withdrawal' ? 'Retiro' : 
                          tx.type === 'Deposit' || tx.type === 'deposit' ? 'Depósito' : 
                          tx.type === 'Transfer' || tx.type === 'transfer' ? 'Transferencia' : 
                          tx.type
                        }</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.digital_evidence && (
              <div className="data-display">
                <h5>🔍 Evidencia Digital:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Hash</th>
                      <th>Timestamp</th>
                      <th>Tamaño</th>
                      <th>Cadena Custodia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.digital_evidence.map((evidence, index) => (
                      <tr key={index} className={evidence.hash === 'corrupted' || evidence.timestamp.includes('1990') || evidence.size === '0MB' || evidence.chain_custody === 'Incompleta' ? 'high-risk' : ''}>
                        <td><strong>{evidence.id}</strong></td>
                        <td>{evidence.type}</td>
                        <td>{evidence.hash}</td>
                        <td>{evidence.timestamp}</td>
                        <td>{evidence.size}</td>
                        <td>{evidence.chain_custody}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.arrest_records && (
              <div className="data-display">
                <h5>🚔 Registros de Arrestos:</h5>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Edad</th>
                      <th>Crimen</th>
                      <th>Fecha</th>
                      <th>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.arrest_records.map((record, index) => (
                      <tr key={index}>
                        <td><strong>{record.id}</strong></td>
                        <td>{record.name}</td>
                        <td>{record.age}</td>
                        <td>{record.crime}</td>
                        <td>{record.date}</td>
                        <td>{record.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.crime_sequence && (
              <div className="data-display">
                <h5>📈 Secuencia Criminal:</h5>
                <div className="crime-sequence">
                  {data.crime_sequence.map((crime, index) => (
                    <div key={index} className="crime-step">
                      <div className="step-number">{crime.order}</div>
                      <div className="step-content">
                        <h6>{crime.crime}</h6>
                        <p><strong>Fecha:</strong> {crime.date}</p>
                        <p><strong>Objetivo:</strong> {crime.target}</p>
                        <p><strong>Propósito:</strong> {crime.purpose}</p>
                      </div>
                      {index < data.crime_sequence.length - 1 && (
                        <div className="sequence-arrow">↓</div>
                      )}
                    </div>
                  ))}
                </div>
                {data.next_targets && (
                  <div className="next-targets">
                    <h6>🎯 Posibles Próximos Objetivos:</h6>
                    <ul>
                      {data.next_targets.map((target, index) => (
                        <li key={index}>{target}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {data.blockchain && (
              <div className="data-display">
                <h5>🔗 Cadena de Transacciones Bitcoin:</h5>
                <div className="blockchain-chain">
                  {data.blockchain.transactions.map((tx, index) => (
                    <div key={index} className="blockchain-tx">
                      <p><strong>Transacción {index + 1}</strong></p>
                      <p><strong>De:</strong> {tx.from}</p>
                      <p><strong>Para:</strong> {tx.to}</p>
                      <p><strong>Cantidad:</strong> {tx.amount} BTC</p>
                      {index < data.blockchain.transactions.length - 1 && (
                        <div className="blockchain-arrow">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="problem-content">
            <h4>{data.question}</h4>
            {data.context && <p><strong>Contexto:</strong> {data.context}</p>}
            <div className="data-display">
              <h5>Datos del ejercicio:</h5>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando ejercicio...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="error-container">
        <h2>Ejercicio no encontrado</h2>
        <button onClick={() => navigate('/exercises')}>
          Volver a Ejercicios
        </button>
      </div>
    );
  }

  return (
    <div className="exercise-player">
      <div className="exercise-header">
        <button className="back-button" onClick={() => navigate('/exercises')}>
          ← Volver
        </button>
        
        <div className="exercise-info">
          <h1>{exercise.title}</h1>
          <p>{exercise.description}</p>
          <div className="exercise-meta">
            <span className="level-badge">Nivel {exercise.level}</span>
            <span className="points-badge">
              {exercise.points} puntos
              {attemptInfo.total_attempts > 0 && (
                <span className="points-multiplier">
                  ({Math.round(exercise.points * getAttemptMultiplier(attemptInfo.total_attempts + 1))} pts en este intento)
                </span>
              )}
            </span>
            <span className="category-badge">{exercise.category}</span>
          </div>
          
          {/* Información de intentos */}
          <div className="attempt-info">
            <div className="attempt-indicator">
              <span className="attempt-text">
                Intento {attemptInfo.total_attempts + 1} de {attemptInfo.max_attempts}
              </span>
              <div className="attempt-dots">
                {[...Array(attemptInfo.max_attempts)].map((_, index) => (
                  <span 
                    key={index} 
                    className={`attempt-dot ${
                      index < attemptInfo.total_attempts ? 'used' : 
                      index === attemptInfo.total_attempts ? 'current' : 'remaining'
                    }`}
                  >
                    {index < attemptInfo.total_attempts ? '❌' : 
                     index === attemptInfo.total_attempts ? '🎯' : '⚪'}
                  </span>
                ))}
              </div>
            </div>
            {attemptInfo.remaining_attempts > 0 && !exercise.completed && (
              <div className="attempts-warning">
                <span className="warning-icon">⚠️</span>
                <span>Te quedan {attemptInfo.remaining_attempts} intentos</span>
              </div>
            )}
          </div>
        </div>

        {exercise.time_limit && !exercise.completed && (
          <div className={`timer ${timeLeft <= 30 ? 'danger' : ''}`}>
            <span className="timer-icon">⏰</span>
            <span className="timer-value">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="exercise-body">
        {/* Siempre mostrar los datos del problema */}
        <div className="problem-section">
          {renderProblemData()}
        </div>

        {!showResult && exercise.type !== 'multiple_choice' && (
          <div className="answer-section">
            <label htmlFor="answer">Tu respuesta:</label>
            {exercise.problem_data?.format_hint && (
              <div className="format-hint">
                <span className="hint-icon">💡</span>
                <span className="hint-text">{exercise.problem_data.format_hint}</span>
              </div>
            )}
            <input
              type="text"
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={exercise.problem_data?.input_placeholder || getDefaultPlaceholder(exercise)}
              disabled={submitting}
            />
          </div>
        )}

        {currentHints.length > 0 && (
          <div className="hints-section">
            <h4>💡 Pistas utilizadas:</h4>
            {currentHints.map((hint, index) => (
              <div key={index} className="hint-item">
                <span className="hint-number">{index + 1}.</span>
                <span className="hint-text">{hint}</span>
              </div>
            ))}
          </div>
        )}

        {showResult && (
          <div className={`result-section ${result.correct ? 'correct' : result.is_timeout ? 'timeout' : 'incorrect'}`}>
            <div className="result-header">
              <span className="result-icon">
                {result.correct ? '✅' : result.is_timeout ? '⏰' : '❌'}
              </span>
              <h3>
                {result.correct ? '¡Correcto!' : 
                 result.is_timeout ? '¡Tiempo Agotado!' : 'Incorrecto'}
              </h3>
            </div>
            
            <div className="result-details">
              <p><strong>Explicación:</strong> {result.explanation}</p>
              {result.points_earned > 0 && (
                <p><strong>Puntos obtenidos:</strong> {result.points_earned}</p>
              )}
              {result.is_timeout && (
                <div className="timeout-message">
                  <p><strong>⚠️ Se agotaron los 5 minutos</strong></p>
                  <p>No se otorgan puntos por timeout</p>
                </div>
              )}
              {!result.correct && result.correct_answer && attemptInfo.remaining_attempts === 0 && (
                <div className="correct-answer-display">
                  <p><strong>Respuesta correcta:</strong></p>
                  <div className="correct-answer-box">
                    {result.correct_answer}
                  </div>
                </div>
              )}
              
              {/* Botón para intentar de nuevo */}
              {!result.correct && attemptInfo.remaining_attempts > 0 && (
                <div className="retry-section">
                  <button 
                    className="retry-button"
                    onClick={() => {
                      setShowResult(false);
                      setAnswer('');
                      setResult(null);
                      if (exercise.time_limit) {
                        setTimeLeft(exercise.time_limit);
                        setStartTime(Date.now());
                        timerRef.current = setInterval(() => {
                          setTimeLeft(prev => {
                            if (prev <= 1) {
                              handleTimeUp();
                              return 0;
                            }
                            return prev - 1;
                          });
                        }, 1000);
                      }
                    }}
                  >
                    🔄 Intentar de nuevo ({attemptInfo.remaining_attempts} intentos restantes)
                  </button>
                  <p className="next-attempt-info">
                    Próximo intento: {Math.round(exercise.points * getAttemptMultiplier(attemptInfo.total_attempts + 1))} puntos máximos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!showResult && (
        <div className="exercise-footer">
          <div className="action-buttons">
            {exercise.hints && hintsUsed < exercise.hints.length && (
              <button 
                className="hint-button"
                onClick={handleGetHint}
                disabled={submitting}
              >
                💡 Obtener Pista (-2 pts)
              </button>
            )}
            
            <button
              className="submit-button"
              onClick={() => handleSubmit()}
              disabled={submitting || (!answer.trim() && exercise.type !== 'multiple_choice')}
            >
              {submitting ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>

          <div className="exercise-stats">
            <div className="stat">
              <span>🎯</span>
              <span>Pistas usadas: {hintsUsed}</span>
            </div>
            {startTime && (
              <div className="stat">
                <span>⏱️</span>
                <span>Tiempo transcurrido: {formatTime(Math.floor((Date.now() - startTime) / 1000))}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisePlayer;