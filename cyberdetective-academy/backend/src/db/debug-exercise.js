const { Client } = require('pg');
require('dotenv').config();

async function debugExercise(exerciseId) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT id, title, type, problem_data, solution_data
      FROM exercises 
      WHERE id = $1
    `, [exerciseId]);
    
    if (result.rows.length === 0) {
      console.log('Ejercicio no encontrado');
      return;
    }
    
    const exercise = result.rows[0];
    console.log(`\n=== EJERCICIO ${exercise.id}: ${exercise.title} ===`);
    console.log('Tipo:', exercise.type);
    
    console.log('\n--- PROBLEM DATA ---');
    try {
      const problemData = JSON.parse(exercise.problem_data);
      console.log(JSON.stringify(problemData, null, 2));
    } catch (e) {
      console.log('❌ Error parsing problem_data:', e.message);
      console.log('Raw problem_data:', exercise.problem_data);
    }
    
    console.log('\n--- SOLUTION DATA ---');
    try {
      const solutionData = JSON.parse(exercise.solution_data);
      console.log(JSON.stringify(solutionData, null, 2));
    } catch (e) {
      console.log('❌ Error parsing solution_data:', e.message);
      console.log('Raw solution_data:', exercise.solution_data);
    }
    
    await client.end();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Verificar ejercicios 53 y 55 con problemas de renderizado
Promise.all([
  debugExercise(53), // Ejercicio 53
  debugExercise(55)  // Ejercicio 55
]).then(() => {
  console.log('\n=== ANÁLISIS COMPLETADO ===');
});