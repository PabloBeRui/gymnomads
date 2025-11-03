const db = require("../../config/db");

// Crear una nueva visita
// Create a new visit

const createVisit = async (req, res) => {
  try {
    // El ID del usuario se obtiene del token, a través del middleware
    // get the user ID from the token, via the middleware

    const user_id = req.user.userId;
    // El ID del gimnasio se obtiene del cuerpo de la petición
    //  get the gym ID from the request body

    const { gym_id } = req.body;

    // Comprobar que se ha enviado el gym_id
    // Check if gym_id was sent

    if (!gym_id) {
      // 400 Bad Request: la petición es incorrecta o está incompleta
      console.log(
        "400 Bad Request: la petición es incorrecta o está incompleta, se requiere id del gimanasio"
      );
      return res
        .status(400)
        .json({ message: "Se requiere el ID del gimnasio" });
    }

    // Insertar la nueva visita en la base de datos
    // Insert the new visit into the database
    const [result] = await db.query(
      "INSERT INTO visits (user_id, gym_id) VALUES (?, ?)",
      [user_id, gym_id]
    );

    // Enviar una respuesta de éxito
    // Send a success response
    res.status(201).json({
      message: "Visita registrada con éxito",
      visitId: result.insertId,
    });
  } catch (error) {
    console.error(`error: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todas las visitas de un usuario específico
// Get all visits for a specific user

const getVisitsByUser = async (req, res) => {
  try {
    // Obtener el ID del usuario de los parámetros de la URL
    // Get the user ID from the URL parameters
    const { userId } = req.params;

    // Medida de seguridad: un usuario solo puede ver su propio historial
    // Security measure: a user can only view their own history
    if (req.user.userId !== parseInt(userId)) {
      // 403 Forbidden: tienes un token válido, pero no tienes permiso para ver esto
      return res.status(403).json({ message: "Acceso prohibido" });
    }

    // Une la tabla 'visits' con 'gyms' para obtener también el nombre del gimnasio
    //  join the 'visits' table with 'gyms' to also get the gym's name

    const [visits] = await db.query(
      `SELECT visits.id, visits.visited_at, gyms.name AS gym_name, gyms.city 
       FROM visits 
       JOIN gyms ON visits.gym_id = gyms.id 
       WHERE visits.user_id = ? 
       ORDER BY visits.visited_at DESC`,
      [userId]
    );

    res.status(200).json(visits);
  } catch (error) {
    console.error(`error:${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los visitantes de un gimnasio específico
// Get all visitors for a specific gym

const getVisitsByGym = async (req, res) => {
  try {
    const { gymId } = req.params;

    // Unir 'visits' con 'users' para obtener el nombre del visitante
    // join 'visits' with 'users' to get the visitor's name

    const [visits] = await db.query(
      `SELECT visits.id, visits.visited_at, users.first_name, users.last_name 
       FROM visits 
       JOIN users ON visits.user_id = users.id 
       WHERE visits.gym_id = ? 
       ORDER BY visits.visited_at DESC`,
      [gymId]
    );

    res.status(200).json(visits);
  } catch (error) {
    console.error(`error:${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todas las visitas con filtros (Admin)
// Get all visits with filters (Admin)
const getAllVisits = async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    // Verify user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acceso prohibido. Solo administradores." });
    }

    // Obtener parámetros de filtro opcionales
    // Get optional filter parameters
    const { gym_id, user_search } = req.query;

    // Construir consulta SQL dinámica
    // Build dynamic SQL query
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

    // Filtro por gimnasio
    // Filter by gym
    if (gym_id) {
      query += ` AND visits.gym_id = ?`;
      params.push(gym_id);
    }

    // Filtro por búsqueda de usuario (nombre o email)
    // Filter by user search (name or email)
    if (user_search) {
      query += ` AND (
        CONCAT(users.first_name, ' ', users.last_name) LIKE ? 
        OR users.email LIKE ?
      )`;
      const searchPattern = `%${user_search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Ordenar por fecha descendente
    // Order by date descending
    query += ` ORDER BY visits.visited_at DESC`;

    const [visits] = await db.query(query, params);

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error al obtener visitas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener visitas del gimnasio del manager
// Get visits from manager's gym
const getManagerGymVisits = async (req, res) => {
  try {
    // Verificar que el usuario sea manager
    // Verify user is manager
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Acceso prohibido. Solo managers." });
    }

    // Obtener el home_gym_id del manager
    // Get the manager's home_gym_id
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

    // Obtener parámetros de filtro opcionales
    // Get optional filter parameters
    const { user_search } = req.query;

    // Construir consulta SQL
    // Build SQL query
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

    // Filtro por búsqueda de usuario
    // Filter by user search
    if (user_search) {
      query += ` AND (
        CONCAT(users.first_name, ' ', users.last_name) LIKE ? 
        OR users.email LIKE ?
      )`;
      const searchPattern = `%${user_search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Ordenar por fecha descendente
    // Order by date descending
    query += ` ORDER BY visits.visited_at DESC`;

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
