const { pool } = require('./connection');
const path = require('path');
const fs = require('fs').promises;

async function executeSQL(sql, stepName) {
  try {
    // Limpiar y dividir SQL en statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== 'CREATE DATABASE cyberdetective_db');
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    console.log(`✅ ${stepName} completado`);
    return true;
  } catch (error) {
    console.log(`⚠️  ${stepName}: ${error.message.substring(0, 100)}...`);
    return false;
  }
}

async function completeSetupDatabase() {
  try {
    console.log('🚀 SETUP COMPLETO: CyberDetective Academy con 24 ejercicios');
    
    // Verificar si ya está completo
    try {
      const exerciseCheck = await pool.query('SELECT COUNT(*) FROM exercises');
      const exerciseCount = parseInt(exerciseCheck.rows[0].count);
      
      if (exerciseCount >= 24) {
        console.log(`✅ Base de datos completa (${exerciseCount} ejercicios)`);
        return;
      }
    } catch (error) {
      console.log('🔧 Inicializando base de datos completa...');
    }
    
    // Lista de archivos SQL en orden correcto
    const sqlFiles = [
      { file: 'schema.sql', name: 'Esquema principal' },
      { file: 'migrations/add_teams.sql', name: 'Sistema de equipos' },
      { file: 'migrations/add_admin_system.sql', name: 'Sistema admin' },
      { file: 'migrations/add_multiple_attempts.sql', name: 'Múltiples intentos' },
      { file: 'seed.sql', name: 'Datos iniciales (23 ejercicios)' },
      { file: 'exercise-24-data-cleaning.sql', name: 'Ejercicio 24' },
      { file: 'update-exercise-24.sql', name: 'Actualización ejercicio 24' },
      { file: 'fix-exercise-24-type.sql', name: 'Fix tipo ejercicio 24' },
      { file: 'update-exercise-times.sql', name: 'Tiempos por dificultad' },
      { file: 'create-admin-user.sql', name: 'Usuario admin' }
    ];
    
    let successCount = 0;
    
    // Ejecutar cada archivo
    for (const { file, name } of sqlFiles) {
      try {
        const filePath = path.join(__dirname, file);
        
        // Verificar si el archivo existe
        try {
          await fs.access(filePath);
        } catch (err) {
          console.log(`⚠️  Archivo no encontrado: ${file}`);
          continue;
        }
        
        const sql = await fs.readFile(filePath, 'utf8');
        const success = await executeSQL(sql, name);
        if (success) successCount++;
        
      } catch (error) {
        console.log(`❌ Error con ${file}: ${error.message}`);
      }
    }
    
    // Asegurar system_config (crítico para teams-enabled)
    try {
      await pool.query('DROP TABLE IF EXISTS system_config CASCADE');
      await pool.query(`
        CREATE TABLE system_config (
          id SERIAL PRIMARY KEY,
          teams_enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await pool.query(`INSERT INTO system_config (id, teams_enabled) VALUES (1, true)`);
      console.log('✅ system_config configurada');
    } catch (err) {
      console.log(`⚠️  system_config error: ${err.message}`);
    }
    
    // Verificar resultado final
    try {
      const finalCheck = await pool.query('SELECT COUNT(*) FROM exercises');
      const finalCount = parseInt(finalCheck.rows[0].count);
      
      console.log(`🎉 SETUP COMPLETO: ${finalCount}/24 ejercicios, ${successCount} archivos procesados`);
      
      if (finalCount >= 24) {
        console.log('🏆 CyberDetective Academy completamente funcional!');
      }
    } catch (error) {
      console.log('⚠️  No se pudo verificar el resultado final');
    }
    
  } catch (error) {
    console.error('❌ Error en setup completo:', error.message);
  }
}

module.exports = { completeSetupDatabase };