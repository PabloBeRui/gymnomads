//imports

//librería  para manejar la subida de archivos
// Library to handle file uploads.

const multer = require("multer");

// módulo nativo de Node.js que ayuda a trabajar con rutas de archivos y obtener su extensión
// Node.js native module to work with file paths.

const path = require("path");

// Configuración de almacenamiento para Multer
// Multer storage configuration

const storage = multer.diskStorage({
  // Ubicación archivos a guardar - cb-> callback para indicar dónde guardar el archivo, 'null' indica que no ocurrió ningún error
  // Path where files will be saved - cb -> callback to indicate where to save the file, 'null' indicates that no error occurred

  destination: (req, file, cb) => {
    cb(null, "uploads/profile_pictures/");
  },

  // renombrar los archivos
  // rename files

  filename: (req, file, cb) => {
    // Creo un nombre único: userId-timestamp.extension -> fecha de cracion
    // Create a unique name: userId-timestamp.extension -> creatiion time

    // path.extname(file.originalname)=> Extrae la extensión del archivo original  / cb -> callback para nombrar el archivo
    // path.extname(file.originalname) => Extracts the extension of the original file / cb -> callback to name the file

    const uniqueSuffix =
      req.user.userId + "-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// Filtro para aceptar solo imágenes, revisa MIME del archivo y comprueba que sea image
// Filter to accept only images, checks the file's MIME type and verifies it is an image

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    // Acepta el archivo.
    // Accept the file.
    cb(null, true);
  } else {
    cb(new Error("No es una imagen! Por favor, sube solo imágenes."), false);
  }
};

// Se inicializa Multer con las configuraciones de almacenamiento y filtro.
// Multer is initialized with the storage and fileFilter configurations.

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
