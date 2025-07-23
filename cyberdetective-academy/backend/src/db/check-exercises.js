const { Client } = require('pg');
require('dotenv').config();

async function checkExercises() {
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
      SELECT id, title, order_index, type, category,
             problem_data::text as problem_data
      FROM exercises 
      ORDER BY order_index
    `);
    
    console.log('Total ejercicios:', result.rows.length);
    console.log('\nEjercicios en la base de datos:');
    result.rows.forEach(ex => {
      console.log(`ID: ${ex.id}, Order: ${ex.order_index}, Type: ${ex.type}, Title: ${ex.title}`);
      // Verificar si problem_data es válido
      try {
        const problemData = JSON.parse(ex.problem_data);
        if (!problemData.question) {
          console.log(`  ⚠️  Falta 'question' en problem_data`);
        }
      } catch (e) {
        console.log(`  ❌ Error en problem_data: ${e.message}`);
      }
    });
    
    await client.end();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkExercises();