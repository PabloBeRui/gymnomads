const db = require("../../config/db");

const bcrypt = require("bcrypt"); //hash passwords

const jwt = require("jsonwebtoken"); //json web token

const fs = require("fs/promises"); // módulo 'fs' de Node.js para  interactuar con el sistema de archivos  / Node.js's 'fs' module to interact with the file system

// Registrar un nuevo usuario
// Register a new user

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
      // 409-> Conflicto: el recurso ya existe / Conflict: The resource already exists

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

    // 5. Enviar una respuesta de éxito
    // 5. Send a success response
    // 201-> Creado: El recurso se ha creado con éxito / Created: The resource has been successfully created
    res.status(201).json({
      message: "Usuario registrado con éxito",
      userId: user.insertId,
    });

    //  ? insertId sale del objeto de resultado que la librería mysql2  devuelve después de ejecutar una consulta INSERT con éxito
    // ? insertId comes from the result object that the mysql2 library returns after successfully executing an INSERT query
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//Loguear usuario
// Login user

const loginUser = async (req, res) => {
  try {
    // Obtener email y contraseña del cuerpo de la petición
    // Get email and password from the request body

    const { email, password } = req.body;

    // Buscar al usuario por su email
    // Find the user by their email

    const [users] = await db.query(
      "SELECT id, password, role, home_gym_id FROM users WHERE email = ?",
      [email]
    );

    // Comprobar si el usuario existe
    // Check if the user exists

    if (users.length === 0) {
      console.error("usuario incorrecto");
      // 401 Unauthorized: no autorizado (credenciales incorrectas)
      return res.status(401).json({ message: "credenciales incorrectas" });
    }

    const user = users[0];

    // Comparar la contraseña enviada con la contraseña hasheada en la BBDD y comprobar si la contraseña coincide
    // Compare the submitted password with the hashed password in the DB and check if the password matches

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      console.error("contraseña incorrecta");
      return res.status(401).json({ message: "credenciales incorrectas" });
    }

    // Si todo está correcto, crear el token (JWT) y enviarlo al cliente
    // If everything is correct, create the token (JWT) and send it to the client

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

// Obtener perfil de usuario identificado
// Get authenticated user profile

const getProfile = async (req, res) => {
  try {
    // Obtener el ID del usuario desde el objeto 'req.user' que añade el middleware
    // Get the user ID from the 'req.user' object added by the middleware

    const userId = req.user.userId;

    // Buscar al usuario en la BBDD, seleccionando solo los campos necesarios
    // Find the user in the DB, selecting only the necessary fields

    const [users] = await db.query(
     "SELECT id, first_name, last_name, email, phone, home_gym_id, profile_picture, role, registered_at FROM users WHERE id = ?",
      [userId]
    );

    // Comprobar si el usuario todavía existe en la BBDD
    // Check if the user still exists in the DB
    if (users.length === 0) {
      // log error si no se encuentra el usuario.
      // Log error if user is not found.
      console.error(`Usuario no encontrado con id: ${userId}`);
      // Devolver respuesta 404 Not Found.
      // Return 404 Not Found response
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // --- LÓGICA PARA CONSTRUIR URL DE IMAGEN ---
    // --- LOGIC TO BUILD IMAGE URL ---
    // Crear una copia del objeto usuario para modificarla.
    // Create a copy of the user object to modify it.

    const userProfile = { ...users[0] }; // Crear una copia para modificar

    // Construir URL completa SOLO si hay ruta de imagen
    // Build full URL ONLY if image path exists
    if (userProfile.profile_picture) {

      // Reemplazar barras invertidas (si las hubiera) por barras inclinadas
      // Replace backslashes (if any) with forward slashes
      const imagePath = userProfile.profile_picture.replace(/\\/g, '/');

      // Comprobar si la variable BASE_URL está definida en el entorno.
      // Check if the BASE_URL variable is defined in the environment.
      if (!process.env.BASE_URL) {

        // Advertir en consola si BASE_URL falta en .env del backend.
        // Warn in console if BASE_URL is missing in backend .env.
        console.warn("ADVERTENCIA: La variable de entorno BASE_URL no está definida en el backend .env");
      }
      
      // Construir la URL completa concatenando BASE_URL y la ruta de la imagen.
      // Build the full URL by concatenating BASE_URL and the image path.
      // Usar fallback a string vacío si BASE_URL no está definida para evitar 'undefined/' en la URL.
      // Use empty string fallback if BASE_URL is not defined to avoid 'undefined/' in the URL.
      userProfile.profile_picture = `${process.env.BASE_URL || ''}/${imagePath}`; //  fallback  BASE_URL 
      console.log("URL de imagen construida para enviar:", userProfile.profile_picture); // debugging log
    }
    // --- FIN LÓGICA URL IMAGEN ---

    // Devolver datos del perfil (¡sin contraseña!)
    // Return profile data (no password!)
    res.status(200).json(userProfile);
  } catch (error) {
    console.error(`Error a la hora de obtener el profile, error ${error}`);

    res.status(500).json({ message: "Error interno en el servidor" });
  }
};

// Actualizar el perfil del usuario autenticado
// Update authenticated user profile

const updateProfile = async (req, res) => {
  try {
    // Obtener el ID del usuario desde el token (vía middleware)
    // Get the user ID from the token (via middleware)
    const userId = req.user.userId;

    // Obtener los datos a actualizar del cuerpo de la petición
    // Get the data to update from the request body
    const { first_name, last_name, phone } = req.body;

    // Construir la consulta SQL para actualizar el usuario
    // Build the SQL query to update the user
    const [result] = await db.query(
      "UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?",
      [first_name, last_name, phone, userId]
    );

    // Comprobar si alguna fila fue realmente actualizada
    // Check if any row was actually updated

    if (result.affectedRows === 0) {
      console.error("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Enviar una respuesta de éxito
    // Send a success response

    res.status(200).json({ message: "Perfil actualizado con éxito" });
  } catch (error) {
    console.error(`Error:  ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar el perfil del usuario autenticado
// Delete authenticated user profile

const deleteProfilebyUser = async (req, res) => {
  try {
    // Obtener el ID del usuario desde el token (vía middleware)
    // Get the user ID from the token (via middleware)

    const userId = req.user.userId;

    // Ejecutar la consulta SQL para eliminar el usuario
    // Execute the SQL query to delete the user

    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);

    // Comprobar si alguna fila fue eliminada
    // Check if any row was deleted

    if (result.affectedRows === 0) {
      console.error("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`Usuario con ID: ${userId} ha sido eliminado con éxito.`);

    // Enviar una respuesta de éxito sin contenido 204 No content
    // Send a success response with no content 204 No content

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar la foto de perfil del usuario
// Update user profile picture
const updateProfilePicture = async (req, res) => {
  try {
    // Multer proporciona la información del archivo en req.file
    // Multer provides us with file information in req.file
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo" });
    }

    const userId = req.user.userId;

    // La ruta del archivo guardado por multer
    // The path of the file saved by multer

    const filePath = req.file.path;

    // Actualizar la base de datos con la nueva ruta de la imagen
    // Update the database with the new image path

    // 1. obtengo la ruta de la foto antigua
    // 1. get the old picture's path

    const [users] = await db.query(
      "SELECT profile_picture FROM users WHERE id = ?",
      [userId]
    );
    const oldFilePath = users[0]?.profile_picture;

    // 2. actualiza la base de datos con la nueva ruta
    // 2. update the database with the new path

    await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [
      filePath,
      userId,
    ]);

    // 3. borra el archivo antiguo (si existía)
    // 3. delete the old file (if it existed)

    if (oldFilePath) {
      try {
        await fs.unlink(oldFilePath); // fs.unlink es el comando para borrar un archivo / fs.unlink is the command to delete a file
      } catch (err) {
        console.error("Error al borrar la anterior imagen:", err);
        // no detengo el proceso, ya que la subida fue exitosa, pero lo registro
        // I don't stop the process, since the upload was successful, but i log it
      }
    }

    res.status(200).json({
      message: "Foto de perfil actualizada con éxito",
      filePath: filePath,
    });
  } catch (error) {
    console.error(`Error en la actualización de la imagen de perfil: ${error}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// eliminar un usuario por su id (solo para administradores)
// delete a user by their id (admin only)
const deleteUserByAdmin = async (req, res) => {
  try {
    // obtengo el id del usuario a borrar de la url (es un string)
    // I get the id of the user to delete from the url (it's a string)
    const targetUserId = parseInt(req.params.id, 10);

    // obtengo el id del administrador que está haciendo la petición (del token)
    // I get the id of the admin making the request (from the token)
    const adminUserId = req.user.userId;

    // compruebo si el admin está intentando borrarse a sí mismo
    // I check if the admin is trying to delete themselves
    if (targetUserId === adminUserId) {
      // 403 forbidden: no tienes permiso para realizar esta acción específica
      // 403 forbidden: you don't have permission to perform this specific action
      return res
        .status(403)
        .json({ message: "un administrador no puede eliminarse a sí mismo." });
    }

    // si no se está borrando a sí mismo, procedo con la eliminación
    // if they are not deleting themselves, i proceed with the deletion
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [
      targetUserId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "usuario no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

// obtener todos los usuarios (solo para administradores)
// get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // ejecutar la consulta para obtener los datos esenciales de todos los usuarios
    // execute the query to get essential data from all users

    const [users] = await db.query(
      "SELECT id, first_name, last_name, email, role, registered_at FROM users"
    );

    // enviar la lista de usuarios
    // send the list of users

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

// backend/src/controllers/user-controller.js

// ... (mis imports y las funciones anteriores) ...

// cambiar la contraseña del usuario autenticado
// change the authenticated user's password

const changePassword = async (req, res) => {
  try {
    // 1. obtener el id del usuario del token
    // 1. get the user id from the token

    const userId = req.user.userId;

    // 2. obtener las contraseñas del cuerpo de la petición
    // 2. get the passwords from the request body

    const { currentPassword, newPassword } = req.body;

    // 3. buscar al usuario en la bbdd para obtener su hash actual
    // 3. find the user in the db to get their current hash

    const [users] = await db.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "usuario no encontrado" });
    }

    const user = users[0];

    // 4. verificar que la contraseña actual es correcta
    // 4. verify that the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "la contraseña actual es incorrecta" });
    }

    // 5. hashear la nueva contraseña
    // 5. hash the new password

    const saltRounds = 10; //algoritmo de hasheo 2^10 / has algoritm 2^10
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 6. actualizar la contraseña en la base de datos
    // 6. update the password in the database

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedNewPassword,
      userId,
    ]);

    res.status(200).json({ message: "contraseña actualizada con éxito" });
  } catch (error) {
    console.error(`Fallo al actualizar la contraseña, error: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

// Crear un nuevo usuario (solo para administradores)
// Create a new user (admin only)
const createUserByAdmin = async (req, res) => {
  try {
    // 1. obtener los datos del cuerpo de la petición, incluyendo el rol
    // 1. get data from the request body, including the role

    const { first_name, last_name, email, password, home_gym_id, role } =
      req.body;

    // 2. validar que el rol enviado sea uno de los permitidos
    // 2. validate that the submitted role is one of the allowed ones

    const allowedRoles = ["user", "manager", "admin"];
    if (!role || !allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({
          message:
            "rol no válido. los roles permitidos son: user, manager, admin.",
        });
    }

    // 3. comprobar si el email ya existe
    // 3. check if the email already exists

    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      console.log("El mail ya está registrado");
      return res.status(409).json({ message: "el email ya está registrado" });
    }

    // 4. hashear la contraseña
    // 4. hash the password

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. insertar el nuevo usuario en la base de datos con su rol específico
    // 5. insert the new user into the database with their specific role

    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, home_gym_id, role) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, home_gym_id, role]
    );

    // 6. enviar una respuesta de éxito
    // 6. send a success response

    res.status(201).json({
      message: `usuario con rol '${role}' creado con éxito`,
      userId: result.insertId,
    });
  } catch (error) {
    console.error(`error: ${error}`);
    res.status(500).json({ message: "error interno del servidor" });
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
  changePassword,
  createUserByAdmin,
};
