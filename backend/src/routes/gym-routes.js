// Import Router express & controllers
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
  toggleSuspension, // Importar la nueva función / Import the new function
} = require("../controllers/gym-controller");

// Importar middlewares de seguridad
// Import security middlewares
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const managerMiddleware = require("../middleware/manager-middleware");
const adminOrManagerMiddleware = require("../middleware/admin-or-manager-middleware");

// Importar createUploader de multer y handlers de upload-middleware
// Import createUploader from multer and handlers from upload-middleware
const createUploader = require("../utils/multer-config");
const {
  createUploadHandler,
  handleGymCreateUpload,
} = require("../middleware/upload-middleware");

// Crear los uploaders específicos para logos e imágenes de gimnasios
// Create specific uploaders for gym logos and images
const logoUploader = createUploader("gym_logos");
const mainImageUploader = createUploader("gym_images");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router
const router = Router();

/* =============================================================================
   RUTAS PÚBLICAS (no requieren token)
   PUBLIC ROUTES (do not require a token)
   ============================================================================= */

// GET /api/gyms - Obtener todos los gimnasios / Get all gyms
// La autenticación es opcional y se gestiona dentro del controlador getAllGyms.
// Authentication is optional and handled within the getAllGyms controller.
router.get("/", getAllGyms);

// GET /api/gyms/:id - Obtener un gimnasio por ID / Get a gym by ID
router.get("/:id", getGymById);

/* =============================================================================
   RUTAS PROTEGIDAS (solo administradores)
   PROTECTED ROUTES (admin only)
   ============================================================================= */

// POST /api/gyms - Crear un nuevo gimnasio (admin) / Create a new gym (admin)
router.post(
  "/",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  handleGymCreateUpload, // 3. Procesar archivos con Multer (.fields()) / Process files with Multer (.fields())
  createGym // 4. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

// PUT /api/gyms/:id - Actualizar un gimnasio existente (admin) / Update an existing gym (admin)
router.put(
  "/:id",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  updateGym // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

// DELETE /api/gyms/:id - Eliminar un gimnasio (admin) / Delete a gym (admin)
router.delete(
  "/:id",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  deleteGym // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

// PATCH /api/gyms/:id/suspend - Cambiar estado de suspensión de un gimnasio (admin)
// PATCH /api/gyms/:id/suspend - Toggle suspension status of a gym (admin)
router.patch(
  "/:id/suspend",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  toggleSuspension // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);


/* =============================================================================
   RUTAS PROTEGIDAS (admin o manager del gimnasio)
   PROTECTED ROUTES (admin or gym manager)
   ============================================================================= */

// GET /api/gyms/:gymId/users - Obtener usuarios de un gimnasio / Get users from a gym
router.get(
  "/:gymId/users",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminOrManagerMiddleware, // 2. ¿Eres admin o manager? / Are you admin or manager?
  getUsersByGym // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

/* =============================================================================
   RUTAS PROTEGIDAS (solo manager del gimnasio)
   PROTECTED ROUTES (gym manager only)
   ============================================================================= */

// POST /api/gyms/:id/logo - Subir/actualizar logo del gimnasio / Upload/update gym logo
router.post(
  "/:id/logo",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  managerMiddleware, // 2. ¿Eres el manager de este gimnasio? / Are you the manager of this gym?
  createUploadHandler(logoUploader, "logo"), // 3. Procesar archivo con Multer / Process file with Multer
  uploadLogo // 4. Si todo es correcto, ejecuta la acción / If all is correct, execute action
);

// POST /api/gyms/:id/image - Subir/actualizar imagen principal del gimnasio / Upload/update main gym image
router.post(
  "/:id/image",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  managerMiddleware, // 2. ¿Eres el manager de este gimnasio? / Are you the manager of this gym?
  createUploadHandler(mainImageUploader, "mainImage"), // 3. Procesar archivo con Multer / Process file with Multer
  uploadMainImage // 4. Si todo es correcto, ejecuta la acción / If all is correct, execute action
);

module.exports = router;
