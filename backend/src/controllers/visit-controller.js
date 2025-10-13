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

module.exports = { createVisit };
