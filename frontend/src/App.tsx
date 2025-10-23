// Importar Toaster de sonner
// Import Toaster from sonner
import { Toaster } from "sonner";

// Componentes necesarios de react-router-dom / Necessary components from react-router-dom
import { Routes, Route, Link } from "react-router-dom";

//Componentes / Components
import { ApiTest } from "./components/ApiTest";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";

// Importar el hook de autenticación / Import the authentication hook
import { useAuth } from "./context/AuthContext";

function App() {
  // Obtener el estado de autenticación y la función logout del contexto.
  // Get authentication state and logout function from the context.

  const { token, logout, isLoading } = useAuth();

  // Mostrar "Cargando..." mientras el AuthProvider verifica el token inicial.
  // Show "Loading..." while AuthProvider checks the initial token.
  if (isLoading) {
    return <div>Cargando...</div>; // TODO Spinner
  }
  return (
    <div>
      <h1>GymNomads Frontend</h1>
      {/* Crear enlaces de navegación simples */}
      {/* Create simple navigation links */}
      <nav>
        <Link to="/">Home </Link> |{" | "}
        {/* Renderizado condicional basado en la existencia del token */}
        {/* Conditional rendering based on token existence */}
        {/* Si hay token (usuario logueado) / If token exists (user logged in)*/}
        {token ? (
          <>
            {/* //TODO: Añadir enlace a Perfil/Dashboard aquí . desde imagen perfil */}
            {/* <Link to="/profile">Perfil</Link> |{' '} */}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          // Si no hay token (usuario no logueado) / If no token (user not logged in)
          <>
            <Link to="/register">Registro</Link> |{" "}
            <Link to="/login">Login</Link>
          </>
        )}
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

        {/* Ruta para la página de login ('/login') */}
        {/* Route for the login page ('/login') */}
        <Route path="/login" element={<LoginForm />} />
        {/* Ruta para páginas no encontradas (404) */}
        {/* Route for not-found pages (404)  */}
        <Route path="*" element={<h2>Página no encontrada</h2>} />
      </Routes>
      {/* Añadir el contenedor de notificaciones Sonner */}
      {/* Add the Sonner notification container */}
      <Toaster position="bottom-left" richColors closeButton />
    </div>
  );
}

export default App;
