/**
 * =============================================================================
 * ARCHIVO DE CONFIGURACIÓN: Conexión a Base de Datos
 * CONFIGURATION FILE: Database Connection
 * =============================================================================
 *
 * Configura y exporta el pool de conexiones a MySQL.
 * Incluye lógica de seguridad para entornos de prueba.
 *
 * Configures and exports the MySQL connection pool.
 * Includes security logic for testing environments.
 *
 * =============================================================================
 */

// 1. Importar la librería mysql2 // 1. Import the mysql2 library
const mysql = require("mysql2");

// Cargar variables de entorno del archivo .env // Load environment variables from the .env file
require("dotenv").config(); 

// =========================================================================================
// CONFIGURACIÓN DE SEGURIDAD PARA TESTS // SECURITY CONFIGURATION FOR TESTS
// =========================================================================================
const isTestEnv = process.env.NODE_ENV === 'test';
const dbName = isTestEnv ? 'gymnomads_test' : (process.env.DB_NAME || "gymnomads");

// CRITICAL SAFETY CHECK:
// Si estamos en modo test, ASEGURARNOS de que la BBDD es la de test.
// If we are in test mode, ENSURE the DB is the test DB.
if (isTestEnv && dbName !== 'gymnomads_test') {
  console.error("CRITICAL ERROR: Running tests against a non-test database!");
  console.error("CRITICAL ERROR: Ejecutando tests contra una base de datos que no es de test!");
  process.exit(1); // Detener ejecución inmediatamente // Halt execution immediately
}
// =========================================================================================

// 2. Crear el "pool" de conexiones // 2. Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: dbName, // Usar la variable de nombre de BBDD segura // Use the safe DB name variable
});

// 3. Exportar el pool para poder usarlo en otros archivos // 3. Export the pool to be used in other files
module.exports = pool.promise();
