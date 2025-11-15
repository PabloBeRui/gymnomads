// Importar Toaster de sonner
// Import Toaster from sonner
import { Toaster } from "sonner";

// Componentes necesarios de react-router-dom / Necessary components from react-router-dom
import { Routes, Route, Link } from "react-router-dom";

//Componentes / Components
import { ApiTest } from "./components/ApiTest";
import { Avatar } from "./components/Avatar";
import Footer from "./components/layout/Footer"; // Importar el nuevo Footer
import { CookieConsentModal } from "./components/ui/CookieConsentModal";

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
import { UsersManagementPage } from "./pages/UsersManagementPage";
import { ManagersManagementPage } from "./pages/ManagersManagementPage";
import { MyVisitsPage } from "./pages/MyVisitsPage";
import { PrivacyPolicyPage } from "./pages/Legal/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/Legal/TermsOfServicePage";
import { CookiesPolicyPage } from "./pages/Legal/CookiesPolicyPage";
import { LegalNoticePage } from "./pages/Legal/LegalNoticePage";

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toaster position="bottom-left" richColors closeButton />
      
      <header>
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
              <Link to="/profile">Perfil</Link>
              {" | "}
              {/* 1. Nombre y Foto/Enlace de Perfil */}
              <Link
                to="/profile"
                title={`Perfil de ${user.first_name}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  gap: "8px",
                }}>
                <Avatar
                  src={user.profile_picture}
                  firstName={user.first_name}
                  lastName={user.last_name}
                  size={30}
                />
              </Link>
              {" | "}

              {/* Enlace de visitas para el rol 'user' */}
              {user.role === "user" && (
                <>
                  <Link to="/my-visits">Mis Visitas</Link>
                  {" | "}
                </>
              )}

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

              {/* Mostrar solo si es 'admin' */}
              {/* Show only if 'admin' */}
              {user.role === "admin" && (
                <>
                  <Link to="/managers/manage">Managers</Link>
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
      </header>

      <main style={{ flex: 1 }}>
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
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsOfServicePage />} />
          <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
          <Route path="/legal-notice" element={<LegalNoticePage />} />

          {/* ========================================
              RUTAS PROTEGIDAS: Autenticación requerida -User
              PROTECTED ROUTES: Authentication required - User
              ======================================== */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/visits/:visitId/qr" element={<UserVisitGymPage />} />
            <Route path="/my-visits" element={<MyVisitsPage />} />
          </Route>

          {/* ========================================
              RUTAS PROTEGIDAS: Admin y Manager
              PROTECTED ROUTES: Admin and Manager
              ======================================== */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
            <Route path="/gyms/edit/:id" element={<EditGymPage />} />
            <Route path="/visits/manage" element={<VisitsManagementPage />} />
            <Route path="/users/manage" element={<UsersManagementPage />} />
          </Route>

          {/* ========================================
              RUTAS PROTEGIDAS: Solo Admin
              PROTECTED ROUTES: Admin only
              ======================================== */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/gyms/add" element={<AddGymPage />} />
            <Route
              path="/managers/manage"
              element={<ManagersManagementPage />}
            />
          </Route>

          {/* ========================================
              RUTA NOT FOUND
              NOT FOUND ROUTE
              ======================================== */}
          <Route path="*" element={<h2>Página no encontrada</h2>} />
        </Routes>
      </main>

      <Footer />
      <CookieConsentModal />
    </div>
  );
}

export default App;
