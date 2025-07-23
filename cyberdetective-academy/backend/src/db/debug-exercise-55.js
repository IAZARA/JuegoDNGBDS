const { Client } = require('pg');
require('dotenv').config();

async function debugExercise55() {
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
      WHERE id = 55
    `);
    
    if (result.rows.length === 0) {
      console.log('Ejercicio 55 no encontrado');
      return;
    }
    
    const exercise = result.rows[0];
    console.log(`\n=== EJERCICIO ${exercise.id}: ${exercise.title} ===`);
    console.log('Tipo:', exercise.type);
    
    console.log('\n--- PROBLEM DATA ---');
    try {
      const problemData = JSON.parse(exercise.problem_data);
      console.log('Parsed successfully:');
      console.log(JSON.stringify(problemData, null, 2));
      
      // Verificar campos específicos
      if (problemData.crime_sequence) {
        console.log(`\n✅ crime_sequence encontrado con ${problemData.crime_sequence.length} elementos`);
      } else {
        console.log('\n❌ crime_sequence NO encontrado');
      }
      
      if (problemData.next_targets) {
        console.log(`✅ next_targets encontrado con ${problemData.next_targets.length} elementos`);
      } else {
        console.log('❌ next_targets NO encontrado');
      }
      
    } catch (e) {
      console.log('❌ Error parsing problem_data:', e.message);
      console.log('Raw problem_data:', exercise.problem_data);
    }
    
    await client.end();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugExercise55();