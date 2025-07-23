const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runAdminMigration() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');
    
    // Leer y ejecutar la migración
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_admin_system.sql'), 
      'utf8'
    );
    
    console.log('Ejecutando migración de sistema de administrador...');
    await client.query(migrationSQL);
    
    console.log('✅ Migración completada exitosamente');
    console.log('📝 Credenciales de administrador:');
    console.log('   Usuario: ivan.zarate');
    console.log('   Contraseña: Vortex733-');
    console.log('');
    console.log('🔗 Accede al panel en: http://localhost:5173/admin/login');
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runAdminMigration();