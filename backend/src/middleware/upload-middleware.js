const multer = require("multer");

// Esta función  crea un manejador de errores para un uploader y un nombre de campo específicos
// This function creates an error handler for a specific uploader and field name
const createUploadHandler = (uploader, fieldName) => {
  return (req, res, next) => {
    const upload = uploader.single(fieldName);

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // un error conocido de multer ocurrió (ej: archivo demasiado grande)
        // a known multer error occurred (e.g., file too large)
        return res
          .status(400)
          .json({ message: `error de subida: ${err.message}` });
      } else if (err) {
        // un error desconocido ocurrió (ej: el filtro de archivo)
        // an unknown error occurred (e.g., from the file filter)
        return res.status(400).json({ message: err.message });
      }
      // si todo fue bien, continuar al siguiente middleware (el controlador)
      // if everything went well, proceed to the next middleware (the controller)
      next();
    });
  };
};

module.exports = createUploadHandler;
