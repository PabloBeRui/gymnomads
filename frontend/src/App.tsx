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

  const { token, logout, isLoading, user } = useAuth();

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
        <Link to="/">Home</Link>
        {" | "}

        {/*// Si hay token Y datos de usuario / If token AND user data exist*/}
        {token && user ? (
          <>
            {/* Mostrar nombre del usuario / Show user name */}
            <span style={{ color: "green", fontWeight: "bolder" }}>
              {user.first_name}
            </span>
            {" | "}
            {/* Mostrar foto de perfil si existe / Show profile picture if exists */}
            {console.log(user)}
            {user.profile_picture && (
              <img
                src={user.profile_picture} // Usar la URL del contexto / Use URL from context  user.profile_picture
                alt={`${user.first_name} ${user.last_name}`} // Texto alternativo / Alt text
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "5px",
                }}
              />
            )}

            <button onClick={logout}>Logout</button>
          </>
        ) : (
          // Si no hay token o no hay datos de usuario (o aún están cargando implícitamente por isLoading)
          // If no token or no user data (or implicitly still loading via isLoading)
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
