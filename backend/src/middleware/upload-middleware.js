const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// --- FUNCIÓN para manejar .fields() en la creación de gimnasios ---
// --- FUNCTION to handle .fields() for gym creation ---

// Configuración específica de Multer para la creación de gimnasios (logo + mainImage)
// Specific Multer configuration for gym creation (logo + mainImage)
const gymCreateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar carpeta de destino según el nombre del campo ('logo' o 'mainImage')
    // Determine destination folder based on field name ('logo' or 'mainImage')
    const folderName = file.fieldname === "logo" ? "gym_logos" : "gym_images";
    const uploadPath = `uploads/${folderName}/`;
    // Asegurar que la carpeta exista
    // Ensure folder exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único usando Date.now() ya que aún no hay ID de gimnasio
    // Generate unique name using Date.now() as there's no gym ID yet
    const uniqueSuffix = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueSuffix);
  },
});

// Filtro de archivo (reutilizado o definido aquí)
// File filter (reused or defined here)
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("No es una imagen! Por favor, sube solo imágenes."), false);
  }
};

// Crear la instancia de Multer específica para .fields()
// Create the specific Multer instance for .fields()
const gymCreateUploader = multer({
  storage: gymCreateStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
}).fields([
  { name: "logo", maxCount: 1 }, // Esperar campo 'logo'
  { name: "mainImage", maxCount: 1 }, // Esperar campo 'mainImage'
]);

// Middleware manejador de errores para gymCreateUploader (.fields())
// Error handling middleware for gymCreateUploader (.fields())
const handleGymCreateUpload = (req, res, next) => {
  gymCreateUploader(req, res, function (err) {
    // Llamar a la instancia .fields()
    if (err instanceof multer.MulterError) {
      // Error conocido de Multer
      // Known Multer error
      return res
        .status(400)
        .json({ message: `Error de subida múltiple: ${err.message}` });
    } else if (err) {
      // Otro error (ej: filtro de archivo)
      // Other error (e.g., file filter)
      return res.status(400).json({ message: err.message });
    }
    // Si todo va bien, continuar
    // If everything is ok, proceed
    next();
  });
};

module.exports = {
  createUploadHandler,
  handleGymCreateUpload,
};
