const db = require("../../config/db");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");

/* ========================================
 * Obtener todos los gimnasios o filtrar por ciudad
 * Get all gyms or filter by city
 * ======================================== */
const getAllGyms = async (req, res) => {
  try {
    // 1. Obtener filtro de ciudad de la query string (opcional)
    // 1. Get city filter from query string (optional)
    const { city } = req.query;

    // 2. Construir query base
    // 2. Build base query
    let query = "SELECT * FROM gyms";
    const params = [];

    // 3. Aplicar filtro por ciudad si se proporciona
    // 3. Apply city filter if provided
    if (city) {
      query += " WHERE city = ?";
      params.push(city);
    }

    // 4. Ejecutar la consulta y devolver resultados
    // 4. Execute the query and return results
    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/* ========================================
 * Obtener un gimnasio por ID
 * Get a gym by ID
 * ======================================== */
const getGymById = async (req, res) => {
  try {
    // 1. Obtener el ID de los parámetros de la URL
    // 1. Get the ID from the URL parameters
    const { id } = req.params;

    // 2. Ejecutar la consulta SQL para buscar por ID
    // 2. Execute the SQL query to find by ID
    const [rows] = await db.query("SELECT * FROM gyms WHERE id = ?", [id]);

    // 3. Comprobar si se encontró el gimnasio
    // 3. Check if the gym was found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Gimnasio no encontrado" });
    }

    // 4. Devolver los datos del gimnasio
    // 4. Return the gym data
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

/* ========================================
 * Crear Gimnasio + Manager Automático
 * Create Gym + Automatic Manager
 * ======================================== */
const createGym = async (req, res) => {
  try {
    // 1. Obtener datos del formulario
    // 1. Get form data
    const { name, address, city, latitude, longitude, password, phone } =
      req.body;

    // 2. Validar campos obligatorios
    // 2. Validate required fields
    if (!name || !address || !city || !latitude || !longitude || !password) {
      return res.status(400).json({
        message:
          "Nombre, dirección, ciudad, coordenadas y contraseña son obligatorios.",
      });
    }

    // 3. Validar y parsear coordenadas
    // 3. Validate and parse coordinates
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

    // 4. Crear gimnasio en la base de datos
    // 4. Create gym in database
    const [gymResult] = await db.query(
      "INSERT INTO gyms (name, address, city, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
      [name, address, city, lat, lon]
    );

    const gymId = gymResult.insertId;

    // 5. Generar email automático para el manager
    // 5. Generate automatic email for the manager
    const cleanName = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos / Remove accents
      .replace(/\s+/g, "") // Quitar espacios / Remove spaces
      .replace(/[^a-z0-9]/g, ""); // Solo letras y números / Only letters and numbers

    const managerEmail = `${cleanName}@gymnomads.com`;

    // 6. Verificar que el email no exista (prevenir gimnasios duplicados)
    // 6. Verify that the email doesn't exist (prevent duplicate gyms)
    const [existingEmail] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [managerEmail]
    );

    if (existingEmail.length > 0) {
      // Rollback manual: eliminar el gimnasio creado
      // Manual rollback: delete the created gym
      await db.query("DELETE FROM gyms WHERE id = ?", [gymId]);
      return res.status(409).json({
        message: `El email ${managerEmail} ya está en uso. El nombre del gimnasio debe ser único.`,
      });
    }

    // 7. Hashear contraseña del manager
    // 7. Hash manager password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Crear manager automáticamente
    // 8. Create manager automatically
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

    // 9. Enviar respuesta de éxito con datos del gym y manager
    // 9. Send success response with gym and manager data
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

/* ========================================
 * Actualizar un gimnasio existente (Admin)
 * Update an existing gym (Admin)
 * ======================================== */
const updateGym = async (req, res) => {
  try {
    // 1. Obtener el ID del gimnasio de los parámetros de la URL
    // 1. Get the gym ID from the URL parameters
    const { id } = req.params;

    // 2. Obtener los nuevos datos del cuerpo de la petición
    // 2. Get the new data from the request body
    const { name, address, city, latitude, longitude } = req.body;

    // 3. Validar que todos los campos necesarios estén presentes
    // 3. Validate that all required fields are present
    if (!name || !address || !city || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "todos los campos son requeridos" });
    }

    // 4. Ejecutar la consulta SQL para actualizar el gimnasio
    // 4. Execute the SQL query to update the gym
    const [result] = await db.query(
      "UPDATE gyms SET name = ?, address = ?, city = ?, latitude = ?, longitude = ? WHERE id = ?",
      [name, address, city, latitude, longitude, id]
    );

    // 5. Comprobar si alguna fila fue actualizada
    // 5. Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "gimnasio no encontrado" });
    }

    // 6. Enviar respuesta de éxito
    // 6. Send success response
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
    // 1. Obtener el ID del gimnasio de los parámetros de la URL
    // 1. Get the gym ID from the URL parameters
    const { id } = req.params;

    // 2. PROTECCIÓN: No permitir eliminar gimnasio ID=1 (administración del sistema)
    // 2. PROTECTION: Cannot delete gym ID=1 (system administration)
    if (Number(id) === 1) {
      return res.status(403).json({
        message:
          "No se puede eliminar el gimnasio de administración del sistema.",
      });
    }

    // 3. Ejecutar la consulta SQL para eliminar el gimnasio
    // 3. Execute the SQL query to delete the gym
    const [result] = await db.query("DELETE FROM gyms WHERE id = ?", [id]);

    // 4. Comprobar si alguna fila fue eliminada
    // 4. Check if any row was deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "gimnasio no encontrado" });
    }

    // 5. Enviar respuesta de éxito sin contenido (204 No Content)
    // 5. Send success response with no content (204 No Content)
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/* ========================================
 * Obtener usuarios de un gimnasio con búsqueda opcional (Admin/Manager)
 * Get users from a gym with optional search (Admin/Manager)
 * ======================================== */
const getUsersByGym = async (req, res) => {
  try {
    // 1. Obtener el ID del gimnasio de los parámetros de la URL
    // 1. Get the gym ID from the URL parameters
    const { gymId } = req.params;

    // 2. Obtener parámetro de búsqueda de la query string (opcional)
    // 2. Get search parameter from query string (optional)
    const { search } = req.query;

    // 3. Construir query base para obtener usuarios del gimnasio
    // 3. Build base query to get gym users
    let query = `
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        role, 
        registered_at 
      FROM users 
      WHERE home_gym_id = ? AND role = 'user'
    `;
    const params = [gymId];

    // 4. Aplicar filtro de búsqueda por nombre o email (si se proporciona)
    // 4. Apply search filter by name or email (if provided)
    if (search) {
      query +=
        " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 5. Ordenar por fecha de registro descendente
    // 5. Order by registration date descending
    query += " ORDER BY registered_at DESC";

    // 6. Ejecutar la consulta y devolver resultados
    // 6. Execute the query and return results
    const [users] = await db.query(query, params);
    res.status(200).json(users);
  } catch (error) {
    console.error(`Error al obtener usuarios del gimnasio: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/* ========================================
 * Función genérica para actualizar imagen de gimnasio (logo o imagen principal)
 * Generic function to update gym image (logo or main image)
 * ======================================== */
const updateGymImage = async (req, res, imageColumnName) => {
  try {
    // 1. Comprobar que se ha subido un archivo (Multer proporciona req.file)
    // 1. Check that a file was uploaded (Multer provides req.file)
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "no se ha subido ningún archivo" });
    }

    const { id } = req.params;
    const newFilePath = req.file.path;

    // 2. Obtener la ruta de la imagen antigua
    // 2. Get the old image path
    const [gyms] = await db.query(
      `SELECT ${imageColumnName} FROM gyms WHERE id = ?`,
      [id]
    );

    if (gyms.length === 0) {
      return res.status(404).json({ message: "gimnasio no encontrado" });
    }
    const oldFilePath = gyms[0]?.[imageColumnName];

    // 3. Actualizar la base de datos con la nueva ruta
    // 3. Update the database with the new path
    await db.query(`UPDATE gyms SET ${imageColumnName} = ? WHERE id = ?`, [
      newFilePath,
      id,
    ]);

    // 4. Borrar el archivo antiguo (si existía)
    // 4. Delete the old file (if it existed)
    if (oldFilePath) {
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.error(
          `Error al borrar la imagen antigua (${imageColumnName}):`,
          err
        );
        // No detenemos el proceso, la subida fue exitosa
        // We don't stop the process, the upload was successful
      }
    }

    // 5. Enviar respuesta de éxito
    // 5. Send success response
    res.status(200).json({
      message: `imagen (${imageColumnName}) actualizada con éxito`,
      filePath: newFilePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/* ========================================
 * Actualizar logo del gimnasio (Admin/Manager)
 * Update gym logo (Admin/Manager)
 * ======================================== */
const uploadLogo = (req, res) => {
  updateGymImage(req, res, "logo_url");
};

/* ========================================
 * Actualizar imagen principal del gimnasio (Admin/Manager)
 * Update gym main image (Admin/Manager)
 * ======================================== */
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