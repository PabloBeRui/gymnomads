const db = require("../../config/db");

/* ========================================
 * Crear una nueva visita (con comprobación de duplicados diarios)
 * Create a new visit (with daily duplicate check)
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

    // 4. Lógica de negocio: un usuario no puede visitar su propio gimnasio
    // 4. Business logic: a user cannot visit their own gym
    if (req.user.role === "user" && req.user.home_gym_id === parseInt(gym_id)) {
      console.log(
        "403 Forbidden: el usuario no puede visitar su propio gimnasio"
      );
      return res
        .status(403)
        .json({
          message: "No puedes registrar una visita a tu propio gimnasio",
        });
    }

    // 5. Comprobar si ya existe una visita para este usuario/gimnasio HOY
    // 5. Check if a visit for this user/gym already exists TODAY
    // (CURDATE() compara solo la fecha, ignorando la hora)
    // (CURDATE() compares only the date, ignoring the time)

    const [existingVisit] = await db.query(
      "SELECT id FROM visits WHERE user_id = ? AND gym_id = ? AND DATE(visited_at) = CURDATE()",
      [user_id, gym_id]
    );

    // 6. Si ya existe, devolver el ID de esa visita (200 OK)
    // 6. If it already exists, return that visit's ID (200 OK)
    if (existingVisit.length > 0) {
      console.log(
        "200 OK: Visita existente encontrada para hoy. Devolviendo ID existente."
      );
      return res.status(200).json({
        message: "Ya has registrado una visita a este gimnasio hoy.",
        visitId: existingVisit[0].id, // Devolvemos el ID de la visita encontrada
      });
    }

    // --- FIN DE LA MODIFICACIÓN ---

    // 7. Si no existe, insertar la nueva visita en la base de datos
    // 7. If it doesn't exist, insert the new visit into the database
    const [result] = await db.query(
      "INSERT INTO visits (user_id, gym_id) VALUES (?, ?)",
      [user_id, gym_id]
    );

    // 8. Enviar respuesta de éxito (201 Created)
    // 8. Send success response (201 Created)
    res.status(201).json({
      message: "Visita registrada con éxito",
      visitId: result.insertId, // Devolvemos el ID de la nueva visita
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
    // 1. Obtener el ID del usuario y paginación
    // 1. Get user ID and pagination
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 2. Medida de seguridad
    // 2. Security measure
    if (req.user.userId !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Acceso prohibido" });
    }

    // 3. Construir consulta base
    // 3. Build base query
    const baseQuery = `
      FROM visits 
      JOIN gyms g ON visits.gym_id = g.id 
      WHERE visits.user_id = ?
    `;
    const params = [userId];

    // 4. Ejecutar query de conteo
    // 4. Execute count query
    const [totalResult] = await db.query(`SELECT COUNT(visits.id) as total ${baseQuery}`, params);
    const total = totalResult[0].total;

    // 5. Construir y ejecutar query de datos
    // 5. Build and execute data query
    const dataQuery = `
      SELECT 
        visits.id, visits.visited_at, g.name AS gym_name, g.city, g.logo_url
      ${baseQuery}
      ORDER BY visits.visited_at DESC
      LIMIT ?
      OFFSET ?
    `;
    const [visits] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    // 6. Construir URLs completas
    // 6. Build full URLs
    const baseUrl = process.env.BASE_URL || "";
    const visitsWithUrls = visits.map((visit) => {
      if (visit.logo_url) {
        visit.logo_url = `${baseUrl}/${visit.logo_url.replace(/\\/g, "/")}`;
      }
      return visit;
    });

    // 7. Devolver resultados
    // 7. Return results
    res.status(200).json({
      data: visitsWithUrls,
      total,
    });
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
    // 1. Obtener ID del gimnasio y paginación
    // 1. Get gym ID and pagination
    const { gymId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 2. Construir consulta base
    // 2. Build base query
    const baseQuery = `
      FROM visits 
      JOIN users u ON visits.user_id = u.id 
      WHERE visits.gym_id = ?
    `;
    const params = [gymId];

    // 3. Ejecutar query de conteo
    // 3. Execute count query
    const [totalResult] = await db.query(`SELECT COUNT(visits.id) as total ${baseQuery}`, params);
    const total = totalResult[0].total;

    // 4. Construir y ejecutar query de datos
    // 4. Build and execute data query
    const dataQuery = `
      SELECT 
        visits.id, visits.visited_at, u.first_name, u.last_name, u.profile_picture
      ${baseQuery}
      ORDER BY visits.visited_at DESC
      LIMIT ?
      OFFSET ?
    `;
    const [visits] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    // 5. Construir URLs completas
    // 5. Build full URLs
    const baseUrl = process.env.BASE_URL || "";
    const visitsWithUrls = visits.map((visit) => {
      if (visit.profile_picture) {
        visit.profile_picture = `${baseUrl}/${visit.profile_picture.replace(/\\/g, "/")}`;
      }
      return visit;
    });

    // 6. Devolver resultados
    // 6. Return results
    res.status(200).json({
      data: visitsWithUrls,
      total,
    });
  } catch (error) {
    console.error(`error: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Obtener mis visitas (Usuario logueado)
 * Get my visits (Logged-in user)
 * ======================================== */
const getMyVisits = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario y parámetros
    // 1. Get user ID and parameters
    const userId = req.user.userId;
    const { gym_name, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 2. Construir consulta base
    // 2. Build base query
    let baseQuery = `
      FROM visits v
      JOIN gyms g ON v.gym_id = g.id
      WHERE v.user_id = ?
    `;
    const params = [userId];
    let filterClause = "";

    // 3. Aplicar filtro
    // 3. Apply filter
    if (gym_name) {
      filterClause += ` AND g.name LIKE ?`;
      params.push(`%${gym_name}%`);
    }
    baseQuery += filterClause;

    // 4. Ejecutar query de conteo
    // 4. Execute count query
    const [totalResult] = await db.query(`SELECT COUNT(v.id) as total ${baseQuery}`, params);
    const total = totalResult[0].total;

    // 5. Construir y ejecutar query de datos
    // 5. Build and execute data query
    const dataQuery = `
      SELECT 
        v.id, v.gym_id, v.visited_at AS visit_date, g.name AS gym_name,
        g.city AS gym_city, g.logo_url AS gym_logo_url, g.is_deleted AS is_gym_deleted
      ${baseQuery}
      ORDER BY v.visited_at DESC
      LIMIT ?
      OFFSET ?
    `;
    const [visits] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    // 6. Construir URLs completas
    // 6. Build full URLs
    const baseUrl = process.env.BASE_URL || "";
    const visitsWithUrls = visits.map((visit) => {
      if (visit.gym_logo_url) {
        visit.gym_logo_url = `${baseUrl}/${visit.gym_logo_url.replace(/\\/g, "/")}`;
      }
      return visit;
    });

    // 7. Devolver resultados
    // 7. Return results
    res.status(200).json({
      data: visitsWithUrls,
      total,
    });
  } catch (error) {
    console.error("Error al obtener mis visitas:", error);
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

    // 2. Obtener parámetros de filtro y paginación
    // 2. Get filter and pagination parameters
    const { gym_id, user_search, gym_status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 3. Construir la parte base de la consulta
    // 3. Build the base part of the query
    let baseQuery = `
      FROM visits
      JOIN users u ON visits.user_id = u.id
      JOIN gyms g ON visits.gym_id = g.id
      INNER JOIN gyms og ON u.home_gym_id = og.id
      WHERE 1=1
    `;
    const params = [];
    let filterClause = "";

    // 4. Aplicar filtros
    // 4. Apply filters
    if (gym_status === "deleted") {
      filterClause += " AND g.is_deleted = 1";
    } else if (gym_status === "active") {
      filterClause += " AND g.is_deleted = 0";
    }

    if (gym_id) {
      filterClause += ` AND visits.gym_id = ?`;
      params.push(gym_id);
    }

    if (user_search) {
      filterClause += ` AND (CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${user_search}%`;
      params.push(searchPattern, searchPattern);
    }

    baseQuery += filterClause;

    // 5. Ejecutar query de conteo
    // 5. Execute count query
    const [totalResult] = await db.query(`SELECT COUNT(visits.id) as total ${baseQuery}`, params);
    const total = totalResult[0].total;

    // 6. Construir y ejecutar query de datos paginados
    // 6. Build and execute paginated data query
    const dataQuery = `
      SELECT 
        visits.id, visits.user_id, visits.gym_id, visits.visited_at AS visit_date,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name, u.email AS user_email,
        u.profile_picture AS user_profile_picture, g.name AS gym_name, g.city AS gym_city,
        g.logo_url AS gym_logo_url, g.is_deleted AS is_gym_deleted,
        og.name AS origin_gym_name, og.city AS origin_gym_city, og.logo_url AS origin_gym_logo_url
      ${baseQuery}
      ORDER BY visits.visited_at DESC
      LIMIT ?
      OFFSET ?
    `;
    const [visits] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    // 7. Construir URLs completas para imágenes
    // 7. Build full URLs for images
    const baseUrl = process.env.BASE_URL || "";
    const visitsWithUrls = visits.map((visit) => {
      if (visit.user_profile_picture) {
        visit.user_profile_picture = `${baseUrl}/${visit.user_profile_picture.replace(/\\/g, "/")}`;
      }
      if (visit.gym_logo_url) {
        visit.gym_logo_url = `${baseUrl}/${visit.gym_logo_url.replace(/\\/g, "/")}`;
      }
      if (visit.origin_gym_logo_url) {
        visit.origin_gym_logo_url = `${baseUrl}/${visit.origin_gym_logo_url.replace(/\\/g, "/")}`;
      }
      return visit;
    });

    // 8. Devolver resultados paginados
    // 8. Return paginated results
    res.status(200).json({
      data: visitsWithUrls,
      total,
    });
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
    // 1. Verificar rol y obtener ID del gimnasio
    // 1. Verify role and get gym ID
    if (req.user.role !== "manager" || !req.user.home_gym_id) {
      return res
        .status(403)
        .json({ message: "Acceso prohibido o no tienes un gimnasio asignado." });
    }
    const gymId = req.user.home_gym_id;

    // 2. Obtener parámetros de filtro y paginación
    // 2. Get filter and pagination parameters
    const { user_search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 3. Construir consulta base
    // 3. Build base query
    let baseQuery = `
      FROM visits
      JOIN users u ON visits.user_id = u.id
      LEFT JOIN gyms og ON u.home_gym_id = og.id
      WHERE visits.gym_id = ?
    `;
    const params = [gymId];
    let filterClause = "";

    // 4. Aplicar filtro de búsqueda
    // 4. Apply search filter
    if (user_search) {
      filterClause += ` AND (CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${user_search}%`;
      params.push(searchPattern, searchPattern);
    }
    baseQuery += filterClause;

    // 5. Ejecutar query de conteo
    // 5. Execute count query
    const [totalResult] = await db.query(`SELECT COUNT(visits.id) as total ${baseQuery}`, params);
    const total = totalResult[0].total;

    // 6. Construir y ejecutar query de datos paginados
    // 6. Build and execute paginated data query
    const dataQuery = `
      SELECT 
        visits.id, visits.user_id, visits.gym_id, visits.visited_at AS visit_date,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name, u.email AS user_email,
        u.profile_picture AS user_profile_picture,
        og.name AS origin_gym_name, og.city AS origin_gym_city, og.logo_url AS origin_gym_logo_url
      ${baseQuery}
      ORDER BY visits.visited_at DESC
      LIMIT ?
      OFFSET ?
    `;
    const [visits] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    // 7. Construir URLs completas
    // 7. Build full URLs
    const baseUrl = process.env.BASE_URL || "";
    const visitsWithUrls = visits.map((visit) => {
      if (visit.user_profile_picture) {
        visit.user_profile_picture = `${baseUrl}/${visit.user_profile_picture.replace(/\\/g, "/")}`;
      }
      if (visit.origin_gym_logo_url) {
        visit.origin_gym_logo_url = `${baseUrl}/${visit.origin_gym_logo_url.replace(/\\/g, "/")}`;
      }
      return visit;
    });

    // 8. Devolver resultados
    // 8. Return results
    res.status(200).json({
      data: visitsWithUrls,
      total,
    });
  } catch (error) {
    console.error("Error al obtener visitas del gimnasio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Obtener visitas salientes de los usuarios del gimnasio del manager (Manager)
 * Get outgoing visits from manager's gym users (Manager)
 * ======================================== */
const getManagerOutgoingVisits = async (req, res) => {
  try {
    // 1. Verificar rol y obtener ID del gimnasio del manager
    // 1. Verify role and get manager's gym ID
    if (req.user.role !== "manager" || !req.user.home_gym_id) {
      return res
        .status(403)
        .json({ message: "Acceso prohibido o no tienes un gimnasio asignado." });
    }
    const managerGymId = req.user.home_gym_id;

    // 2. Obtener parámetros de filtro y paginación
    // 2. Get filter and pagination parameters
    const { user_search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 3. Construir consulta base
    // 3. Build base query
    let baseQuery = `
      FROM visits v
      JOIN users u ON v.user_id = u.id
      JOIN gyms dg ON v.gym_id = dg.id
      WHERE u.home_gym_id = ? AND v.gym_id != ?
    `;
    const params = [managerGymId, managerGymId];
    let filterClause = "";

    // 4. Aplicar filtro de búsqueda
    // 4. Apply search filter
    if (user_search) {
      filterClause += ` AND (CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${user_search}%`;
      params.push(searchPattern, searchPattern);
    }
    baseQuery += filterClause;

    // 5. Ejecutar query de conteo
    // 5. Execute count query
    const [totalResult] = await db.query(`SELECT COUNT(v.id) as total ${baseQuery}`, params);
    const total = totalResult[0].total;

    // 6. Construir y ejecutar query de datos paginados
    // 6. Build and execute paginated data query
    const dataQuery = `
      SELECT 
        v.id, v.user_id, v.gym_id, v.visited_at AS visit_date,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name, u.email AS user_email,
        u.profile_picture AS user_profile_picture,
        dg.name AS destination_gym_name, dg.city AS destination_gym_city, dg.logo_url AS destination_gym_logo_url
      ${baseQuery}
      ORDER BY v.visited_at DESC
      LIMIT ?
      OFFSET ?
    `;
    const [visits] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    // 7. Construir URLs completas
    // 7. Build full URLs
    const baseUrl = process.env.BASE_URL || "";
    const visitsWithUrls = visits.map((visit) => {
      if (visit.user_profile_picture) {
        visit.user_profile_picture = `${baseUrl}/${visit.user_profile_picture.replace(/\\/g, "/")}`;
      }
      if (visit.destination_gym_logo_url) {
        visit.destination_gym_logo_url = `${baseUrl}/${visit.destination_gym_logo_url.replace(/\\/g, "/")}`;
      }
      return visit;
    });

    // 8. Devolver resultados
    // 8. Return results
    res.status(200).json({
      data: visitsWithUrls,
      total,
    });
  } catch (error) {
    console.error("Error al obtener visitas salientes del gimnasio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Obtener estadísticas de visitas (según rol)
 * Get visit statistics (role-aware)
 * ======================================== */
const getVisitsStats = async (req, res) => {
  try {
    // 1. Obtener datos del usuario del token
    // 1. Get user data from token
    const { userId, role, home_gym_id } = req.user;

    let totalQuery = "";
    let monthQuery = "";
    let todayQuery = "";
    let params = [];

    // 2. Definir las consultas SQL basadas en el rol
    // 2. Define SQL queries based on role
    if (role === "admin") {
      // Admin: Contar todas las visitas
      // Admin: Count all visits
      const [totalResult] = await db.query(`SELECT COUNT(id) AS total FROM visits`);
      const [monthResult] = await db.query(`SELECT COUNT(id) AS thisMonth FROM visits WHERE YEAR(visited_at) = YEAR(CURDATE()) AND MONTH(visited_at) = MONTH(CURDATE())`);
      const [todayResult] = await db.query(`SELECT COUNT(id) AS today FROM visits WHERE DATE(visited_at) = CURDATE()`);

      return res.status(200).json({
        total: totalResult[0].total || 0,
        thisMonth: monthResult[0].thisMonth || 0,
        today: todayResult[0].today || 0,
      });
    } else if (role === "manager") {
      // Manager: Contar visitas recibidas y enviadas de su gimnasio
      // Manager: Count received and sent visits for their gym
      const [totalReceivedResult] = await db.query(`SELECT COUNT(id) AS totalReceived FROM visits WHERE gym_id = ?`, [home_gym_id]);
      const [monthReceivedResult] = await db.query(`SELECT COUNT(id) AS thisMonthReceived FROM visits WHERE gym_id = ? AND YEAR(visited_at) = YEAR(CURDATE()) AND MONTH(visited_at) = MONTH(CURDATE())`, [home_gym_id]);
      const [todayReceivedResult] = await db.query(`SELECT COUNT(id) AS todayReceived FROM visits WHERE gym_id = ? AND DATE(visited_at) = CURDATE()`, [home_gym_id]);

      const [totalSentResult] = await db.query(`SELECT COUNT(v.id) AS totalSent FROM visits v JOIN users u ON v.user_id = u.id WHERE u.home_gym_id = ? AND v.gym_id != ?`, [home_gym_id, home_gym_id]);
      const [monthSentResult] = await db.query(`SELECT COUNT(v.id) AS thisMonthSent FROM visits v JOIN users u ON v.user_id = u.id WHERE u.home_gym_id = ? AND v.gym_id != ? AND YEAR(v.visited_at) = YEAR(CURDATE()) AND MONTH(v.visited_at) = MONTH(CURDATE())`, [home_gym_id, home_gym_id]);
      const [todaySentResult] = await db.query(`SELECT COUNT(v.id) AS todaySent FROM visits v JOIN users u ON v.user_id = u.id WHERE u.home_gym_id = ? AND v.gym_id != ? AND DATE(v.visited_at) = CURDATE()`, [home_gym_id, home_gym_id]);

      return res.status(200).json({
        totalReceived: totalReceivedResult[0].totalReceived || 0,
        thisMonthReceived: monthReceivedResult[0].thisMonthReceived || 0,
        todayReceived: todayReceivedResult[0].todayReceived || 0,
        totalSent: totalSentResult[0].totalSent || 0,
        thisMonthSent: monthSentResult[0].thisMonthSent || 0,
        todaySent: todaySentResult[0].todaySent || 0,
      }); // Cierre del json y del return
    } else {
      // User: Contar solo las visitas propias
      // User: Count own visits only
      const [totalResult] = await db.query(`SELECT COUNT(id) AS total FROM visits WHERE user_id = ?`, [userId]);
      const [monthResult] = await db.query(`SELECT COUNT(id) AS thisMonth FROM visits WHERE user_id = ? AND YEAR(visited_at) = YEAR(CURDATE()) AND MONTH(visited_at) = MONTH(CURDATE())`, [userId]);
      const [todayResult] = await db.query(`SELECT COUNT(id) AS today FROM visits WHERE user_id = ? AND DATE(visited_at) = CURDATE()`, [userId]);

      return res.status(200).json({
        total: totalResult[0].total || 0,
        thisMonth: monthResult[0].thisMonth || 0,
        today: todayResult[0].today || 0,
      });
    }
  } catch (error) {
    console.error(`Error al obtener estadísticas de visitas: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  createVisit,
  getVisitsByUser,
  getVisitsByGym,
  getAllVisits,
  getManagerGymVisits,
  getManagerOutgoingVisits,
  getMyVisits,
  getVisitsStats
};
