const db = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");

/* ========================================
 * Registrar un nuevo usuario
 * Register a new user
 * ======================================== */
const registerUser = async (req, res) => {
  try {
    // 1. Obtener los datos del cuerpo de la petición
    // 1. Get data from the request body
    const { first_name, last_name, email, password, home_gym_id } = req.body;

    // 2. Comprobar si el email ya existe
    // 2. Check if the email already exists
    const [existingMail] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingMail.length > 0) {
      // 409 Conflicto: el recurso ya existe
      // 409 Conflict: The resource already exists
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // 3. Hashear la contraseña
    // 3. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Insertar el nuevo usuario en la base de datos
    // 4. Insert the new user into the database
    const [user] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, home_gym_id) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, home_gym_id]
    );

    // 5. Generar token JWT
    // 5. Generate JWT token
    const token = jwt.sign(
      { userId: user.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Enviar respuesta de éxito (201 Created)
    // 6. Send success response (201 Created)
    res.status(201).json({
      message: "Usuario registrado con éxito",
      userId: user.insertId,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Loguear usuario
 * Login user
 * ======================================== */
const loginUser = async (req, res) => {
  try {
    // 1. Obtener email y contraseña del cuerpo de la petición
    // 1. Get email and password from the request body
    const { email, password } = req.body;

    // 2. Buscar al usuario por su email
    // 2. Find the user by their email
    const [users] = await db.query(
      "SELECT id, password, role, home_gym_id FROM users WHERE email = ?",
      [email]
    );

    // 3. Comprobar si el usuario existe
    // 3. Check if the user exists
    if (users.length === 0) {
      console.error("usuario incorrecto");
      return res.status(401).json({ message: "credenciales incorrectas" });
    }

    const user = users[0];

    // 4. Comparar la contraseña enviada con la contraseña hasheada
    // 4. Compare the submitted password with the hashed password
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      console.error("contraseña incorrecta");
      return res.status(401).json({ message: "credenciales incorrectas" });
    }

    // 5. Crear el token JWT y enviarlo al cliente
    // 5. Create the JWT token and send it to the client
    const payload = {
      userId: user.id,
      role: user.role,
      home_gym_id: user.home_gym_id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(200).json({
      message: "Login correcto",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Obtener perfil de usuario autenticado
 * Get authenticated user profile
 * ======================================== */
const getProfile = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario desde el middleware
    // 1. Get the user ID from the middleware
    const userId = req.user.userId;

    // 2. Buscar al usuario en la base de datos
    // 2. Find the user in the database
    const [users] = await db.query(
      "SELECT id, first_name, last_name, email, phone, home_gym_id, profile_picture, role, registered_at FROM users WHERE id = ?",
      [userId]
    );

    // 3. Comprobar si el usuario existe
    // 3. Check if the user exists
    if (users.length === 0) {
      console.error(`Usuario no encontrado con id: ${userId}`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 4. Construir URL completa de la imagen de perfil
    // 4. Build full profile picture URL
    const userProfile = { ...users[0] };

    if (userProfile.profile_picture) {
      const imagePath = userProfile.profile_picture.replace(/\\/g, "/");

      if (!process.env.BASE_URL) {
        console.warn(
          "ADVERTENCIA: La variable de entorno BASE_URL no está definida en el backend .env"
        );
      }

      userProfile.profile_picture = `${
        process.env.BASE_URL || ""
      }/${imagePath}`;
      console.log("URL de imagen construida:", userProfile.profile_picture);
    }

    // 5. Devolver datos del perfil (sin contraseña)
    // 5. Return profile data (without password)
    res.status(200).json(userProfile);
  } catch (error) {
    console.error(`Error al obtener el perfil: ${error}`);
    res.status(500).json({ message: "Error interno en el servidor" });
  }
};

/* ========================================
 * Actualizar el perfil del usuario autenticado
 * Update authenticated user profile
 * ======================================== */
const updateProfile = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario desde el token (vía middleware)
    // 1. Get the user ID from the token (via middleware)
    const userId = req.user.userId;

    // 2. Obtener los datos a actualizar del cuerpo de la petición
    // 2. Get the data to update from the request body
    const { first_name, last_name, phone } = req.body;

    // 3. Actualizar el usuario en la base de datos
    // 3. Update the user in the database
    const [result] = await db.query(
      "UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?",
      [first_name, last_name, phone, userId]
    );

    // 4. Comprobar si alguna fila fue actualizada
    // 4. Check if any row was updated
    if (result.affectedRows === 0) {
      console.error("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 5. Enviar respuesta de éxito
    // 5. Send success response
    res.status(200).json({ message: "Perfil actualizado con éxito" });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Eliminar el perfil del usuario autenticado
 * Delete authenticated user profile
 * ======================================== */
const deleteProfilebyUser = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario desde el token (vía middleware)
    // 1. Get the user ID from the token (via middleware)
    const userId = req.user.userId;

    // 2. Ejecutar la consulta SQL para eliminar el usuario
    // 2. Execute the SQL query to delete the user
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);

    // 3. Comprobar si alguna fila fue eliminada
    // 3. Check if any row was deleted
    if (result.affectedRows === 0) {
      console.error("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`Usuario con ID: ${userId} ha sido eliminado con éxito.`);

    // 4. Enviar respuesta de éxito sin contenido (204 No Content)
    // 4. Send success response with no content (204 No Content)
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Actualizar la foto de perfil del usuario
 * Update user profile picture
 * ======================================== */
const updateProfilePicture = async (req, res) => {
  try {
    // 1. Comprobar que se ha subido un archivo (Multer proporciona req.file)
    // 1. Check that a file was uploaded (Multer provides req.file)
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo" });
    }

    const userId = req.user.userId;
    const filePath = req.file.path;

    // 2. Obtener la ruta de la foto antigua
    // 2. Get the old picture's path
    const [users] = await db.query(
      "SELECT profile_picture FROM users WHERE id = ?",
      [userId]
    );
    const oldFilePath = users[0]?.profile_picture;

    // 3. Actualizar la base de datos con la nueva ruta
    // 3. Update the database with the new path
    await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [
      filePath,
      userId,
    ]);

    // 4. Borrar el archivo antiguo (si existía)
    // 4. Delete the old file (if it existed)
    if (oldFilePath) {
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.error("Error al borrar la anterior imagen:", err);
        // No detenemos el proceso, la subida fue exitosa
        // We don't stop the process, the upload was successful
      }
    }

    // 5. Enviar respuesta de éxito
    // 5. Send success response
    res.status(200).json({
      message: "Foto de perfil actualizada con éxito",
      filePath: filePath,
    });
  } catch (error) {
    console.error(`Error en la actualización de la imagen de perfil: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ========================================
 * Eliminar un usuario por su ID (Admin)
 * Delete a user by their ID (Admin)
 * ======================================== */
const deleteUserByAdmin = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario a borrar de la URL
    // 1. Get the ID of the user to delete from the URL
    const targetUserId = parseInt(req.params.id, 10);

    // 2. Obtener el ID del administrador que hace la petición (del token)
    // 2. Get the ID of the admin making the request (from the token)
    const adminUserId = req.user.userId;

    // 3. Comprobar si el admin está intentando borrarse a sí mismo
    // 3. Check if the admin is trying to delete themselves
    if (targetUserId === adminUserId) {
      return res.status(403).json({
        message: "un administrador no puede eliminarse a sí mismo.",
      });
    }

    // 4. Proceder con la eliminación
    // 4. Proceed with the deletion
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [
      targetUserId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "usuario no encontrado" });
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
 * Obtener todos los usuarios con filtros opcionales (Admin)
 * Get all users with optional filters (Admin)
 * ======================================== */
const getAllUsers = async (req, res) => {
  try {
    // 1. Obtener parámetros de filtro de la query string
    // 1. Get filter parameters from query string
    const { gym_id, search } = req.query;

    // 2. Construir query base con INNER JOIN para obtener nombre del gimnasio
    // 2. Build base query with INNER JOIN to get gym name
    let query = `
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.role, 
        u.home_gym_id,
        u.profile_picture,
        u.registered_at,
        g.name AS gym_name
      FROM users u
      INNER JOIN gyms g ON u.home_gym_id = g.id
      WHERE u.role = 'user'
    `;
    const params = [];

    // 3. Aplicar filtro por gimnasio específico (si se proporciona)
    // 3. Apply filter by specific gym (if provided)
    if (gym_id) {
      query += " AND u.home_gym_id = ?";
      params.push(gym_id);
    }

    // 4. Aplicar filtro de búsqueda por nombre o email (si se proporciona)
    // 4. Apply search filter by name or email (if provided)
    if (search) {
      query +=
        " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 5. Ordenar por fecha de registro descendente
    // 5. Order by registration date descending
    query += " ORDER BY u.registered_at DESC"; // 6. Execute the query

    // 6. Ejecutar la consulta
    const [users] = await db.query(query, params); // 7. Construir URLs completas para las imágenes de perfil // 7. Build full profile picture URLs

    const baseUrl = process.env.BASE_URL || "";
    const usersWithFullUrls = users.map((user) => {
      if (user.profile_picture) {
        const imagePath = user.profile_picture.replace(/\\/g, "/");
        user.profile_picture = `${baseUrl}/${imagePath}`;
      }
      return user;
    }); // 8. Devolver resultados con URLs completas // 8. Return results with full URLs

    res.status(200).json(usersWithFullUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/* ========================================
 * Obtener todos los managers con filtros opcionales (Admin)
 * Get all managers with optional filters (Admin)
 * ======================================== */
const getAllManagers = async (req, res) => {
  try {
    // 1. Obtener parámetros de filtro de la query string
    // 1. Get filter parameters from query string
    const { city, search } = req.query;

    // 2. Construir query base con INNER JOIN para obtener datos del gimnasio
    // 2. Build base query with INNER JOIN to get gym data
    let query = `
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.phone,
        u.home_gym_id, 
        u.registered_at,
        u.profile_picture,
        g.name AS gym_name,
        g.city AS gym_city,
        g.logo_url,
        g.address AS gym_address
      FROM users u
      INNER JOIN gyms g ON u.home_gym_id = g.id
      WHERE u.role = 'manager'
    `;
    const params = [];

    // 3. Aplicar filtro por ciudad del gimnasio (si se proporciona)
    // 3. Apply filter by gym city (if provided)
    if (city) {
      query += " AND g.city = ?";
      params.push(city);
    }

    // 4. Aplicar filtro de búsqueda por nombre, email o nombre del gimnasio (si se proporciona)
    // 4. Apply search filter by name, email or gym name (if provided)
    if (search) {
      query +=
        " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR g.name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // 5. Ordenar por fecha de registro descendente
    // 5. Order by registration date descending
    query += " ORDER BY u.registered_at DESC"; // 6. Execute the query

    // 6. Ejecutar la consulta
    const [managers] = await db.query(query, params); // 7. Construir URLs completas para las imágenes de perfil // 7. Build full profile picture URLs

    const baseUrl = process.env.BASE_URL || "";
    const managersWithFullUrls = managers.map((manager) => {
      if (manager.profile_picture) {
        const imagePath = manager.profile_picture.replace(/\\/g, "/");
        manager.profile_picture = `${baseUrl}/${imagePath}`;
      }
      if (manager.logo_url) {
        const logoPath = manager.logo_url.replace(/\\/g, "/");
        manager.logo_url = `${baseUrl}/${logoPath}`;
      }

      return manager;
    }); // 8. Devolver resultados con URLs completas // 8. Return results with full URLs

    res.status(200).json(managersWithFullUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/* ========================================
 * Cambiar la contraseña del usuario autenticado
 * Change the authenticated user's password
 * ======================================== */
const changePassword = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario del token
    // 1. Get the user ID from the token
    const userId = req.user.userId;

    // 2. Obtener las contraseñas del cuerpo de la petición
    // 2. Get the passwords from the request body
    const { currentPassword, newPassword } = req.body;

    // 3. Buscar al usuario en la base de datos para obtener su hash actual
    // 3. Find the user in the database to get their current hash
    const [users] = await db.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "usuario no encontrado" });
    }

    const user = users[0];

    // 4. Verificar que la contraseña actual es correcta
    // 4. Verify that the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "la contraseña actual es incorrecta" });
    }

    // 5. Hashear la nueva contraseña
    // 5. Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 6. Actualizar la contraseña en la base de datos
    // 6. Update the password in the database
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedNewPassword,
      userId,
    ]);

    // 7. Enviar respuesta de éxito
    // 7. Send success response
    res.status(200).json({ message: "contraseña actualizada con éxito" });
  } catch (error) {
    console.error(`Fallo al actualizar la contraseña: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/* ========================================
 * Crear un nuevo usuario (Admin)
 * Create a new user (Admin)
 * ======================================== */
const createUserByAdmin = async (req, res) => {
  try {
    // 1. Obtener los datos del cuerpo de la petición, incluyendo el rol
    // 1. Get data from the request body, including the role
    const { first_name, last_name, email, password, home_gym_id, role } =
      req.body;

    // 2. Validar que el rol enviado sea uno de los permitidos
    // 2. Validate that the submitted role is one of the allowed ones
    const allowedRoles = ["user", "manager", "admin"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        message:
          "rol no válido. los roles permitidos son: user, manager, admin.",
      });
    }

    // 3. Comprobar si el email ya existe
    // 3. Check if the email already exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      console.log("El mail ya está registrado");
      return res.status(409).json({ message: "el email ya está registrado" });
    }

    // 4. Hashear la contraseña
    // 4. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Insertar el nuevo usuario en la base de datos con su rol específico
    // 5. Insert the new user into the database with their specific role
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, home_gym_id, role) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, home_gym_id, role]
    );

    // 6. Enviar respuesta de éxito
    // 6. Send success response
    res.status(201).json({
      message: `usuario con rol '${role}' creado con éxito`,
      userId: result.insertId,
    });
  } catch (error) {
    console.error(`error: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/* ========================================
 * Actualizar datos de un usuario (Admin)
 * Update user data (Admin)
 * ======================================== */
const updateUser = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario de los parámetros de la URL
    // 1. Get user ID from URL parameters
    const { id } = req.params;

    // 2. Obtener los datos a actualizar del cuerpo de la petición
    // 2. Get data to update from request body
    const { first_name, last_name, phone } = req.body;

    // 3. Validar que se proporcionen los campos obligatorios
    // 3. Validate that required fields are provided
    if (!first_name || !last_name) {
      return res.status(400).json({
        message: "Nombre y apellidos son obligatorios.",
      });
    }

    // 4. Validar longitud mínima
    // 4. Validate minimum length
    if (first_name.trim().length < 2) {
      return res.status(400).json({
        message: "El nombre debe tener al menos 2 caracteres.",
      });
    }

    if (last_name.trim().length < 2) {
      return res.status(400).json({
        message: "Los apellidos deben tener al menos 2 caracteres.",
      });
    }

    // 5. Actualizar el usuario en la base de datos
    // 5. Update user in database
    const [result] = await db.query(
      "UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?",
      [first_name.trim(), last_name.trim(), phone || null, id]
    );

    // 6. Comprobar si se actualizó alguna fila
    // 6. Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado.",
      });
    }

    // 7. Obtener el usuario actualizado con información del gimnasio (INNER JOIN)
    // 7. Get updated user with gym information (INNER JOIN)
    const [updatedUser] = await db.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.home_gym_id,
        u.registered_at,
        g.name AS gym_name,
        g.city AS gym_city,
        g.address AS gym_address
      FROM users u
      INNER JOIN gyms g ON u.home_gym_id = g.id
      WHERE u.id = ?`,
      [id]
    );

    // 8. Verificar que se encontró el usuario (por si el gimnasio no existe)
    // 8. Verify that user was found (in case gym doesn't exist)
    if (updatedUser.length === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado o gimnasio asociado no existe.",
      });
    }

    // 9. Enviar respuesta de éxito con el usuario actualizado
    // 9. Send success response with updated user
    res.status(200).json({
      message: "Usuario actualizado correctamente.",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error(`Error al actualizar usuario: ${error}`);
    res.status(500).json({
      message: "Error interno del servidor al actualizar el usuario.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteProfilebyUser,
  updateProfilePicture,
  deleteUserByAdmin,
  getAllUsers,
  getAllManagers,
  changePassword,
  createUserByAdmin,
  updateUser,
};
