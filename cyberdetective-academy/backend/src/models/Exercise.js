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
    
    // Usar modo de validación específico si está definido
    if (solution.validation_mode) {
      isCorrect = this.validateByMode(normalizedAnswer, correctAnswer, solution);
    } else {
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
    }
    
    return {
      isCorrect,
      explanation: solution.explanation,
      correctAnswer: solution.correct_answer
    };
  }

  static validateByMode(userAnswer, correctAnswer, solution) {
    const mode = solution.validation_mode;
    
    switch (mode) {
      case 'name_only':
        // Solo valida el nombre/identificador principal, ignora texto adicional
        return this.validateNameOnly(userAnswer, correctAnswer, solution);
        
      case 'flexible_list':
        // Acepta listas con diferentes formatos y ordenamientos
        return this.validateFlexibleList(userAnswer, correctAnswer, solution);
        
      case 'key_value_pairs':
        // Acepta pares clave-valor con formato flexible
        return this.validateKeyValuePairs(userAnswer, correctAnswer, solution);
        
      default:
        // Si no hay modo específico, usar validación estándar
        return this.validateTextInput(userAnswer, correctAnswer, solution);
    }
  }

  static validateNameOnly(userAnswer, correctAnswer, solution) {
    // Extraer solo el nombre/identificador principal de la respuesta correcta
    const extractName = (text) => {
      // Remover frases comunes como "es empresa fantasma", "es sospechoso", etc.
      return text
        .replace(/\b(es|son|una?|el|la|los|las|empresa|fantasma|sospechoso[as]?|falso[as]?|duplicado[as]?)\b/gi, '')
        .trim()
        .replace(/\s+/g, ' ');
    };
    
    const userNameOnly = extractName(userAnswer);
    const correctNameOnly = extractName(correctAnswer);
    
    // También verificar las respuestas válidas alternativas
    if (solution.valid_answers) {
      const validNames = solution.valid_answers.map(ans => extractName(ans.toLowerCase()));
      if (validNames.some(name => userNameOnly === name || userAnswer === name.toLowerCase())) {
        return true;
      }
    }
    
    // Coincidencia exacta o si el usuario escribió el nombre correcto
    return userNameOnly === correctNameOnly || userAnswer === correctNameOnly;
  }

  static validateFlexibleList(userAnswer, correctAnswer, solution) {
    // Normalizar y extraer elementos de una lista
    const extractElements = (text) => {
      // Remover palabras clave como "Líder:", "Operativos:", etc.
      const cleaned = text
        .replace(/\b(líder|lider|leader|operativo[s]?|ops?|miembro[s]?)\b/gi, '')
        .replace(/[:;]/g, ','); // Convertir : y ; a comas
      
      // Extraer elementos (letras, números o códigos)
      const elements = cleaned
        .split(/[,\s]+/)
        .filter(e => e.match(/^[A-Za-z0-9]+$/))
        .map(e => e.toUpperCase())
        .sort(); // Ordenar para comparación independiente del orden
      
      return elements;
    };
    
    const userElements = extractElements(userAnswer);
    const correctElements = extractElements(correctAnswer);
    
    // Verificar si todos los elementos correctos están presentes
    if (correctElements.length === 0) return false;
    
    const allElementsMatch = correctElements.every(elem => 
      userElements.includes(elem)
    );
    
    // También aceptar si el usuario proporcionó los elementos correctos aunque haya extras
    return allElementsMatch && userElements.length >= correctElements.length;
  }

  static validateKeyValuePairs(userAnswer, correctAnswer, solution) {
    // Extraer pares clave-valor de formato flexible
    const extractPairs = (text) => {
      const pairs = {};
      
      // Patrones para diferentes formatos: "clave: valor", "clave=valor", "clave valor"
      const patterns = [
        /(\w+)\s*[:=]\s*([^,;]+)/g,
        /(\w+)\s+(\w+)/g
      ];
      
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const key = match[1].toLowerCase();
          const value = match[2].trim().toUpperCase();
          pairs[key] = value;
        }
      });
      
      return pairs;
    };
    
    const userPairs = extractPairs(userAnswer);
    const correctPairs = extractPairs(correctAnswer);
    
    // Verificar que todos los pares correctos estén presentes
    for (const [key, value] of Object.entries(correctPairs)) {
      if (!userPairs[key] || userPairs[key] !== value) {
        // Intentar con sinónimos de claves
        const keySynonyms = {
          'lider': ['leader', 'jefe', 'boss'],
          'operativo': ['op', 'ops', 'operativos', 'operative']
        };
        
        let found = false;
        if (keySynonyms[key]) {
          for (const synonym of keySynonyms[key]) {
            if (userPairs[synonym] === value) {
              found = true;
              break;
            }
          }
        }
        
        if (!found) return false;
      }
    }
    
    return true;
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