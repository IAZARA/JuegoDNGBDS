const { Client } = require('pg');
require('dotenv').config();

async function debugExercise46() {
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
      SELECT id, title, type, order_index, problem_data, solution_data
      FROM exercises 
      WHERE id = 46
    `);
    
    if (result.rows.length === 0) {
      console.log('Ejercicio 46 no encontrado');
      return;
    }
    
    const exercise = result.rows[0];
    console.log(`\n=== EJERCICIO ${exercise.id}: ${exercise.title} ===`);
    console.log('Tipo:', exercise.type);
    console.log('Order Index:', exercise.order_index);
    
    console.log('\n--- PROBLEM DATA ---');
    const problemData = exercise.problem_data;
    console.log('Type:', typeof problemData);
    console.log('Keys available:', Object.keys(problemData));
    
    if (problemData.companies) {
      console.log('\n🏢 Companies found:', problemData.companies.length);
      problemData.companies.forEach((company, index) => {
        console.log(`  ${index + 1}. ${company.name}`);
        console.log(`     Employees: ${company.employees}`);
        console.log(`     Revenue: ${company.revenue}`);
        console.log(`     Transactions: ${company.transactions}`);
        console.log(`     Office: ${company.office}`);
        console.log(`     Website: ${company.website}`);
      });
    }
    
    console.log('\n📝 Question:', problemData.question);
    console.log('🔍 Context:', problemData.context);
    
    await client.end();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugExercise46();