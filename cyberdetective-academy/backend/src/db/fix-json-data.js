const { Client } = require('pg');
require('dotenv').config();

async function fixJsonData() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    // Obtener todos los ejercicios con order_index >= 8 (los nuevos)
    const result = await client.query(`
      SELECT id, title, problem_data, solution_data
      FROM exercises 
      WHERE order_index >= 8
      ORDER BY id
    `);
    
    console.log(`Arreglando ${result.rows.length} ejercicios...`);
    
    for (const exercise of result.rows) {
      console.log(`\nArreglando ejercicio ${exercise.id}: ${exercise.title}`);
      
      let problemData = exercise.problem_data;
      let solutionData = exercise.solution_data;
      
      // Si ya son objetos JavaScript, convertirlos a JSON string
      if (typeof problemData === 'object') {
        problemData = JSON.stringify(problemData);
      }
      if (typeof solutionData === 'object') {
        solutionData = JSON.stringify(solutionData);
      }
      
      // Actualizar en la base de datos
      await client.query(`
        UPDATE exercises 
        SET problem_data = $1, solution_data = $2
        WHERE id = $3
      `, [problemData, solutionData, exercise.id]);
      
      console.log(`✅ Ejercicio ${exercise.id} arreglado`);
    }
    
    await client.end();
    console.log('\n✅ Todos los ejercicios han sido arreglados');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixJsonData();