const { Client } = require('pg');
require('dotenv').config();

async function fixDuplicates() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    console.log('🔧 Eliminando ejercicios duplicados...\n');
    
    // Eliminar los duplicados (IDs más altos)
    console.log('Eliminando ejercicio 27 (duplicado de Análisis de Red Criminal)...');
    await client.query('DELETE FROM exercises WHERE id = 27');
    
    console.log('Eliminando ejercicio 26 (duplicado de Seguimiento de Criptomonedas)...');
    await client.query('DELETE FROM exercises WHERE id = 26');
    
    // Verificar que no hay más duplicados
    const duplicates = await client.query(`
      SELECT title, COUNT(*) as count, array_agg(id) as ids
      FROM exercises 
      GROUP BY title 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicates.rows.length > 0) {
      console.log('\n⚠️  Duplicados restantes:');
      duplicates.rows.forEach(dup => {
        console.log(`- "${dup.title}": IDs ${dup.ids.join(', ')}`);
      });
    } else {
      console.log('\n✅ No hay duplicados restantes');
    }
    
    // Contar ejercicios totales
    const total = await client.query('SELECT COUNT(*) FROM exercises');
    console.log(`\n📊 Total de ejercicios: ${total.rows[0].count}`);
    
    // Verificar order_index únicos
    const orderConflicts = await client.query(`
      SELECT order_index, COUNT(*) as count, array_agg(id) as ids
      FROM exercises 
      GROUP BY order_index 
      HAVING COUNT(*) > 1
      ORDER BY order_index
    `);
    
    if (orderConflicts.rows.length > 0) {
      console.log('\n⚠️  Conflictos de order_index:');
      orderConflicts.rows.forEach(conflict => {
        console.log(`- Order ${conflict.order_index}: IDs ${conflict.ids.join(', ')}`);
      });
    } else {
      console.log('\n✅ No hay conflictos de order_index');
    }
    
    await client.end();
    console.log('\n🎉 Limpieza completada!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDuplicates();