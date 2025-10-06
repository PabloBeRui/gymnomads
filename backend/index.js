// Creating Server test
// Creando un servidor de prueba

// 1. Import Express framework
// 1. Importar el framework Express

const express = require("express");

// 2. Create an instance of an Express application
// 2. Crear una instancia de la aplicación de Express
const app = express();

// 3. Define the port the server will listen on
// 3. Definir el puerto en el que el servidor va a escuchar
const port = 3000;

// 4. Create a basic route for the homepage ('/')
// 4. Crear una ruta básica para la página de inicio ('/')

app.get("/", (req, res) => {
  res.send("Hola ILERNA! Backend de prueba funcionando");
});

// 5. Start the server and listen for requests on the defined port
// 5. Iniciar el servidor y escuchar peticiones en el puerto definido

app.listen(port, () => {
  console.log(`ILERNA: Servidor de prueba con puerto ${port} funcionando`);
});
