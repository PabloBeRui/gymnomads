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

// Crear un nuevo gimnasio (solo para administradores)
// Create a new gym (admin only)

const createGym = async (req, res) => {
  try {
    // Obtener los datos del nuevo gimnasio del cuerpo de la petición
    // Get the new gym's data from the request body
    const { name, address, city, latitude, longitude } = req.body;

    // Validar que todos los campos necesarios estén presentes
    // Validate that all required fields are present
    if (!name || !address || !city || !latitude || !longitude) {
      console.error("El usuario no ha introducido todos los datos requeridos");
      return res
        .status(400)
        .json({ message: "todos los campos son requeridos" });
    }

    // Ejecutar la consulta sql para insertar el nuevo gimnasio
    // Execute the sql query to insert the new gym
    const [result] = await db.query(
      "INSERT INTO gyms (name, address, city, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
      [name, address, city, latitude, longitude]
    );

    // Enviar una respuesta de éxito con el código 201 created
    // Send a success response with the 201 created code
    res.status(201).json({
      message: "gimnasio creado con éxito",
      gymId: result.insertId,
    });
  } catch (error) {
    console.error(`Error al crear el gimansio: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

// actualizar un gimnasio existente (solo para administradores)
// update an existing gym (admin only)

const updateGym = async (req, res) => {
  try {
    // obtener el id del gimnasio de los parámetros de la url
    // get the gym id from the url parameters

    const { id } = req.params;

    // obtener los nuevos datos del cuerpo de la petición
    // get the new data from the request body

    const { name, address, city, latitude, longitude } = req.body;

    // validar que todos los campos necesarios estén presentes
    // validate that all required fields are present

    if (!name || !address || !city || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "todos los campos son requeridos" });
    }

    // ejecutar la consulta sql para actualizar el gimnasio
    // execute the sql query to update the gym

    const [result] = await db.query(
      "UPDATE gyms SET name = ?, address = ?, city = ?, latitude = ?, longitude = ? WHERE id = ?",
      [name, address, city, latitude, longitude, id]
    );

    // comprobar si alguna fila fue realmente actualizada
    // check if any row was actually updated

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "gimnasio no encontrado" });
    }

    // enviar una respuesta de éxito
    // send a success response

    res.status(200).json({ message: "gimnasio actualizado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

// eliminar un gimnasio existente (solo para administradores)
// delete an existing gym (admin only)

const deleteGym = async (req, res) => {
  try {
    // obtener el id del gimnasio de los parámetros de la url
    // get the gym id from the url parameters

    const { id } = req.params;

    // ejecutar la consulta sql para eliminar el gimnasio
    // execute the sql query to delete the gym

    const [result] = await db.query("DELETE FROM gyms WHERE id = ?", [id]);

    // comprobar si alguna fila fue realmente eliminada
    // check if any row was actually deleted

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "gimnasio no encontrado" });
    }

    // enviar una respuesta de éxito sin contenido (204)
    // send a success response with no content (204)

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

module.exports = {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
};
