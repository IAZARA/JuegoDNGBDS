const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updateExercises() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    // Primero, eliminar los ejercicios existentes con order_index >= 8
    console.log('Eliminando ejercicios antiguos con order_index >= 8...');
    await client.query('DELETE FROM exercises WHERE order_index >= 8');
    
    // Leer solo la parte de los nuevos ejercicios del archivo seed.sql
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    
    // Buscar la sección de los nuevos ejercicios
    const startPattern = /\(\s*'Detección de Lavado con Algoritmos'/;
    const startIndex = seedSQL.search(startPattern);
    
    if (startIndex !== -1) {
      // Encontrar el final de todos los ejercicios nuevos
      const fromStart = seedSQL.substring(startIndex);
      const endIndex = fromStart.lastIndexOf(');');
      const exercisesSection = fromStart.substring(0, endIndex + 2);
      
      // Construir el INSERT completo
      const insertSQL = `INSERT INTO exercises (title, description, difficulty, points, category, type, problem_data, solution_data, hints, time_limit, order_index) VALUES ${exercisesSection}`;
      
      console.log('Insertando nuevos ejercicios...');
      await client.query(insertSQL);
      
      // Contar ejercicios insertados
      const result = await client.query('SELECT COUNT(*) FROM exercises WHERE order_index >= 8');
      console.log(`✅ ${result.rows[0].count} nuevos ejercicios insertados exitosamente`);
    } else {
      console.log('No se encontraron nuevos ejercicios para insertar');
    }
    
    await client.end();
    
  } catch (error) {
    console.error('Error al actualizar ejercicios:', error);
    process.exit(1);
  }
}

updateExercises();