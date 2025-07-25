const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const fs = require('fs');
const path = require('path');

// Endpoint temporal para ejecutar migraciones
router.post('/validation-modes', async (req, res) => {
  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../db/update-validation-modes.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir en comandos individuales (separados por ;)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    const results = [];
    
    // Ejecutar cada comando
    for (const command of commands) {
      if (command.toLowerCase().startsWith('select')) {
        // Para SELECTs, obtener los resultados
        const result = await db.query(command);
        results.push({
          command: command.substring(0, 50) + '...',
          type: 'SELECT',
          rows: result.rows
        });
      } else if (command.toLowerCase().startsWith('update')) {
        // Para UPDATEs, obtener el count
        const result = await db.query(command);
        results.push({
          command: command.substring(0, 50) + '...',
          type: 'UPDATE',
          rowCount: result.rowCount
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Migración de validación ejecutada correctamente',
      results: results
    });
    
  } catch (error) {
    console.error('Error ejecutando migración:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando migración',
      error: error.message
    });
  }
});

module.exports = router;