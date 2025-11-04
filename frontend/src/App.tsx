// Importar Toaster de sonner
// Import Toaster from sonner
import { Toaster } from "sonner";

// Componentes necesarios de react-router-dom / Necessary components from react-router-dom
import { Routes, Route, Link } from "react-router-dom";

//Componentes / Components
import { ApiTest } from "./components/ApiTest";

//Pages
import { ProfilePage } from "./pages/ProfilePage";
import { ListGymsPage } from "./pages/ListGymsPage";
import { GymPage } from "./pages/GymPage";
import { AddGymPage } from "./pages/AddGymPage";
import { EditGymPage } from "./pages/EditGymPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterUserPage } from "./pages/RegisterUserPage";
import { UserVisitGymPage } from "./pages/UserVisitGymPage";
import { VisitsManagementPage } from "./pages/VisitsManagementPage";
import { UsersManagementPage } from "./pages/UsersManagementPage"; // ← AÑADIR

// Importar el hook de autenticación / Import the authentication hook
import { useAuth } from "./context/AuthContext";

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
                    : "/images/profile/default-avatar.png"
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
                <Link to="/visits/manage">Visitas</Link>
                {" | "}
                <Link to="/users/manage">Usuarios</Link>
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
        {/* ========================================
            RUTAS PÚBLICAS
            PUBLIC ROUTES
            ======================================== */}
        <Route path="/" element={<ApiTest />} />
        <Route path="/register" element={<RegisterUserPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/gyms" element={<ListGymsPage />} />
        <Route path="/gyms/:id" element={<GymPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ========================================
            RUTAS PROTEGIDAS: Autenticación requerida -User
            PROTECTED ROUTES: Authentication required - User
            ======================================== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/visits/:visitId/qr" element={<UserVisitGymPage />} />
        </Route>

        {/* ========================================
            RUTAS PROTEGIDAS: Admin y Manager
            PROTECTED ROUTES: Admin and Manager
            ======================================== */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route path="/gyms/edit/:id" element={<EditGymPage />} />
          <Route path="/visits/manage" element={<VisitsManagementPage />} />
          <Route path="/users/manage" element={<UsersManagementPage />} />{" "}
          {/* ← AÑADIR */}
        </Route>

        {/* ========================================
            RUTAS PROTEGIDAS: Solo Admin
            PROTECTED ROUTES: Admin only
            ======================================== */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/gyms/add" element={<AddGymPage />} />
        </Route>

        {/* ========================================
            RUTA NOT FOUND
            NOT FOUND ROUTE
            ======================================== */}
        <Route path="*" element={<h2>Página no encontrada</h2>} />
      </Routes>

      <Toaster position="bottom-left" richColors closeButton />
    </div>
  );
}

export default App;
