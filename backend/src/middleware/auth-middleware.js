const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obtener la cabecera 'Authorization' que contiene el token, estándar  "Bearer <token>

    // 1. Get the 'Authorization' header containing the token, standard "Bearer <token>

    const authHeader = req.header("Authorization");

    if (!authHeader) {
      console.log("No autorizado, no hay cabecera de autorización");
      return res.status(401).json({ message: "No autorizado" });
    }

    // 2. Extraer el token , eliminando el prefijo "Bearer ".
    // 2. Extract the token, removing the "Bearer " prefix.

   const token = authHeader.split(' ')[1];

    if (!token) {
      console.error("No autorizado, el formato del token es incorrecto");
      return res.status(401).json({ message: "No autorizado" });
    }
    // 3. Verificar la autenticidad y caducidad del token.
    // 3. Verify the authenticity and expiration of the token.

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Añadir el payload del token (ej: { userId: 3 }) a la petición.
    // 4. Add the token's payload (e.g., { userId: 3 }) to the request object.

    req.user = decoded;

    // 5. Si todo es correcto, continuar con la siguiente función (el controlador).
    // 5. If everything is correct, proceed to the next function (the controller).

    next();
  } catch (error) {
      
      console.error(`No autorizado, token inválido, error: ${error}`)

      res.status(401).json({message: 'No autorizado'})
      
      
  }
};


module.exports= authMiddleware