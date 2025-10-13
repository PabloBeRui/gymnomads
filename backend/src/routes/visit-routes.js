//Import Router express
const { Router } = require("express");

// Importar el controlador y el middleware de autentificación
// Import controller and auth middleware
const { createVisit } = require("../controllers/visit-controller");
const authMiddleware = require("../middleware/auth-middleware");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router

const router = Router();

// POST /api/visits - Crear una nueva visita (Ruta Protegida) / Create a new visit (Protected Route)

router.post("/", authMiddleware, createVisit);

module.exports = router;
