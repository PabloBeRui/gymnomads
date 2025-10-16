//Imports
//Router express & controller
const { Router } = require("express");
const {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
} = require("../controllers/gym-controller");

// Middlewares de seguridad / ecurity middlewares

const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");

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
  createGym // 3. si ambas son correctas, ejecutar la acción / if both are correct, execute the action
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

module.exports = router;
