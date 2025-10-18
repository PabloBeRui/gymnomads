// comprobar si el usuario es el manager del gimnasio específico
// checks if the user is the manager of the specific gym

const managerMiddleware = (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userGymId = req.user.home_gym_id;
    const targetGymId = parseInt(req.params.id, 10);

    // comprobar que sea manager y que sea el manager del gimnasio correcto
    // check that the user is a manager and that they are the manager of the correct gym
    if (userRole === "manager" && userGymId === targetGymId) {
      return next();
    }

    // si no es el manager correcto, denegar el acceso
    // if they are not the correct manager, deny access
    console.log("403, manager incorrecto");
    res.status(403).json({
      message: "acceso denegado. no tienes permisos para este recurso.",
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    res
      .status(500)
      .json({ message: "error interno del servidor durante la autorización." });
  }
};

module.exports = managerMiddleware;
