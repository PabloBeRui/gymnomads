// comprueba si el usuario autenticado tiene el rol de 'admin'
// checks if the authenticated user has the 'admin' role
const adminMiddleware = (req, res, next) => {
  // el 'authMiddleware' ya ha verificado el token y ha dejado 'req.user'
  // the 'authMiddleware' has already verified the token and provided 'req.user'
  if (req.user && req.user.role === "admin") {
    // si el usuario tiene el rol 'admin', puede continuar
    // if the user has the 'admin' role, they can proceed
    next();
  } else {
    // si no, se le deniega el acceso con un error 403 forbidden
    // otherwise, access is denied with a 403 forbidden error
    res
      .status(403)
      .json({ message: "acceso denegado. se requiere rol de administrador." });
  }
};

module.exports = adminMiddleware;
