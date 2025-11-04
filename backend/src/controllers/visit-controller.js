const db = require("../../config/db");

/* ========================================
 * Crear una nueva visita
 * Create a new visit
 * ======================================== */
const createVisit = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario del token (vía middleware)
    // 1. Get the user ID from the token (via middleware)
    const user_id = req.user.userId;

    // 2. Obtener el ID del gimnasio del cuerpo de la petición
    // 2. Get the gym ID from the request body
    const { gym_id } = req.body;

    // 3. Validar que se ha enviado el gym_id
    // 3. Validate that gym_id was sent
    if (!gym_id) {
      console.log(
        "400 Bad Request: la petición es incorrecta o está incompleta, se requiere id del gimnasio"
      );
      return res
        .status(400)
        .json({ message: "Se requiere el ID del gimnasio" });
    }

    // 4. Insertar la nueva visita en la base de datos
    // 4. Insert the new visit into the database
    const [result] = await db.query(
      "INSERT INTO visits (user_id, gym_id) VALUES (?, ?)",
      [user_id, gym_id]
    );

    // 5. Enviar respuesta de éxito (201 Created)
    // 5. Send success response (201 Created)
    res.status(201).json({
      message: "Visita registrada con éxito",
      visitId: result.insertId,
    });
  } catch (error) {
    console.error(`error: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Obtener todas las visitas de un usuario específico
 * Get all visits for a specific user
 * ======================================== */
const getVisitsByUser = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario de los parámetros de la URL
    // 1. Get the user ID from the URL parameters
    const { userId } = req.params;

    // 2. Medida de seguridad: un usuario solo puede ver su propio historial
    // 2. Security measure: a user can only view their own history
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ message: "Acceso prohibido" });
    }

    // 3. Unir tabla 'visits' con 'gyms' para obtener datos del gimnasio
    // 3. Join 'visits' table with 'gyms' to get gym data
    const [visits] = await db.query(
      `SELECT 
        visits.id, 
        visits.visited_at, 
        gyms.name AS gym_name, 
        gyms.city 
       FROM visits 
       JOIN gyms ON visits.gym_id = gyms.id 
       WHERE visits.user_id = ? 
       ORDER BY visits.visited_at DESC`,
      [userId]
    );

    // 4. Devolver lista de visitas
    // 4. Return visits list
    res.status(200).json(visits);
  } catch (error) {
    console.error(`error: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Obtener todos los visitantes de un gimnasio específico
 * Get all visitors for a specific gym
 * ======================================== */
const getVisitsByGym = async (req, res) => {
  try {
    // 1. Obtener el ID del gimnasio de los parámetros de la URL
    // 1. Get the gym ID from the URL parameters
    const { gymId } = req.params;

    // 2. Unir 'visits' con 'users' para obtener datos del visitante
    // 2. Join 'visits' with 'users' to get visitor data
    const [visits] = await db.query(
      `SELECT 
        visits.id, 
        visits.visited_at, 
        users.first_name, 
        users.last_name 
       FROM visits 
       JOIN users ON visits.user_id = users.id 
       WHERE visits.gym_id = ? 
       ORDER BY visits.visited_at DESC`,
      [gymId]
    );

    // 3. Devolver lista de visitantes
    // 3. Return visitors list
    res.status(200).json(visits);
  } catch (error) {
    console.error(`error: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Obtener todas las visitas con filtros opcionales (Admin)
 * Get all visits with optional filters (Admin)
 * ======================================== */
const getAllVisits = async (req, res) => {
  try {
    // 1. Verificar que el usuario sea admin
    // 1. Verify user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acceso prohibido. Solo administradores." });
    }

    // 2. Obtener parámetros de filtro opcionales de la query string
    // 2. Get optional filter parameters from query string
    const { gym_id, user_search } = req.query;

    // 3. Construir consulta SQL dinámica con JOINs
    // 3. Build dynamic SQL query with JOINs
    let query = `
      SELECT 
        visits.id,
        visits.user_id,
        visits.gym_id,
        visits.visited_at AS visit_date,
        CONCAT(users.first_name, ' ', users.last_name) AS user_name,
        users.email AS user_email,
        gyms.name AS gym_name,
        gyms.city AS gym_city
      FROM visits
      JOIN users ON visits.user_id = users.id
      JOIN gyms ON visits.gym_id = gyms.id
      WHERE 1=1
    `;

    const params = [];

    // 4. Aplicar filtro por gimnasio (si se proporciona)
    // 4. Apply filter by gym (if provided)
    if (gym_id) {
      query += ` AND visits.gym_id = ?`;
      params.push(gym_id);
    }

    // 5. Aplicar filtro de búsqueda de usuario por nombre o email (si se proporciona)
    // 5. Apply user search filter by name or email (if provided)
    if (user_search) {
      query += ` AND (
        CONCAT(users.first_name, ' ', users.last_name) LIKE ? 
        OR users.email LIKE ?
      )`;
      const searchPattern = `%${user_search}%`;
      params.push(searchPattern, searchPattern);
    }

    // 6. Ordenar por fecha de visita descendente
    // 6. Order by visit date descending
    query += ` ORDER BY visits.visited_at DESC`;

    // 7. Ejecutar la consulta y devolver resultados
    // 7. Execute the query and return results
    const [visits] = await db.query(query, params);

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error al obtener visitas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Obtener visitas del gimnasio del manager (Manager)
 * Get visits from manager's gym (Manager)
 * ======================================== */
const getManagerGymVisits = async (req, res) => {
  try {
    // 1. Verificar que el usuario sea manager
    // 1. Verify user is manager
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Acceso prohibido. Solo managers." });
    }

    // 2. Obtener el home_gym_id del manager
    // 2. Get the manager's home_gym_id
    const [managerData] = await db.query(
      "SELECT home_gym_id FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (!managerData || !managerData[0] || !managerData[0].home_gym_id) {
      return res
        .status(404)
        .json({ message: "No tienes un gimnasio asignado." });
    }

    const gymId = managerData[0].home_gym_id;

    // 3. Obtener parámetros de filtro opcionales de la query string
    // 3. Get optional filter parameters from query string
    const { user_search } = req.query;

    // 4. Construir consulta SQL para obtener visitas del gimnasio del manager
    // 4. Build SQL query to get visits from manager's gym
    let query = `
      SELECT 
        visits.id,
        visits.user_id,
        visits.gym_id,
        visits.visited_at AS visit_date,
        CONCAT(users.first_name, ' ', users.last_name) AS user_name,
        users.email AS user_email,
        gyms.name AS gym_name,
        gyms.city AS gym_city
      FROM visits
      JOIN users ON visits.user_id = users.id
      JOIN gyms ON visits.gym_id = gyms.id
      WHERE visits.gym_id = ?
    `;

    const params = [gymId];

    // 5. Aplicar filtro de búsqueda de usuario (si se proporciona)
    // 5. Apply user search filter (if provided)
    if (user_search) {
      query += ` AND (
        CONCAT(users.first_name, ' ', users.last_name) LIKE ? 
        OR users.email LIKE ?
      )`;
      const searchPattern = `%${user_search}%`;
      params.push(searchPattern, searchPattern);
    }

    // 6. Ordenar por fecha de visita descendente
    // 6. Order by visit date descending
    query += ` ORDER BY visits.visited_at DESC`;

    // 7. Ejecutar la consulta y devolver resultados
    // 7. Execute the query and return results
    const [visits] = await db.query(query, params);

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error al obtener visitas del gimnasio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  createVisit,
  getVisitsByUser,
  getVisitsByGym,
  getAllVisits,
  getManagerGymVisits,
};
