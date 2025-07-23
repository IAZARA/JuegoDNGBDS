const db = require('../db/connection');

class Exercise {
  static async findAll() {
    const query = `
      SELECT id, title, description, difficulty, points, category, type, 
             problem_data, time_limit, order_index
      FROM exercises 
      ORDER BY difficulty, order_index
    `;
    
    const result = await db.query(query);
    return result.rows;
  }
  
  static async findById(id) {
    const query = `
      SELECT id, title, description, difficulty, points, category, type,
             problem_data, solution_data, hints, time_limit
      FROM exercises 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
  
  static async findByDifficulty(difficulty) {
    const query = `
      SELECT id, title, description, difficulty, points, category, type,
             problem_data, time_limit, order_index
      FROM exercises 
      WHERE difficulty = $1
      ORDER BY order_index
    `;
    
    const result = await db.query(query, [difficulty]);
    return result.rows;
  }

  // Mantener método legacy para compatibilidad
  static async findByLevel(level) {
    return this.findByDifficulty(level);
  }
  
  static async validateAnswer(exerciseId, userAnswer) {
    const exercise = await this.findById(exerciseId);
    if (!exercise) return { isCorrect: false, explanation: 'Ejercicio no encontrado' };
    
    const solution = exercise.solution_data;
    let isCorrect = false;
    
    // Normalizar respuesta del usuario
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const correctAnswer = solution.correct_answer.toLowerCase().trim();
    
    // Validación según el tipo de ejercicio
    switch (exercise.type) {
      case 'multiple_choice':
        isCorrect = normalizedAnswer === correctAnswer;
        break;
        
      case 'data_analysis':
        // Para análisis de datos, puede aceptar múltiples respuestas válidas
        const validAnswers = solution.valid_answers || [correctAnswer];
        isCorrect = validAnswers.some(answer => 
          normalizedAnswer === answer.toLowerCase().trim()
        );
        break;
        
      case 'metadata_analysis':
        isCorrect = normalizedAnswer === correctAnswer;
        break;
        
      case 'text_input':
        // Validación inteligente y flexible para texto libre
        isCorrect = this.validateTextInput(normalizedAnswer, correctAnswer, solution);
        break;
        
      case 'numeric':
        const userNumber = parseFloat(userAnswer);
        const correctNumber = parseFloat(solution.correct_answer);
        const tolerance = solution.tolerance || 0.01;
        isCorrect = Math.abs(userNumber - correctNumber) <= tolerance;
        break;
        
      default:
        isCorrect = normalizedAnswer === correctAnswer;
    }
    
    return {
      isCorrect,
      explanation: solution.explanation,
      correctAnswer: solution.correct_answer
    };
  }

  static validateTextInput(userAnswer, correctAnswer, solution) {
    // Normalizar ambas respuestas más agresivamente
    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s:-]/g, '') // Remover puntuación excepto : y -
        .replace(/\s+/g, ' '); // Normalizar espacios
    };

    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);

    // 1. Coincidencia exacta (después de normalización)
    if (normalizedUser === normalizedCorrect) {
      return true;
    }

    // 2. Validación por sinónimos/alternativas definidas
    if (solution.valid_answers) {
      const validAnswers = solution.valid_answers.map(ans => normalizeText(ans));
      if (validAnswers.some(valid => normalizedUser === valid)) {
        return true;
      }
    }

    // 3. Validación inteligente basada en el contexto
    return this.validateByContext(normalizedUser, normalizedCorrect, solution);
  }

  static validateByContext(userAnswer, correctAnswer, solution) {
    // Dividir respuestas en componentes para análisis
    const userParts = userAnswer.split(/[,\s]+/).filter(p => p.length > 0);
    const correctParts = correctAnswer.split(/[,\s]+/).filter(p => p.length > 0);

    // Para respuestas con múltiples componentes (ej: "Centro, 22:00-02:00, viernes")
    if (correctParts.length > 1) {
      let matchedParts = 0;
      
      for (const correctPart of correctParts) {
        for (const userPart of userParts) {
          if (this.isComponentMatch(userPart, correctPart)) {
            matchedParts++;
            break;
          }
        }
      }
      
      // Considerar correcto si al menos el 66% de los componentes coinciden
      return matchedParts >= Math.ceil(correctParts.length * 0.66);
    }

    // Para respuestas simples, usar coincidencia flexible
    return this.isFlexibleMatch(userAnswer, correctAnswer);
  }

  static isComponentMatch(userPart, correctPart) {
    // Coincidencia exacta
    if (userPart === correctPart) return true;

    // Sinónimos comunes
    const synonyms = {
      'centro': ['centro', 'downtown', 'central'],
      'norte': ['norte', 'north'],
      'sur': ['sur', 'south'],
      'este': ['este', 'east'],
      'oeste': ['oeste', 'west'],
      'viernes': ['viernes', 'friday', 'vie'],
      'sabado': ['sabado', 'sábado', 'saturday', 'sab'],
      'domingo': ['domingo', 'sunday', 'dom'],
      'lunes': ['lunes', 'monday', 'lun'],
      'martes': ['martes', 'tuesday', 'mar'],
      'miercoles': ['miercoles', 'miércoles', 'wednesday', 'mie'],
      'jueves': ['jueves', 'thursday', 'jue']
    };

    // Verificar sinónimos
    for (const [key, values] of Object.entries(synonyms)) {
      if (values.includes(correctPart) && values.includes(userPart)) {
        return true;
      }
    }

    // Coincidencia parcial para horarios (ej: "22:00" en "22:00-02:00")
    if (correctPart.includes(':') && userPart.includes(':')) {
      return correctPart.includes(userPart) || userPart.includes(correctPart);
    }

    // Coincidencia parcial para IDs y códigos
    if (correctPart.length > 3) {
      return correctPart.includes(userPart) || userPart.includes(correctPart);
    }

    return false;
  }

  static isFlexibleMatch(userAnswer, correctAnswer) {
    // Coincidencia bidireccional
    if (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)) {
      return true;
    }

    // Validación por palabras clave importantes
    const userWords = userAnswer.split(/\s+/);
    const correctWords = correctAnswer.split(/\s+/);
    
    let matchedWords = 0;
    for (const correctWord of correctWords) {
      if (correctWord.length > 2) { // Solo palabras significativas
        for (const userWord of userWords) {
          if (userWord.includes(correctWord) || correctWord.includes(userWord)) {
            matchedWords++;
            break;
          }
        }
      }
    }

    // Considerar correcto si al menos el 50% de las palabras significativas coinciden
    const significantWords = correctWords.filter(w => w.length > 2).length;
    return significantWords > 0 && (matchedWords / significantWords) >= 0.5;
  }
}

module.exports = Exercise;