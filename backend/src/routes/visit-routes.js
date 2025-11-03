//Import Router express
const { Router } = require("express");

// Importar el controlador y el middleware de autentificación
// Import controller and auth middleware
const {
  createVisit,
  getVisitsByGym,
  getVisitsByUser,
  getAllVisits,
  getManagerGymVisits,
} = require("../controllers/visit-controller");
const authMiddleware = require("../middleware/auth-middleware");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router

const router = Router();

// POST /api/visits - Crear una nueva visita (Ruta Protegida) / Create a new visit (Protected Route)
router.post("/", authMiddleware, createVisit);

// GET /api/visits - Obtener todas las visitas con filtros (Admin) / Get all visits with filters (Admin)
router.get("/", authMiddleware, getAllVisits);

// GET /api/visits/my-gym - Obtener visitas del gimnasio del manager / Get manager's gym visits
router.get("/my-gym", authMiddleware, getManagerGymVisits);

// GET /api/visits/user/:userId - Obtener historial de un usuario (Ruta Protegida) / Obtain user historial (Protected Route)
router.get("/user/:userId", authMiddleware, getVisitsByUser);

// GET /api/visits/gym/:gymId - Obtener historial de un gimnasio (Ruta Protegida) /  Obtanin gym historial (Protected Route)
router.get("/gym/:gymId", authMiddleware, getVisitsByGym);

module.exports = router;
