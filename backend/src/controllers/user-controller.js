const db = require("../../config/db");

const bcrypt = require("bcrypt"); //hash passwords

const jwt = require("jsonwebtoken"); //json web token

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
      "SELECT id, password FROM users WHERE email = ?",
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

    const payload = { userId: user.id };
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
      "SELECT id, first_name, last_name, email, home_gym_id, profile_picture FROM users WHERE id = ?",
      [userId]
    );

    // Comprobar si el usuario todavía existe en la BBDD
    // Check if the user still exists in the DB
    if (users.length === 0) {
      console.log("No existe el usuario");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // Devolver los datos del perfil
    // Return the profile data
    res.status(200).json(users[0]);
  } catch (error) {
    console.error(`Error a la hora de obtener el profile, error ${error}`);

    res.status(500).json({ message: "Error interno en el servidor" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
