//Imports
//Router express & controller
const { Router } = require("express");
const {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  getUsersByGym,
  uploadLogo,
  uploadMainImage,
} = require("../controllers/gym-controller");

// Middlewares de seguridad / ecurity middlewares

const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const managerMiddleware = require("../middleware/manager-middleware");

// createUploader multer & handler upload-middleware
const createUploader = require("../utils/multer-config");
const {
  createUploadHandler,
  handleGymCreateUpload,
} = require("../middleware/upload-middleware");
// crear los uploaders específicos que necesito para este archivo
// create the specific uploaders i need for this file
const logoUploader = createUploader("gym_logos");
const mainImageUploader = createUploader("gym_images");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router

const router = Router();

// Rutas / Routes

// --- RUTAS PÚBLICAS / PUBLIC ROUTES ---

// GET /api/gyms - Obtener todos los gimnasios /Get all gyms

router.get("/", getAllGyms);

// GET /api/gyms/:id - Obtener un gimnasio por ID / Get a gym by ID

router.get("/:id", getGymById);

// --- RUTAS DE ADMINISTRADOR / ADMIN ROUTES ---

// POST /api/gyms - crear un nuevo gimnasio (protegido) / create a new gym (protected)

router.post(
  "/",
  authMiddleware, // 1. verificar si el usuario está logueado / verify if the user is logged in
  adminMiddleware, // 2. verificar si el usuario es admin / verify if the user is admin
  handleGymCreateUpload, // 3. Procesar archivos con Multer (.fields())
  createGym // 4. si ambas son correctas, ejecutar la acción / if both are correct, execute the action
);

// PUT /api/gyms/:id - actualizar un gimnasio existente (protegido) / update an existing gym (protected)

router.put(
  "/:id",
  authMiddleware, // 1. verificar si el usuario está logueado / verify if the user is logged in
  adminMiddleware, // 2. verificar si el usuario es admin / verify if the user is admin
  updateGym // 3. si ambas son correctas, ejecutar la acción / if both are correct, execute the action
);

// DELETE /api/gyms/:id - eliminar un gimnasio (protegido) / delete a gym (protected)

router.delete(
  "/:id",
  authMiddleware, // 1. verificar si el usuario está logueado / verify if the user is logged in
  adminMiddleware, // 2. verificar si el usuario es admin / verify if the user is admin
  deleteGym // 3. si ambas son correctas, ejecutar la acción / if both are correct, execute the action
);

// GET /api/gyms/:gymId/users - obtener los usuarios de un gimnasio (protegido) / get users for a gym (protected)

router.get(
  "/:gymId/users",
  authMiddleware, // 1. verificar si el usuario está logueado / verify if the user is logged in
  adminMiddleware, // 2. verificar si el usuario es admin / verify if the user is admin
  getUsersByGym // 3. si ambas son correctas, ejecutar la acción / if both are correct, execute the action
);

// --- RUTAS DE MANAGER / MANAGER ROUTES ---

// POST /api/gyms/:id/logo - subir/actualizar logo del gimnasio / upload/update gym logo
router.post(
  "/:id/logo",
  authMiddleware, // 1. verificar si el usuario está logueado / verify if the user is logged in
  managerMiddleware, // 2. verificar si es el manager de ese gimnasio / verify if they are the manager of that gym
  createUploadHandler(logoUploader, "logo"), // 3. procesar el archivo de imagen con multer / process the image file with multer & upload-middleware
  uploadLogo // 4. si todo es correcto, ejecutar la acción del controlador / if all is correct, execute the controller action
);

// POST /api/gyms/:id/image - subir/actualizar imagen principal del gimnasio / upload/update main gym image
router.post(
  "/:id/image",
  authMiddleware, // 1. verificar si el usuario está logueado / verify if the user is logged in
  managerMiddleware, // 2. verificar si es el manager de ese gimnasio / verify if they are the manager of that gym
  createUploadHandler(mainImageUploader, "mainImage"), // 3. procesar el archivo de imagen con multer / process the image file with multer & upload-middleware
  uploadMainImage // 4. si todo es correcto, ejecutar la acción del controlador / if all is correct, execute the controller action
);

module.exports = router;
