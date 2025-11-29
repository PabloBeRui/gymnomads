/**
 * =============================================================================
 * SCRIPT DE UTILIDAD: Inicializador de BBDD de Test
 * UTILITY SCRIPT: Test DB Initializer
 * =============================================================================
 *
 * Ejecuta el script SQL de creación de la base de datos de pruebas.
 *
 * Executes the SQL script for creating the test database.
 *
 * =============================================================================
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createTestDB() {
  console.log('⏳ Iniciando creación de BBDD de test... // Starting test DB creation...');

  // Conexión inicial sin seleccionar BBDD para poder crearla // Initial connection without selecting DB to allow creation
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Importante para ejecutar el script SQL completo // Important to execute the full SQL script
  });

  try {
    const sqlPath = path.join(__dirname, '../../bbdd/create_test_db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📂 Leyendo script SQL: // Reading SQL script:', sqlPath);
    
    await connection.query(sql);
    
    console.log('✅ Base de datos gymnomads_test creada/restaurada correctamente. // gymnomads_test database created/restored successfully.');
  } catch (error) {
    console.error('❌ Error creando la BBDD de test: // Error creating test DB:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createTestDB();
