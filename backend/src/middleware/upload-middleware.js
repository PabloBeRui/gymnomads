const multer = require("multer");
const upload = require("../utils/multer-config");

// manejo los errores de multer para la subida de la foto de perfil
// i handle multer errors for the profile picture upload
const handleProfilePictureUpload = (req, res, next) => {
  const uploader = upload.single("profilePicture");

  uploader(req, res, function (err) {
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

module.exports = {
  handleProfilePictureUpload,
};
