//Import Router express & controllers
const { Router } = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteProfilebyUser,
  updateProfilePicture,
  deleteUserByAdmin,
  getAllUsers,
  getAllManagers,
  changePassword,
  createUserByAdmin,
  updateUser, // ← NUEVO: Actualizar datos de usuario (admin)
} = require("../controllers/user-controller");

// Importar middleware de autenticación
// Import auth middleware
const authMiddleware = require("../middleware/auth-middleware");

// Importar manejador de subidas
// Import upload handler
const createUploader = require("../utils/multer-config");
const { createUploadHandler } = require("../middleware/upload-middleware");

// Importar middleware de admin
// Import admin middleware
const adminMiddleware = require("../middleware/admin-middleware");

// Crear el uploader específico para fotos de perfil
// Create the specific uploader for profile pictures
const profilePictureUploader = createUploader("profile_pictures");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router
const router = Router();

/* =============================================================================
   RUTAS PÚBLICAS (no requieren token)
   PUBLIC ROUTES (do not require a token)
   ============================================================================= */

// POST /api/users/register - Registrar un nuevo usuario / Register a new user
router.post("/register", registerUser);

// POST /api/users/login - Iniciar sesión de usuario / User Login
router.post("/login", loginUser);

/* =============================================================================
   RUTAS PROTEGIDAS (requieren token - Usuario autenticado)
   PROTECTED ROUTES (require token - Authenticated user)
   ============================================================================= */

// GET /api/users/profile - Obtener perfil del usuario autenticado / Get authenticated user profile
router.get("/profile", authMiddleware, getProfile);

// PUT /api/users/profile - Actualizar el perfil del usuario / Update user profile
router.put("/profile", authMiddleware, updateProfile);

// DELETE /api/users/profile - Eliminar el perfil del usuario / Delete user profile
router.delete("/profile", authMiddleware, deleteProfilebyUser);

// POST /api/users/profile/picture - Subir/actualizar foto de perfil / Upload/update profile picture
router.post(
  "/profile/picture",
  authMiddleware, // Verificar autenticación / Verify authentication
  createUploadHandler(profilePictureUploader, "profilePicture"), // Manejador de subidas / Upload handler
  updateProfilePicture
);

// PUT /api/users/password - Cambiar la contraseña del usuario / Change user's password
router.put("/password", authMiddleware, changePassword);

/* =============================================================================
   RUTAS PROTEGIDAS (solo para administradores)
   PROTECTED ROUTES (admin only)
   ============================================================================= */

// GET /api/users - Obtener todos los usuarios (admin) / Get all users (admin)
router.get(
  "/",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  getAllUsers // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

// GET /api/users/managers - Obtener todos los managers (admin) / Get all managers (admin)
router.get(
  "/managers",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  getAllManagers // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

// PUT /api/users/:id - Actualizar datos de un usuario (admin) / Update user data (admin)
router.put(
  "/:id",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  updateUser // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

// DELETE /api/users/:id - Eliminar un usuario por su id (admin) / Delete a user by their id (admin)
router.delete(
  "/:id",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  deleteUserByAdmin // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

// POST /api/users/admin/create - Crear un usuario con un rol específico (admin) / Create a user with a specific role (admin)
router.post(
  "/admin/create",
  authMiddleware, // 1. ¿Estás logueado? / Are you logged in?
  adminMiddleware, // 2. ¿Eres admin? / Are you admin?
  createUserByAdmin // 3. Si sí a ambas, ejecuta la acción / If yes to both, execute action
);

module.exports = router;
