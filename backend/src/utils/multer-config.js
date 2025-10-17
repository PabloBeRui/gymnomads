
// imports
const multer = require("multer");
const path = require("path");
// módulo para asegurar que las carpetas de destino existan
// module to ensure destination folders exist
const fs = require("fs");

// nueva función "fábrica" que crea una configuración de multer para una carpeta específica
// new "factory" function that creates a multer configuration for a specific folder

const createUploader = (folderName) => {
  // configuración de almacenamiento para multer
  // multer storage configuration
  const storage = multer.diskStorage({
    // ubicación archivos a guardar - cb-> callback para indicar dónde guardar el archivo, 'null' indica que no ocurrió ningún error
    // path where files will be saved - cb -> callback to indicate where to save the file, 'null' indicates that no error occurred
    destination: (req, file, cb) => {
      const uploadPath = `uploads/${folderName}/`;
      // Asegurarse de que la carpeta de destino exista antes de guardar el archivo
      // make sure the destination folder exists before saving the file
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },

    // renombrar los archivos
    // rename files
    filename: (req, file, cb) => {
      // crear un nombre único: id-timestamp.extension -> fecha de creación
      // create a unique name: id-timestamp.extension -> creation time
      // path.extname(file.originalname)=> extrae la extensión del archivo original / cb -> callback para nombrar el archivo
      // path.extname(file.originalname) => extracts the extension of the original file / cb -> callback to name the file
      const id = req.params.id || req.user.userId;
      const uniqueSuffix =
        id + "-" + Date.now() + path.extname(file.originalname);
      cb(null, uniqueSuffix);
    },
  });

  // filtro para aceptar solo imágenes, revisa mime del archivo y comprueba que sea image
  // filter to accept only images, checks the file's mime type and verifies it is an image
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      // aceptar el archivo.
      // accept the file.
      cb(null, true);
    } else {
      cb(new Error("no es una imagen! por favor, sube solo imágenes."), false);
    }
  };

  // la función devuelve una instancia de multer inicializada con las configuraciones.
  // the function returns an initialized multer instance with the configurations.
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      // establece un límite de 5 megabytes para el tamaño del archivo
      // Set a 5 megabyte limit for the file size
      fileSize: 1024 * 1024 * 5, // 5 MB
    },
  });
};

module.exports = createUploader;
