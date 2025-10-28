const db = require("../../config/db");

const fs = require("fs/promises");
// Función para obtener todos los gimnasios o filtrar gimansio por ciudad
// Function to get all gyms or filter by city

const getAllGyms = async (req, res) => {
  try {
    const { city } = req.query;

    let query = "SELECT * FROM gyms";
    const params = [];

    if (city) {
      // Si hay filtro, añade WHERE // If there is a filter, add WHERE
      query += " WHERE city = ?";
      params.push(city);
    }

    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
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

// Crear un nuevo gimnasio (solo para administradores) - MANEJA ARCHIVOS
// Create a new gym (admin only) -  HANDLES FILES
const createGym = async (req, res) => {
  try {
    // Los campos de texto SÍ están en req.body gracias a Multer
    // Text fields ARE in req.body thanks to Multer
    const { name, address, city, latitude, longitude } = req.body;

    // Los archivos están en req.files (si se subieron y si Multer usó .fields())
    // Files are in req.files (if uploaded and if Multer used .fields())

    const files = req.files;
    const logoFile = files?.logo?.[0]; // Acceder al logo (si existe)
    const mainImageFile = files?.mainImage?.[0]; // Acceder a la imagen principal (si existe)

    // Validación básica de campos de texto
    // Basic validation for text fields
    if (!name || !address || !city || !latitude || !longitude) {
      console.error(
        "Faltan campos obligatorios: nombre, dirección, ciudad, latitud y longitud"
      );
      return res
        .status(400)
        .json({
          message:
            "Nombre, Dirección, Ciudad, latitud y longitud son campos requeridos",
        });
    }

    // Construir rutas de archivo para guardar en la BD (solo si se subieron)
    // Build file paths to save in the DB (only if uploaded)

    const logoUrl = logoFile ? `uploads/gym_logos/${logoFile.filename}` : null;
    const mainImageUrl = mainImageFile
      ? `uploads/gym_images/${mainImageFile.filename}`
      : null;

    // Convertir lat/lon a número o null (más robusto)
    // Convert lat/lon to number or null (more robust)
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res
        .status(400)
        .json({ message: "Latitud y longitud deben ser números válidos" });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res
        .status(400)
        .json({ message: "Coordenadas fuera de rango válido" });
    }

    // Ejecutar la consulta sql para insertar el nuevo gimnasio CON IMÁGENES
    // Execute the sql query to insert the new gym WITH IMAGES
    const query =
      "INSERT INTO gyms (name, address, city, latitude, longitude, logo_url, main_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    // Especificar <ResultSetHeader> si usas TS y mysql2/promise
    // Specify <ResultSetHeader> if using TS and mysql2/promise
    const [result] /* : [ResultSetHeader, FieldPacket[]] */ = await db.query(
      query,
      [name, address, city, lat, lon, logoUrl, mainImageUrl]
    );

    // Enviar una respuesta de éxito con el código 201 created
    // Send a success response with the 201 created code
    if (result.affectedRows === 1) {
      // Comprobación más segura // Safer check
      res.status(201).json({
        message: "Gimnasio creado con éxito",
        gymId: result.insertId,
        // Devolver el objeto completo para posible uso en frontend
        // Return the full object for potential frontend use
        newGym: {
          id: result.insertId,
          name,
          address,
          city,
          latitude: lat,
          longitude: lon,
          logo_url: logoUrl,
          main_image_url: mainImageUrl,
        },
      });
    } else {
      // Si por alguna razón no se insertó la fila
      // If for some reason the row was not inserted
      throw new Error(
        "La inserción en la base de datos no afectó ninguna fila."
      );
    }
  } catch (error) {
    console.error(`Error al crear el gimnasio: ${error}`);
    // Intentar no borrar el archivo si falla la BD (o implementar rollback)
    // Try not to delete the file if DB fails (or implement rollback)
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear el gimnasio" });
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

// obtener todos los usuarios de un gimnasio específico (solo para administradores)
// get all users for a specific gym (admin only)

const getUsersByGym = async (req, res) => {
  try {
    // obtener el id del gimnasio de los parámetros de la url
    // get the gym id from the url parameters

    const { gymId } = req.params;

    // ejecutar la consulta para obtener los datos de los usuarios de ese gimnasio
    // execute the query to get the user data for that gym

    const [users] = await db.query(
      "SELECT id, first_name, last_name, email, role FROM users WHERE home_gym_id = ?",
      [gymId]
    );

    // si no se encuentran usuarios para ese gimnasio, devuelvo un array vacío, lo cual es correcto
    // if no users are found for that gym, i return an empty array, which is correct

    res.status(200).json(users);
  } catch (error) {
    console.error(`Error al obtener todos los usuarios del gimansio: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

// --- LÓGICA PARA SUBIDA DE IMÁGENES / UPLOAD IMAGE LOGIC ---

// Función genérica para actualizar una imagen de un gimnasio (logo o principal)
// Generic function to update a gym image (logo or main)

const updateGymImage = async (req, res, imageColumnName) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "no se ha subido ningún archivo" });
    }

    const { id } = req.params;
    const newFilePath = req.file.path;

    // 1. obtener la ruta de la imagen antigua
    const [gyms] = await db.query(
      `SELECT ${imageColumnName} FROM gyms WHERE id = ?`,
      [id]
    );

    if (gyms.length === 0) {
      return res.status(404).json({ message: "gimnasio no encontrado" });
    }
    const oldFilePath = gyms[0]?.[imageColumnName];

    // 2. actualizo la base de datos con la nueva ruta
    await db.query(`UPDATE gyms SET ${imageColumnName} = ? WHERE id = ?`, [
      newFilePath,
      id,
    ]);

    // 3. borro el archivo antiguo si existía
    if (oldFilePath) {
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.error(
          `error al borrar la imagen antigua (${imageColumnName}):`,
          err
        );
      }
    }

    res.status(200).json({
      message: `imagen (${imageColumnName}) actualizada con éxito`,
      filePath: newFilePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

// controlador específico para subir el logo
// specific controller to upload the logo

const uploadLogo = (req, res) => {
  updateGymImage(req, res, "logo_url");
};

// controlador específico para subir la imagen principal
// specific controller to upload the main image

const uploadMainImage = (req, res) => {
  updateGymImage(req, res, "main_image_url");
};

module.exports = {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  getUsersByGym,
  uploadLogo,
  uploadMainImage,
};
