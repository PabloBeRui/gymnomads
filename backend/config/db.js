// 1. Import the mysql2 library
// 1. Importar la librería mysql2

const mysql = require("mysql2");

require("dotenv").config(); // This line loads environment variables from the .env file
// Esta línea carga las variables de entorno del archivo .env

// 2. Create the connection pool
// 2. Crear el "pool" de conexiones

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gymnomads",
});

// 3. Export the pool to be used in other files
// 3. Exportar el pool para poder usarlo en otros archivos

module.exports = pool.promise();
