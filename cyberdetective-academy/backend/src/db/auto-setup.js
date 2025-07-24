const { pool } = require('./connection');
const path = require('path');
const fs = require('fs').promises;

async function autoSetupDatabase() {
  try {
    console.log('🚀 Verificando setup automático de base de datos...');
    
    // Verificar si ya está configurada
    try {
      await pool.query('SELECT 1 FROM exercises LIMIT 1');
      await pool.query('SELECT 1 FROM system_config LIMIT 1');
      console.log('✅ Base de datos ya configurada');
      return;
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
    
    console.log('🎉 Setup automático completado');
    
  } catch (error) {
    console.error('❌ Error en setup automático:', error.message);
    // No crashear la app, solo logear
  }
}

module.exports = { autoSetupDatabase };