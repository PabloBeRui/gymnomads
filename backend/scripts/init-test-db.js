const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createTestDB() {
  console.log('⏳ Iniciando creación de BBDD de test...');

  // Conexión inicial sin seleccionar BBDD para poder crearla
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Importante para ejecutar el script SQL completo
  });

  try {
    const sqlPath = path.join(__dirname, '../../bbdd/create_test_db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📂 Leyendo script SQL:', sqlPath);
    
    await connection.query(sql);
    
    console.log('✅ Base de datos gymnomads_test creada/restaurada correctamente.');
  } catch (error) {
    console.error('❌ Error creando la BBDD de test:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createTestDB();
