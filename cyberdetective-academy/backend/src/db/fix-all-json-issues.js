const { Client } = require('pg');
require('dotenv').config();

async function fixAllJsonIssues() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    // Obtener TODOS los ejercicios
    const result = await client.query(`
      SELECT id, title, problem_data, solution_data
      FROM exercises 
      ORDER BY id
    `);
    
    console.log(`🔧 Revisando ${result.rows.length} ejercicios...\n`);
    
    let fixedCount = 0;
    
    for (const exercise of result.rows) {
      let needsUpdate = false;
      let problemData = exercise.problem_data;
      let solutionData = exercise.solution_data;
      
      // Verificar si problem_data es un objeto JavaScript
      if (typeof problemData === 'object') {
        problemData = JSON.stringify(problemData);
        needsUpdate = true;
        console.log(`  ⚠️  problem_data convertido para ejercicio ${exercise.id}`);
      }
      
      // Verificar si solution_data es un objeto JavaScript
      if (typeof solutionData === 'object') {
        solutionData = JSON.stringify(solutionData);
        needsUpdate = true;
        console.log(`  ⚠️  solution_data convertido para ejercicio ${exercise.id}`);
      }
      
      // Solo actualizar si es necesario
      if (needsUpdate) {
        await client.query(`
          UPDATE exercises 
          SET problem_data = $1, solution_data = $2
          WHERE id = $3
        `, [problemData, solutionData, exercise.id]);
        
        console.log(`✅ Ejercicio ${exercise.id} (${exercise.title}) - ARREGLADO`);
        fixedCount++;
      } else {
        console.log(`✅ Ejercicio ${exercise.id} (${exercise.title}) - YA CORRECTO`);
      }
    }
    
    await client.end();
    console.log(`\n🎉 Proceso completado: ${fixedCount} ejercicios arreglados de ${result.rows.length} totales`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAllJsonIssues();