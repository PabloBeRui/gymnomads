// Importar Toaster de sonner
// Import Toaster from sonner
import { Toaster } from "sonner";

// Componentes necesarios de react-router-dom / Necessary components from react-router-dom
import { Routes, Route, Link } from "react-router-dom";

//Componentes / Components
import { ApiTest } from "./components/ApiTest";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { ProfilePage } from "./pages/ProfilePage";
import { ListGymsPage } from "./pages/ListGymsPage";

// Importar el hook de autenticación / Import the authentication hook
import { useAuth } from "./context/AuthContext";
import { AddGymPage } from "./pages/AddGymPage";

// Importar el protector de rutas / Import the route protector
import { ProtectedRoute } from "./router/ProtectedRoute";

function App() {
  // --- Temporary Placeholder Components ---

  // Placeholder para la página de "No Autorizado" (Error 403)
  // Placeholder for the "Unauthorized" page (Error 403)
  const UnauthorizedPage = () => (
    <div>
      <h2>Acceso Denegado</h2>
      <p>
        No tienes permiso para ver esta página.{" "}
        <Link to="/">Volver al inicio</Link>
      </p>
    </div>
  );

  // Placeholder for the Manager panel
  const ManagerDashboard = () => (
    <div>
      <h2>Panel de Manager</h2>
      <p>(Solo visible para roles 'manager' y 'admin')</p>
    </div>
  );

  // Placeholder for the Admin panel
  const AdminDashboard = () => (
    <div>
      <h2>Panel de Administrador</h2>
      <p>(Solo visible para rol 'admin')</p>
    </div>
  );

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
        <Link to="/gyms">Gimnasios</Link>
        {" | "}

        {/*// Si hay token Y datos de usuario / If token AND user data exist*/}
        {token && user ? (
          // --- ESTADO AUTENTICADO ---
          <>
            {/* 1. Nombre y Foto/Enlace de Perfil */}
            <Link
              to="/profile"
              title={`Perfil de ${user.first_name}`}
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}>
              <img
                src={
                  user.profile_picture
                    ? user.profile_picture
                    : "/images/profile/default_avatar.png"
                }
                alt={`Perfil de ${user.first_name}`}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "5px",
                }}
              />
              <span style={{ color: "green", fontWeight: "bolder" }}>
                {user.first_name}
              </span>
            </Link>
            {" | "}

            {/* 2. Enlaces Condicionales por Rol */}
            {/* Mostrar si es 'manager' O 'admin' */}
            {/* Show if 'manager' OR 'admin' */}
            {(user.role === "manager" || user.role === "admin") && (
              <>
                <Link to="/panel-manager">Panel Manager</Link>
                {" | "}
              </>
            )}
            {/* Mostrar SOLO si es 'admin' */}
            {/* Show ONLY if 'admin' */}
            {user.role === "admin" && (
              <>
                <Link to="/panel-admin">Panel Admin</Link>
                {" | "}
              </>
            )}

            {/* 3. Botón Logout */}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          // --- ESTADO NO AUTENTICADO ---
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
        {/* --- Rutas Públicas --- */}
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<ApiTest />} />
        {/* ApiTest sigue en Home por ahora */}
        <Route path="/gyms" element={<ListGymsPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />{" "}
        {/* <-- RUTA PARA 403 */}
        {/* --- Rutas Protegidas (Solo requieren estar logueado) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          {/* <Route path="/mis-visitas" element={<VisitsPage />} /> */}
        </Route>
        {/* --- Rutas Protegidas (Requieren Rol 'manager' o 'admin') --- */}
        <Route element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}>
          <Route path="/panel-manager" element={<ManagerDashboard />} />
        </Route>
        {/* --- Rutas Protegidas (Requieren Rol 'admin') --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/panel-admin" element={<AdminDashboard />} />
          {/* Ruta para añadir gimnasio (solo admin) */}
          {/* Route to add gym (admin only) */}
          <Route path="/gyms/add" element={<AddGymPage />} />
          {/* <Route path="/gestionar-usuarios" element={<UserManagementPage />} /> */}
        </Route>
        {/* --- Ruta Not Found --- */}
        <Route path="*" element={<h2>Página no encontrada</h2>} />
      </Routes>

      <Toaster position="bottom-left" richColors closeButton />
    </div>
  );
}

export default App;
