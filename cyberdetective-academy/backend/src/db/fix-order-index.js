const { Client } = require('pg');
require('dotenv').config();

async function fixOrderIndex() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    console.log('🔧 Corrigiendo order_index...\n');
    
    // Obtener todos los ejercicios ordenados por ID
    const exercises = await client.query(`
      SELECT id, title, order_index 
      FROM exercises 
      ORDER BY id
    `);
    
    console.log('Estado actual:');
    exercises.rows.forEach(ex => {
      console.log(`ID: ${ex.id}, Order: ${ex.order_index}, Title: ${ex.title}`);
    });
    
    console.log('\n🔄 Reassignando order_index secuencial...');
    
    // Reassignar order_index secuencial basado en ID
    for (let i = 0; i < exercises.rows.length; i++) {
      const newOrderIndex = i + 1;
      const exerciseId = exercises.rows[i].id;
      
      await client.query(`
        UPDATE exercises 
        SET order_index = $1 
        WHERE id = $2
      `, [newOrderIndex, exerciseId]);
      
      console.log(`✅ Ejercicio ${exerciseId}: order_index = ${newOrderIndex}`);
    }
    
    // Verificar que no hay más conflictos
    const conflicts = await client.query(`
      SELECT order_index, COUNT(*) as count, array_agg(id) as ids
      FROM exercises 
      GROUP BY order_index 
      HAVING COUNT(*) > 1
      ORDER BY order_index
    `);
    
    if (conflicts.rows.length > 0) {
      console.log('\n⚠️  Conflictos restantes:');
      conflicts.rows.forEach(conflict => {
        console.log(`- Order ${conflict.order_index}: IDs ${conflict.ids.join(', ')}`);
      });
    } else {
      console.log('\n✅ No hay conflictos de order_index');
    }
    
    await client.end();
    console.log('\n🎉 Order_index corregido!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixOrderIndex();