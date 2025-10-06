// Import our connection configuration
// Importar nuestra configuración de conexión
const db = require("../config/db");

// Create a function to test the connection
// Crear una función para probar la conexión

async function testConnection() {
  let connection;
  try {
    // Try to get a connection from the pool
    // Intentar obtener una conexión del pool
    connection = await db.getConnection();

    console.log("Conexión con la BBDD establecida correctamente ✅");
  } catch (error) {
    console.error(`Error en la conexión a la BBDD ❌ - Error: ${error}`);
  } finally {
    // Ensure the connection is always released
    // Asegurarse de que la conexión siempre se libere
    if (connection) {
      connection.release(); // Return the connection to the pool  // Devuelve la conexión al pool

      console.log("Conexión liberada.");
    }
    // Close the pool to allow the script to exit
    // Cerrar el pool para permitir que el script termine
    await db.end();
  }
}

testConnection();
