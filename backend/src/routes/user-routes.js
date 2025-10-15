//Import Router express & controllers
const { Router } = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteProfilebyUser,
  updateProfilePicture
} = require("../controllers/user-controller");

//Importar middleware de autentificación
// Import auth middleware
const authMiddleware = require("../middleware/auth-middleware");

//multer
const upload = require("../utils/multer-config");


// Crear una instancia del enrutador de Express
// Create an instance of the Express router

const router = Router();


// --- RUTAS PÚBLICAS (no requieren token) ---
// --- PUBLIC ROUTES (do not require a token) ---

// POST /api/users/register - Registrar un nuevo usuario / Register a new user

router.post("/register", registerUser);

// POST /api/users/login - Iniciar sesión de usuario / User Login

router.post("/login", loginUser);

// --- RUTAS PROTEGIDAS (requieren token) ---
// --- PROTECTED ROUTES (require a token) ---

// GET /api/users/profile - Obtener perfil del usuario autenticado / Obtain auth user profile

router.get("/profile", authMiddleware, getProfile);

// PUT /api/users/profile - Actualizar el perfil del usuario / Update user profile

router.put("/profile", authMiddleware, updateProfile);

// DELETE /api/users/profile - Eliminar el perfil del usuario / Delete user profile

router.delete("/profile", authMiddleware, deleteProfilebyUser);

// POST /api/users/profile/picture - Subir/actualizar foto de perfil
// POST /api/users/profile/picture - Upload/update profile picture
router.post(
  "/profile/picture",
  authMiddleware, // Obtener perfil del usuario autenticado / Obtain auth user profile
  upload.single("profilePicture"), //  Multer procesa el archivo / multer process the files
  updateProfilePicture
);

module.exports = router;
