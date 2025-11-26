const db = require("../../config/db");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");
const jwt = require("jsonwebtoken");

/* ========================================
 * Obtener todos los gimnasios con filtros y paginación
 * Get all gyms with filters and pagination
 * ======================================== */
const getAllGyms = async (req, res) => {
  try {
    // 1. Obtener filtros y paginación de la query string
    // 1. Get filters and pagination from query string
    const { city, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 2. Intentar autenticar opcionalmente al usuario
    // 2. Attempt to optionally authenticate the user
    let user = null;
    let userRole = "guest"; // Rol por defecto / Default role
    let homeGymId = null;

    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = decoded; // Contiene { id, role, home_gym_id } / Contains { id, role, home_gym_id }
        userRole = user.role;
        homeGymId = user.home_gym_id;
      } catch (error) {
        // El token es inválido o ha expirado, proceder como invitado.
        // Token is invalid or expired, proceed as guest.
        console.warn("getAllGyms: Token inválido o expirado. Procediendo como invitado.");
      }
    }

    // 3. Construir query base y de conteo
    // 3. Build base and count query
    let baseQuery = "FROM gyms WHERE id != 1 AND is_deleted = 0";
    const params = [];
    let filterClause = "";

    // 4. Aplicar filtros de suspensión basados en el rol
    // 4. Apply suspension filters based on role
    if (userRole === "guest" || userRole === "user") {
      baseQuery += " AND is_suspended = 0";
    } else if (userRole === "manager") {
      baseQuery += ` AND (is_suspended = 0 OR id = ?)`;
      params.push(homeGymId);
    }
    // Para 'admin', no se añade filtro de is_suspended, ya ven todos los que no estén eliminados.
    // For 'admin', no is_suspended filter is added, they see all non-deleted gyms.

    // 5. Aplicar filtros de ciudad y búsqueda (ya existentes)
    // 5. Apply city and search filters (existing)
    if (city) {
      filterClause += " AND city = ?";
      params.push(city);
    }

    if (search) {
      filterClause += " AND (name LIKE ? OR city LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    baseQuery += filterClause;

    // 6. Ejecutar query de conteo
    // 6. Execute count query
    const [totalResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = totalResult[0].total;

    // 7. Construir y ejecutar query de datos paginados
    // 7. Build and execute paginated data query
    const dataQuery = `SELECT *, is_suspended ${baseQuery} ORDER BY name ASC LIMIT ? OFFSET ?`;
    const [rows] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    // 8. Devolver resultados paginados
    // 8. Return paginated results
    res.status(200).json({
      data: rows,
      total,
    });
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

    // 2. Ejecutar la consulta SQL para buscar por ID (solo gimnasios activos)
    // 2. Execute the SQL query to find by ID (active gyms only)
    // ---  Añadido 'is_deleted = 0' ---
    // --- Added 'is_deleted = 0' ---
    const [rows] = await db.query(
      "SELECT * FROM gyms WHERE id = ? AND is_deleted = 0",
      [id]
    );

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
 * Crear Gimnasio + Manager Automático (con datos reales del manager)
 * Create Gym + Automatic Manager (with real manager data)
 * ======================================== */
const createGym = async (req, res) => {
  try {
    // 1. Obtener datos del formulario (incluyendo datos reales del manager)
    // 1. Get form data (including real manager data)
    const {
      name,
      address,
      city,
      latitude,
      longitude,
      gym_hours, // Añadido campo de horario / Added gym hours field
      manager_first_name,
      manager_last_name,
      manager_phone,
      manager_password,
    } = req.body;

    // 2. Validar campos obligatorios (incluyendo datos del manager)
    // 2. Validate required fields (including manager data)
    if (
      !name ||
      !address ||
      !city ||
      !latitude ||
      !longitude ||
      !manager_first_name ||
      !manager_last_name ||
      !manager_password
    ) {
      return res.status(400).json({
        message:
          "Nombre del gimnasio, dirección, ciudad, coordenadas, datos del manager (nombre y apellidos) y contraseña son obligatorios.",
      });
    }

    // 3. Validar longitud mínima de nombres del manager
    // 3. Validate minimum length of manager names
    if (manager_first_name.trim().length < 2) {
      return res.status(400).json({
        message: "El nombre del manager debe tener al menos 2 caracteres.",
      });
    }

    if (manager_last_name.trim().length < 2) {
      return res.status(400).json({
        message: "Los apellidos del manager deben tener al menos 2 caracteres.",
      });
    }

    // 4. Validar y parsear coordenadas
    // 4. Validate and parse coordinates
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

    // 5. Crear gimnasio en la base de datos
    // 5. Create gym in database
    // (Se crea con is_deleted = 0 por el valor DEFAULT del schema)
    // (It is created with is_deleted = 0 by the schema DEFAULT value)
    const [gymResult] = await db.query(
      "INSERT INTO gyms (name, address, city, latitude, longitude, gym_hours) VALUES (?, ?, ?, ?, ?, ?)",
      [name, address, city, lat, lon, gym_hours || null] // Añadido gym_hours
    );

    const gymId = gymResult.insertId;

    // 6. Generar email automático para el manager
    // 6. Generate automatic email for the manager
    const cleanName = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos / Remove accents
      .replace(/\s+/g, "") // Quitar espacios / Remove spaces
      .replace(/[^a-z0-g]/g, ""); // Solo letras y números / Only letters and numbers (fixed typo)

    const managerEmail = `${cleanName}@gymnomads.com`;

    // 7. Verificar que el email no exista (prevenir gimnasios duplicados)
    // 7. Verify that the email doesn't exist (prevent duplicate gyms)
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

    // 8. Hashear contraseña del manager
    // 8. Hash manager password
    const hashedPassword = await bcrypt.hash(manager_password, 10);

    // 9. Crear manager con DATOS REALES
    // 9. Create manager with REAL DATA
    const [managerResult] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, phone, home_gym_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        manager_first_name.trim(),
        manager_last_name.trim(),
        managerEmail, // email generado automáticamente / auto-generated email
        hashedPassword, // password hasheado / hashed password
        manager_phone?.trim() || null,
        gymId, // gimnasio recién creado / newly created gym
        "manager", // rol = manager
      ]
    );

    // 10. Enviar respuesta de éxito con datos del gym y manager
    // 10. Send success response with gym and manager data
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
        gym_hours: gym_hours || null, // Añadido gym_hours
      },
      newManager: {
        id: managerResult.insertId,
        first_name: manager_first_name.trim(),
        last_name: manager_last_name.trim(),
        email: managerEmail,
        phone: manager_phone?.trim() || null,
        role: "manager",
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
    const { name, address, city, latitude, longitude, gym_hours } = req.body; // Añadido gym_hours

    // 3. Validar que todos los campos necesarios estén presentes
    // 3. Validate that all required fields are present
    if (!name || !address || !city || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "todos los campos son requeridos" });
    }

    // 4. Ejecutar la consulta SQL para actualizar el gimnasio
    // 4. Execute the SQL query to update the gym
    // (Solo actualiza gimnasios que no estén borrados)
    // (Only updates gyms that are not deleted)
    const [result] = await db.query(
      "UPDATE gyms SET name = ?, address = ?, city = ?, latitude = ?, longitude = ?, gym_hours = ? WHERE id = ? AND is_deleted = 0",
      [name, address, city, latitude, longitude, gym_hours || null, id] // Añadido gym_hours
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
 * Eliminar Gimnasio (Borrado Lógico) y su Manager (Borrado Físico)
 * Delete Gym (Logical) and its Manager (Physical)
 * ======================================== */
const deleteGym = async (req, res) => {
  const { id } = req.params;
  let connection; // Definir la conexión fuera del try para que esté disponible en finally

  try {
    // 1. PROTECCIÓN: No permitir eliminar gimnasio ID=1 (administración del sistema)
    if (Number(id) === 1) {
      return res.status(403).json({
        message:
          "No se puede eliminar el gimnasio de administración del sistema.",
      });
    }

    // 2. Obtener una conexión del pool
    connection = await db.getConnection();

    // 3. Iniciar una transacción
    await connection.beginTransaction();

    // 4. Marcar el gimnasio como eliminado (Soft Delete)
    const [gymResult] = await connection.query(
      "UPDATE gyms SET is_deleted = 1 WHERE id = ?",
      [id]
    );

    // Si no se encontró el gimnasio, no hay nada que hacer.
    if (gymResult.affectedRows === 0) {
      await connection.rollback(); // Revertir por si acaso, aunque no se hizo nada
      connection.release();
      return res.status(404).json({ message: "Gimnasio no encontrado." });
    }

    // 5. Eliminar físicamente al manager asociado a ese gimnasio
    await connection.query(
      "DELETE FROM users WHERE home_gym_id = ? AND role = 'manager'",
      [id]
    );
    // No compruebo affectedRows aquí, porque podría no existir un manager,
    // lo cual no es un error.

    // 6. Si todo fue bien, confirmar la transacción
    await connection.commit();

    // 7. Enviar respuesta de éxito
    res.status(200).json({
      message: "Gimnasio eliminado y manager asociado borrado con éxito.",
    });
  } catch (error) {
    // 8. Si hay algún error, revertir la transacción
    if (connection) {
      await connection.rollback();
    }
    console.error(`Error al eliminar el gimnasio: ${error}`);
    res.status(500).json({ message: "Error interno del servidor." });
  } finally {
    // 9. En cualquier caso, liberar la conexión de vuelta al pool
    if (connection) {
      connection.release();
    }
  }
};

/* ========================================
 * Obtener usuarios de un gimnasio con búsqueda y paginación (Admin/Manager)
 * Get users from a gym with search and pagination (Admin/Manager)
 * ======================================== */
const getUsersByGym = async (req, res) => {
  try {
    // 1. Obtener IDs y parámetros de la petición
    // 1. Get IDs and parameters from the request
    const { gymId } = req.params;
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 2. Construir query base y de conteo
    // 2. Build base and count query
    let baseQuery = `
      FROM users 
      WHERE home_gym_id = ? AND role = 'user'
    `;
    const params = [gymId];
    let filterClause = "";

    // 3. Aplicar filtro de búsqueda
    // 3. Apply search filter
    if (search) {
      filterClause += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    baseQuery += filterClause;

    // 4. Ejecutar query de conteo
    // 4. Execute count query
    const [totalResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = totalResult[0].total;

    // 5. Construir y ejecutar query de datos paginados
    // 5. Build and execute paginated data query
    const dataQuery = `
      SELECT id, first_name, last_name, email, role, registered_at, profile_picture
      ${baseQuery}
      ORDER BY registered_at DESC
      LIMIT ?
      OFFSET ?
    `;
    const [users] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    // 6. Construir URLs completas para las imágenes
    // 6. Build full URLs for images
    const baseUrl = process.env.BASE_URL || "";
    const usersWithFullUrls = users.map((user) => {
      if (user.profile_picture) {
        user.profile_picture = `${baseUrl}/${user.profile_picture.replace(/\\/g, "/")}`;
      }
      return user;
    });

    // 7. Devolver resultados paginados
    // 7. Return paginated results
    res.status(200).json({
      data: usersWithFullUrls,
      total,
    });
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

    // 2. Obtener la ruta de la imagen antigua (solo de gimnasios activos)
    // 2. Get the old image path (active gyms only)
    //  Añadido 'is_deleted = 0' ---
    //  Added 'is_deleted = 0' ---
    const [gyms] = await db.query(
      `SELECT ${imageColumnName} FROM gyms WHERE id = ? AND is_deleted = 0`,
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

/* ========================================
 * Cambiar estado de suspensión de un gimnasio (Admin)
 * Toggle suspension status of a gym (Admin)
 * ======================================== */
const toggleSuspension = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validar que el ID del gimnasio no sea el de administración (ID = 1)
    // 1. Validate that the gym ID is not the administration one (ID = 1)
    if (Number(id) === 1) {
      return res.status(403).json({
        message: "No se puede suspender/reactivar el gimnasio de administración del sistema.",
      });
    }

    // 2. Obtener el estado actual de is_suspended del gimnasio
    // 2. Get the current is_suspended status of the gym
    const [gyms] = await db.query(
      "SELECT is_suspended FROM gyms WHERE id = ? AND is_deleted = 0",
      [id]
    );

    if (gyms.length === 0) {
      return res.status(404).json({ message: "Gimnasio no encontrado o ya eliminado." });
    }

    const currentStatus = gyms[0].is_suspended;
    const newStatus = currentStatus === 0 ? 1 : 0; // Invertir el estado / Invert the status

    // 3. Actualizar el estado is_suspended en la base de datos
    // 3. Update the is_suspended status in the database
    await db.query("UPDATE gyms SET is_suspended = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    // 4. Enviar respuesta de éxito
    // 4. Send success response
    res.status(200).json({
      message: `Gimnasio ${newStatus === 1 ? "suspendido" : "reactivado"} con éxito.`,
      is_suspended: newStatus,
    });
  } catch (error) {
    console.error(`Error al cambiar el estado de suspensión del gimnasio: ${error}`);
    res.status(500).json({ message: "Error interno del servidor." });
  }
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
  toggleSuspension,
};
