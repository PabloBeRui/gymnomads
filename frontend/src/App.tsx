// Componentes necesarios de react-router-dom / Necessary components from react-router-dom

import { Routes, Route, Link } from "react-router-dom";

//Componentes / Components
import { ApiTest } from "./components/ApiTest";
import { RegisterForm } from "./components/RegisterForm";

function App() {
  return (
    <div>
      <h1>GymNomads Frontend</h1>
      {/* Crear enlaces de navegación simples */}
      {/* Create simple navigation links */}
      <nav>
        <Link to="/">Home (Test API)</Link> |{" "}
        <Link to="/register">Registro</Link>
      </nav>
      <hr />

      {/* Definir las rutas de la aplicación */}
      {/* Define the application routes */}
      <Routes>
        {/* Ruta para la página principal ('/') */}
        {/* Route for the main page ('/') */}
        <Route path="/" element={<ApiTest />} />

        {/* Ruta para la página de registro ('/register') */}
        {/* Route for the registration page ('/register') */}
        <Route path="/register" element={<RegisterForm />} />

        {/* Ruta para páginas no encontradas (404) */}
        {/* Route for not-found pages (404)  */}
        <Route path="*" element={<h2>Página no encontrada</h2>} />
      </Routes>
    </div>
  );
}

export default App;
