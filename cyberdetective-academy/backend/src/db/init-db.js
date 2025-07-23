const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    await client.connect();
    
    // Verificar si la base de datos existe
    const dbExistsQuery = `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`;
    const dbExists = await client.query(dbExistsQuery);
    
    if (dbExists.rows.length === 0) {
      console.log('Creando base de datos...');
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log('Base de datos creada exitosamente');
    } else {
      console.log('La base de datos ya existe');
    }
    
    await client.end();
    
    // Conectar a la nueva base de datos
    const dbClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    await dbClient.connect();
    
    // Ejecutar schema
    console.log('Creando tablas...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
      .split('CREATE DATABASE')[1]
      .split('\\c cyberdetective_db;')[1];
    
    await dbClient.query(schemaSQL);
    console.log('Tablas creadas exitosamente');
    
    // Ejecutar seed
    console.log('Insertando datos de ejemplo...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await dbClient.query(seedSQL);
    console.log('Datos de ejemplo insertados exitosamente');
    
    await dbClient.end();
    
    console.log('✅ Base de datos inicializada correctamente');
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDatabase();