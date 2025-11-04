/* ========================================
 * Middleware para verificar si el usuario es Admin o Manager
 * Middleware to verify if the user is Admin or Manager
 * ======================================== */

const adminOrManagerMiddleware = (req, res, next) => {
  // 1. Verificar que el rol existe en el token (añadido por authMiddleware)
  // 1. Verify that the role exists in the token (added by authMiddleware)
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      message: "No se pudo verificar el rol del usuario.",
    });
  }

  // 2. Verificar si el usuario es admin o manager
  // 2. Verify if the user is admin or manager
  const userRole = req.user.role;

  if (userRole !== "admin" && userRole !== "manager") {
    return res.status(403).json({
      message: "Acceso denegado. Se requiere rol de administrador o manager.",
    });
  }

  // 3. Si es admin o manager, permitir el acceso
  // 3. If admin or manager, allow access
  next();
};

module.exports = adminOrManagerMiddleware;