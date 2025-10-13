//Import Router express & controllers
const { Router } = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/user-controller");

//Importar middleware de autentificación
// Import auth middleware
const authMiddleware = require("../middleware/auth-middleware");

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

module.exports = router;
