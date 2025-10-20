// Servidor / Server

// Importar / Imports

// Importar el paquete `cors` para gestionar el Intercambio de Recursos de Origen Cruzado.
// Import the `cors` package to manage Cross-Origin Resource Sharing.
const cors = require("cors");
//Express framework
const express = require("express");
//Rutas /Routes
const gymRoutes = require("./src/routes/gym-routes");
const userRoutes = require("./src/routes/user-routes");
const visitRoutes = require("./src/routes/visit-routes");

// dotenv
// This line loads environment variables from the .env file
// Esta línea carga las variables de entorno del archivo .env
require("dotenv").config();

//  Create an instance of an Express application
// Crear una instancia de la aplicación de Express
const app = express();

// Define the port the server will listen on
//  Definir el puerto en el que el servidor va a escuchar
const PORT = process.env.PORT || 3000;

// Habilitar el middleware de CORS para permitir peticiones desde otros orígenes (ej. frontend).
// Enable the CORS middleware to allow requests from other origins (e.g., frontend).

app.use(cors());

// Middleware para que Express entienda peticiones  JSON
// Middleware for Express to understand JSON requests
app.use(express.json());

// Create a basic route for the homepage ('/')
// Crear una ruta básica para la página de inicio ('/')

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

//Montar / Mount

//Ruta de gimnasios / Gyms routes

app.use("/api/gyms", gymRoutes);

//Ruta de usuarioss / User routes

app.use("/api/users", userRoutes);

//Ruta de visitas / visits route

app.use("/api/visits", visitRoutes);

// Start the server and listen for requests on the defined port
// Iniciar el servidor y escuchar peticiones en el puerto definido

app.listen(PORT, () => {
  console.log(`ILERNA: Servidor con puerto ${PORT} funcionando`);
});
