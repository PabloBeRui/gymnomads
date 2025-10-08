//Imports
//Router express & controller
const { Router } = require("express");
const { getAllGyms } = require("../controllers/gym-controller");

// Crear una instancia del enrutador de Express
// Create an instance of the Express router

const router = Router();

// Define la ruta. Cuando llegue una petición GET a la raíz ('/'),
// se ejecutará la función 'getAllGyms' que importamos del controlador.
// Define the route. When a GET request arrives at the root ('/'),
// the 'getAllGyms' function we imported from the controller will be executed.

router.get('/', getAllGyms)


module.exports=router;