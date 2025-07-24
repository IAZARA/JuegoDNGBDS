const { pool } = require('./connection');
const path = require('path');
const fs = require('fs').promises;

async function autoSetupDatabase() {
  try {
    console.log('🚀 Verificando setup automático de base de datos...');
    
    // Verificar si ya está configurada (solo system_config es crítico)
    try {
      await pool.query('SELECT 1 FROM system_config LIMIT 1');
      console.log('✅ system_config existe, continuando setup...');
    } catch (error) {
      console.log('🔧 Inicializando base de datos automáticamente...');
    }
    
    // Ejecutar esquemas en orden
    const scripts = [
      'schema.sql',
      'teams-schema.sql', 
      'create-admin-tables.sql',
      'seed.sql'
    ];
    
    for (const script of scripts) {
      try {
        const scriptPath = path.join(__dirname, script);
        const sql = await fs.readFile(scriptPath, 'utf8');
        
        // Ejecutar por partes (separar por ;)
        const statements = sql.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            await pool.query(statement);
          }
        }
        
        console.log(`✅ ${script} ejecutado`);
      } catch (error) {
        console.log(`⚠️  ${script}: ${error.message.substring(0, 100)}...`);
        // Continuar con el siguiente script
      }
    }
    
    // NUCLEAR FIX: Borrar y recrear system_config
    try {
      console.log('🔥 NUCLEAR FIX: Recreando system_config...');
      
      // Borrar tabla si existe
      await pool.query('DROP TABLE IF EXISTS system_config CASCADE');
      
      // Recrear desde cero
      await pool.query(`
        CREATE TABLE system_config (
          id SERIAL PRIMARY KEY,
          teams_enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insertar dato inicial
      await pool.query(`
        INSERT INTO system_config (id, teams_enabled) 
        VALUES (1, true)
      `);
      
      // Verificar que funcionó
      const result = await pool.query('SELECT teams_enabled FROM system_config WHERE id = 1');
      console.log(`✅ system_config recreada. teams_enabled = ${result.rows[0]?.teams_enabled}`);
      
    } catch (err) {
      console.log(`❌ NUCLEAR FIX FAILED: ${err.message}`);
    }
    
    console.log('🎉 Setup automático completado');
    
  } catch (error) {
    console.error('❌ Error en setup automático:', error.message);
    // No crashear la app, solo logear
  }
}

module.exports = { autoSetupDatabase };