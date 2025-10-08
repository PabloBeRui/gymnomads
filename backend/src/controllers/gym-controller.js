const db = require("../../config/db");



// Función para obtener todos los gimnasios
// Function to get all gyms

const getAllGyms = async (req, res) => {
  try {
    // Ejecutar la consulta SQL usando el pool de conexiones
    // Execute the SQL query using the connection pool
    // const rows = queryResults[0]

    const [rows] = await db.query("SELECT * FROM gyms");

    // Responder con un estado 200 (OK) y los datos en formato JSON
    // Respond with a 200 status (OK) and the data in JSON format
    res.status(200).json(rows);
  } catch (error) {
    // en caso de error mostrar en consola y enviar un error 500
    // In case of error, display in console and send a 500 error

    console.error(error);
    res
      .status(500)
      .json({
        message: `Error al obtener todos los gimnasios, \n Error: ${error}`,
      });
  }
};

module.exports = {
  getAllGyms,
};