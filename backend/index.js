// Server
// servidor

// Importar / Imports

//Express framework
const express = require("express");
//Rutas /Routes
const gymRoutes = require("./src/routes/gym-routes");

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

// Middleware para que Express entienda peticiones  JSON
// Middleware for Express to understand JSON requests
app.use(express.json());

// Create a basic route for the homepage ('/')
// Crear una ruta básica para la página de inicio ('/')

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

//Ruta de gimnasios / Gyms routes

app.use("/api/gyms", gymRoutes);

// Start the server and listen for requests on the defined port
// Iniciar el servidor y escuchar peticiones en el puerto definido

app.listen(PORT, () => {
  console.log(`ILERNA: Servidor con puerto ${PORT} funcionando`);
});
