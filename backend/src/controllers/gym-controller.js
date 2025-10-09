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
    res.status(500).json({
      message: `Error en el servidor`,
    });
  }
};

// Obtener un gimnasio por ID
// Get a gym by ID

const getGymById = async (req, res) => {
  try {
    // Obtener el ID de los parámetros de la URL
    // Get the ID from the URL parameters

    const { id } = req.params;

    // Ejecutar la consulta SQL para buscar por ID
    // Execute the SQL query to find by ID
    const [rows] = await db.query("SELECT * FROM gyms WHERE id = ?", [id]);

    // Comprobar si se encontró el gimnasio. Si no se encuentra, devolver un error 404. Si se encuentra, devolver los datos del gimnasio
    // Check if the gym was found. If not found, return a 404 error. If found, return the gym data

    if (rows.length === 0) {
      return res.status(404).json({ message: "Gimnasio no encontrado" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Error en el servidor`,
    });
  }
};

module.exports = {
  getAllGyms,
  getGymById,
};
