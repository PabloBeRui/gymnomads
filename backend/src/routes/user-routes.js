//Imports
//Router express & controller
const { Router } = require("express");
const { registerUser } = require("../controllers/user-controller");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router

const router = Router();

// POST /api/users/register - Registrar un nuevo usuario / Register a new user

router.post("/register", registerUser);

module.exports = router;
