// Import Router express & controllers
const { Router } = require("express");

// Importar controladores y middleware de autenticación
// Import controllers and auth middleware
const {
  createVisit,
  getVisitById, // Importar getVisitById
  getVisitsByGym,
  getVisitsByUser,
  getAllVisits,
  getManagerGymVisits,
  getMyVisits,
  getVisitsStats,
  getManagerOutgoingVisits,
} = require("../controllers/visit-controller");
const authMiddleware = require("../middleware/auth-middleware");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router
const router = Router();

/* =============================================================================
   RUTAS PROTEGIDAS (requieren token)
   PROTECTED ROUTES (require token)
   ============================================================================= */

// POST /api/visits - Crear una nueva visita / Create a new visit
router.post("/", authMiddleware, createVisit);

// GET /api/visits - Obtener todas las visitas con filtros (Admin) / Get all visits with filters (Admin)
router.get("/", authMiddleware, getAllVisits);

// GET /api/visits/my-gym - Obtener visitas del gimnasio del manager / Get manager's gym visits
router.get("/my-gym", authMiddleware, getManagerGymVisits);

// GET /api/visits/my-gym/outgoing - Obtener visitas salientes de los usuarios del gimnasio del manager / Get manager's gym outgoing visits
router.get("/my-gym/outgoing", authMiddleware, getManagerOutgoingVisits);

// GET /api/visits/my-visits - Obtener las visitas del usuario logueado / Get logged-in user's visits
router.get("/my-visits", authMiddleware, getMyVisits);

// GET /api/visits/user/:userId - Obtener historial de visitas de un usuario / Get user's visit history
router.get("/user/:userId", authMiddleware, getVisitsByUser);

// GET /api/visits/gym/:gymId - Obtener historial de visitas de un gimnasio / Get gym's visit history
router.get("/gym/:gymId", authMiddleware, getVisitsByGym);

// GET /api/visits/stats - Obtener estadísticas de visitas (para todos los roles) / Get visit statistics (for all roles)
router.get("/stats", authMiddleware, getVisitsStats);

// GET /api/visits/:id - Obtener detalles de una visita por ID / Get visit details by ID
router.get("/:id", authMiddleware, getVisitById);

module.exports = router;
