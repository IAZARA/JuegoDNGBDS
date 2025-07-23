const { Client } = require('pg');
require('dotenv').config();

async function fixNewExercisesJson() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    // Obtener todos los ejercicios con order_index >= 19 (los nuevos)
    const result = await client.query(`
      SELECT id, title, problem_data, solution_data
      FROM exercises 
      WHERE order_index >= 19
      ORDER BY id
    `);
    
    console.log(`🔧 Arreglando ${result.rows.length} ejercicios nuevos...\n`);
    
    for (const exercise of result.rows) {
      console.log(`Arreglando ejercicio ${exercise.id}: ${exercise.title}`);
      
      let problemData = exercise.problem_data;
      let solutionData = exercise.solution_data;
      
      // Si son objetos JavaScript, convertirlos a JSON string
      if (typeof problemData === 'object') {
        problemData = JSON.stringify(problemData);
        console.log(`  ✅ problem_data convertido a JSON`);
      }
      if (typeof solutionData === 'object') {
        solutionData = JSON.stringify(solutionData);
        console.log(`  ✅ solution_data convertido a JSON`);
      }
      
      // Actualizar en la base de datos
      await client.query(`
        UPDATE exercises 
        SET problem_data = $1, solution_data = $2
        WHERE id = $3
      `, [problemData, solutionData, exercise.id]);
      
      console.log(`  ✅ Ejercicio ${exercise.id} actualizado\n`);
    }
    
    await client.end();
    console.log('🎉 Todos los ejercicios nuevos han sido arreglados');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixNewExercisesJson();