/**
 * =============================================================================
 * COMPONENTE: App
 * COMPONENT:  App
 * =============================================================================
 *
 * Descripción: Componente raíz de la aplicación.
 * Configura el layout principal (Navbar, Main, Footer), el enrutamiento
 * (Routes) y los componentes globales (Toaster, Modales).
 *
 * Description: Root component of the application.
 * Configures the main layout (Navbar, Main, Footer), routing (Routes),
 * and global components (Toaster, Modals).
 *
 * =============================================================================
 */

// Importar Toaster de sonner
// Import Toaster from sonner
import { Toaster } from "sonner";

// Componentes necesarios de react-router-dom
// Necessary components from react-router-dom
import { Routes, Route, Link } from "react-router-dom";

// --- Componentes de Layout y UI Globales ---
// --- Global Layout and UI Components ---
import Footer from "./components/layout/Footer";
import { CookieConsentModal } from "./components/ui/CookieConsentModal";
// Corregir importación: El Navbar es nuestro, no de react-bootstrap
// Fix import: The Navbar is ours, not from react-bootstrap
import { NavbarComponent } from "./components/layout/NavBarComponent";

// --- Páginas de la Aplicación ---
// --- Application Pages ---
import { ProfilePage } from "./pages/ProfilePage";
import { ListGymsPage } from "./pages/ListGymsPage";
import { GymPage } from "./pages/GymPage"; // Corregida la ruta
import { AddGymPage } from "./pages/AddGymPage";
import { EditGymPage } from "./pages/EditGymPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterUserPage } from "./pages/RegisterUserPage";
import { UserVisitGymPage } from "./pages/UserVisitGymPage";
import { VisitsManagementPage } from "./pages/VisitsManagementPage";
import { UsersManagementPage } from "./pages/UsersManagementPage";
import { ManagersManagementPage } from "./pages/ManagersManagementPage";
import { MyVisitsPage } from "./pages/MyVisitsPage";
import { LandingPage } from "./pages/LandingPage/LandingPage";

// --- Páginas Legales e Informativas ---
// --- Legal and Informational Pages ---
import { PrivacyPolicyPage } from "./pages/Legal/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/Legal/TermsOfServicePage";
import { CookiesPolicyPage } from "./pages/Legal/CookiesPolicyPage";
import { LegalNoticePage } from "./pages/Legal/LegalNoticePage";
import { AboutUsPage } from "./pages/AboutUs/AboutUsPage";
import { FaqPage } from "./pages/AboutUs/FaqPage";
import { JoinUsPage } from "./pages/AboutUs/JoinUsPage";
import { GymContactPage } from "./pages/AboutUs/GymContactPage";

// Importar el protector de rutas
// Import the route protector
import { ProtectedRoute } from "./router/ProtectedRoute";

function App() {
  // Componente placeholder para la página de "No Autorizado" (Error 403)
  // Placeholder component for the "Unauthorized" page (Error 403)
  const UnauthorizedPage = () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Acceso Denegado</h2>
      <p>
        No tienes permiso para ver esta página.{" "}
        <Link to="/" className="text-primary">Volver al inicio</Link>
      </p>
    </div>
  );

  // Componente placeholder para la página "No Encontrada" (Error 404)
  // Placeholder component for the "Not Found" page (Error 404)
  const NotFoundPage = () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>404 - Página no encontrada</h2>
      <p>
        Lo sentimos, la página que buscas no existe.{" "}
        <Link to="/" className="text-primary">Volver al inicio</Link>
      </p>
    </div>
  );

  return (
    // Contenedor principal para layout "sticky footer"
    // Main container for "sticky footer" layout
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Sistema global de notificaciones */}
      {/* Global notification system */}
      <Toaster position="bottom-left" richColors closeButton />

      {/* Barra de navegación principal */}
      {/* Main navigation bar */}
      <NavbarComponent />

      {/* Contenido principal de la página */}
      {/* Main page content */}
      <main style={{ flex: 1, paddingTop: '90px' }}>
        {/* Definir las rutas de la aplicación */}
        {/* Define the application routes */}
        <Routes>
          {/* ========================================
              RUTAS PÚBLICAS
              PUBLIC ROUTES
              ======================================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterUserPage />} />{" "}
          {/* Ruta corregida */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/gyms" element={<ListGymsPage />} />
          <Route path="/gyms/:id" element={<GymPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          {/* --- Rutas Legales e Info --- */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsOfServicePage />} />
          <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
          <Route path="/legal-notice" element={<LegalNoticePage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/join" element={<JoinUsPage />} />
          <Route path="/gym-contact" element={<GymContactPage />} />
          {/* ========================================
              RUTAS PROTEGIDAS: Autenticación requerida (User, Manager, Admin)
              PROTECTED ROUTES: Authentication required (User, Manager, Admin)
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
          <Route
            element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
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
              RUTA NOT FOUND (404)
              NOT FOUND ROUTE (404)
              ======================================== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer global */}
      {/* Global footer */}
      <Footer />

      {/* Modal global de consentimiento de cookies */}
      {/* Global cookie consent modal */}
      <CookieConsentModal />
    </div>
  );
}

export default App;
