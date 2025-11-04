const db = require("../../config/db");
const bcrypt = require("bcrypt");
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

/* ========================================
 * Crear Gimnasio + Manager Automático
 * Create Gym + Automatic Manager
 * ======================================== */
const createGym = async (req, res) => {
  try {
    // Obtener datos del formulario / Get form data
    const { name, address, city, latitude, longitude, password, phone } =
      req.body;

    // Validación básica de campos / Basic field validation
    if (!name || !address || !city || !latitude || !longitude || !password) {
      return res.status(400).json({
        message:
          "Nombre, dirección, ciudad, coordenadas y contraseña son obligatorios.",
      });
    }

    // Validar coordenadas / Validate coordinates
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        message: "Latitud y longitud deben ser números válidos.",
      });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        message: "Coordenadas fuera de rango válido.",
      });
    }

    // PASO 1: CREAR GIMNASIO / STEP 1: CREATE GYM
    const [gymResult] = await db.query(
      "INSERT INTO gyms (name, address, city, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
      [name, address, city, lat, lon]
    );

    const gymId = gymResult.insertId;

    // PASO 2: GENERAR EMAIL AUTOMÁTICO PARA EL MANAGER / STEP 2: GENERATE AUTOMATIC EMAIL FOR MANAGER
    // Limpiar nombre: quitar acentos, espacios, caracteres especiales
    // Clean name: remove accents, spaces, special characters
    const cleanName = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos / Remove accents
      .replace(/\s+/g, "") // Quitar espacios / Remove spaces
      .replace(/[^a-z0-9]/g, ""); // Solo letras y números / Only letters and numbers

    const managerEmail = `${cleanName}@gymnomads.com`;

    // PASO 3: VERIFICAR QUE EL EMAIL NO EXISTA (seguridad) / STEP 3: VERIFY EMAIL DOESN'T EXIST (security)
    const [existingEmail] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [managerEmail]
    );

    if (existingEmail.length > 0) {
      // Si el email ya existe, eliminar el gimnasio creado (rollback manual)
      // If email exists, delete the created gym (manual rollback)
      await db.query("DELETE FROM gyms WHERE id = ?", [gymId]);
      return res.status(409).json({
        message: `El email ${managerEmail} ya está en uso. El nombre del gimnasio debe ser único.`,
      });
    }

    // PASO 4: HASHEAR CONTRASEÑA / STEP 4: HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // PASO 5: CREAR MANAGER AUTOMÁTICAMENTE / STEP 5: CREATE MANAGER AUTOMATICALLY
    const [managerResult] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, phone, home_gym_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        name, // first_name = nombre del gimnasio / gym name
        name, // last_name = nombre del gimnasio / gym name
        managerEmail, // email generado automáticamente / auto-generated email
        hashedPassword, // password hasheado / hashed password
        phone || null, // teléfono opcional / optional phone
        gymId, // gimnasio recién creado / newly created gym
        "manager", // rol = manager
      ]
    );

    // PASO 6: RESPUESTA DE ÉXITO / STEP 6: SUCCESS RESPONSE
    res.status(201).json({
      message: "Gimnasio y manager creados con éxito",
      gymId: gymId,
      managerId: managerResult.insertId,
      managerEmail: managerEmail,
      newGym: {
        id: gymId,
        name,
        address,
        city,
        latitude: lat,
        longitude: lon,
      },
    });
  } catch (error) {
    console.error(`Error al crear el gimnasio: ${error}`);
    res.status(500).json({
      message: "Error interno del servidor al crear el gimnasio",
    });
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

/* ========================================
 * Eliminar Gimnasio (con protección ID=1)
 * Delete Gym (with ID=1 protection)
 * ======================================== */
const deleteGym = async (req, res) => {
  try {
    // obtener el id del gimnasio de los parámetros de la url
    // get the gym id from the url parameters

    const { id } = req.params;

    // PROTECCIÓN: No permitir eliminar gimnasio ID=1 (administración)
    // PROTECTION: Cannot delete gym ID=1 (administration)
    if (Number(id) === 1) {
      return res.status(403).json({
        message:
          "No se puede eliminar el gimnasio de administración del sistema.",
      });
    }

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
