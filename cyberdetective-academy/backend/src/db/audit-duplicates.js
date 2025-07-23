const { Client } = require('pg');
require('dotenv').config();

async function auditDuplicates() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    // Obtener ejercicios 18 y 27 específicamente
    const result = await client.query(`
      SELECT id, title, description, order_index, type, category,
             problem_data::text as problem_data,
             solution_data::text as solution_data
      FROM exercises 
      WHERE id IN (18, 27)
      ORDER BY id
    `);
    
    console.log('=== COMPARACIÓN EJERCICIOS 18 vs 27 ===\n');
    
    result.rows.forEach(ex => {
      console.log(`--- EJERCICIO ${ex.id} ---`);
      console.log(`Título: ${ex.title}`);
      console.log(`Descripción: ${ex.description}`);
      console.log(`Order Index: ${ex.order_index}`);
      console.log(`Tipo: ${ex.type}`);
      console.log(`Categoría: ${ex.category}`);
      
      try {
        const problemData = JSON.parse(ex.problem_data);
        console.log(`Pregunta: ${problemData.question}`);
        if (problemData.network) {
          console.log(`Nodos en red: ${problemData.network.nodes?.length || 'N/A'}`);
        }
      } catch (e) {
        console.log('Error parseando problem_data:', e.message);
      }
      
      console.log('\n');
    });
    
    // Buscar todos los duplicados por título
    console.log('=== BUSCAR TODOS LOS DUPLICADOS ===');
    const duplicates = await client.query(`
      SELECT title, COUNT(*) as count, array_agg(id) as ids
      FROM exercises 
      GROUP BY title 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    duplicates.rows.forEach(dup => {
      console.log(`Título duplicado: "${dup.title}"`);
      console.log(`Cantidad: ${dup.count}`);
      console.log(`IDs: ${dup.ids.join(', ')}\n`);
    });
    
    await client.end();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

auditDuplicates();