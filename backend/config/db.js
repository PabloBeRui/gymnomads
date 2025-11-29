// 1. Import the mysql2 library
// 1. Importar la librería mysql2

const mysql = require("mysql2");

require("dotenv").config(); // This line loads environment variables from the .env file
// Esta línea carga las variables de entorno del archivo .env

// 2. Create the connection pool
// 2. Crear el "pool" de conexiones

// =========================================================================================
// CONFIGURACIÓN DE SEGURIDAD PARA TESTS / SECURITY CONFIGURATION FOR TESTS
// =========================================================================================
const isTestEnv = process.env.NODE_ENV === 'test';
const dbName = isTestEnv ? 'gymnomads_test' : (process.env.DB_NAME || "gymnomads");

// CRITICAL SAFETY CHECK:
// Si estamos en modo test, ASEGURARNOS de que la BBDD es la de test.
// If we are in test mode, ENSURE the DB is the test DB.
if (isTestEnv && dbName !== 'gymnomads_test') {
  console.error("CRITICAL ERROR: Running tests against a non-test database!");
  console.error("CRITICAL ERROR: Ejecutando tests contra una base de datos que no es de test!");
  process.exit(1); // Halt execution immediately / Detener ejecución inmediatamente
}
// =========================================================================================

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: dbName, // Use the safe DB name variable / Usar la variable de nombre de BBDD segura
});

// 3. Export the pool to be used in other files
// 3. Exportar el pool para poder usarlo en otros archivos

module.exports = pool.promise();
