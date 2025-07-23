const { Client } = require('pg');
require('dotenv').config();

async function simplifyExercise28() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    console.log('🔧 Simplificando ejercicio 28...\n');
    
    // Datos simplificados más comprensibles
    const newProblemData = {
      "contracts": [
        {
          "address": "0xA1B2", 
          "type": "Sistema de Ahorro", 
          "returns": "5% anual",
          "description": "Plataforma legítima para ahorrar dinero con interés fijo del 5% por año"
        }, 
        {
          "address": "0xC3D4", 
          "type": "Inversión con Referidos", 
          "returns": "20% mensual",
          "description": "Promete ganancias del 20% cada mes y bonos por invitar amigos"
        }, 
        {
          "address": "0xE5F6", 
          "type": "Pool de Trading", 
          "returns": "Variable",
          "description": "Plataforma para intercambiar criptomonedas con ganancias variables"
        }
      ], 
      "question": "¿Qué plataforma es probablemente un esquema Ponzi?", 
      "context": "Los esquemas Ponzi prometen ganancias irrealmente altas y dependen de que nuevos inversores paguen a los anteriores. Señales típicas: retornos garantizados muy altos, bonos por referir amigos, y promesas de dinero fácil.", 
      "input_placeholder": "Plataforma XXXXX es un Ponzi", 
      "input_hint": "💡 Pista: ¿Qué retorno es demasiado bueno para ser verdad? ¿Cuál menciona bonos por referidos?"
    };

    const newSolutionData = {
      "correct_answer": "Plataforma 0xC3D4 es un Ponzi", 
      "explanation": "La plataforma 0xC3D4 muestra señales claras de esquema Ponzi: promete retornos del 20% mensual (240% anual es insostenible), ofrece bonos por invitar amigos (típico de esquemas piramidales), y garantiza ganancias que son demasiado buenas para ser verdad.", 
      "valid_answers": ["0xC3D4", "C3D4", "Plataforma 0xC3D4"]
    };

    const newHints = [
      "20% mensual = 240% anual es imposible de sostener", 
      "Bonos por referidos = señal de esquema piramidal", 
      "Si suena demasiado bueno para ser verdad, probablemente lo es"
    ];
    
    // Actualizar ejercicio
    await client.query(`
      UPDATE exercises 
      SET 
        problem_data = $1,
        solution_data = $2,
        hints = $3
      WHERE id = 28
    `, [
      JSON.stringify(newProblemData),
      JSON.stringify(newSolutionData), 
      JSON.stringify(newHints)
    ]);
    
    console.log('✅ Ejercicio 28 simplificado exitosamente');
    console.log('\nCambios realizados:');
    console.log('- Eliminadas funciones técnicas (invest(), referBonus(), etc.)');
    console.log('- Agregado campo "type" más descriptivo');
    console.log('- Agregado campo "returns" claro');
    console.log('- Simplificadas las descripciones');
    console.log('- Mejoradas las pistas para usuarios');
    
    await client.end();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

simplifyExercise28();