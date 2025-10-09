//Imports
//Router express & controller
const { Router } = require("express");
const { getAllGyms, getGymById } = require("../controllers/gym-controller");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router

const router = Router();

// Rutas / Routes

// GET /api/gyms - Obtener todos los gimnasios /Get all gyms

router.get("/", getAllGyms);

// GET /api/gyms/:id - Obtener un gimnasio por ID / Get a gym by ID

router.get("/:id", getGymById);

module.exports = router;
