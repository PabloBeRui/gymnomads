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
import { Routes, Route, Link, useLocation } from "react-router-dom";
import clsx from "clsx";

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

// Importar componente para scroll automático al inicio
// Import component for automatic scroll to top
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  // Componente placeholder para la página de "No Autorizado" (Error 403)
  // Placeholder component for the "Unauthorized" page (Error 403)
  const UnauthorizedPage = () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Acceso Denegado</h2>
      <p>
        No tienes permiso para ver esta página.{" "}
        <Link to="/" className="text-primary">
          Volver al inicio
        </Link>
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
        <Link to="/" className="text-primary">
          Volver al inicio
        </Link>
      </p>
    </div>
  );

  return (
    <>
      {/* ========================================
        FONDO DE VIDEO GLOBAL Y FIJO
        GLOBAL FIXED VIDEO BACKGROUND
        ======================================== */}
      <video autoPlay muted loop playsInline className="video-bg">
        <source src="/videos/landing_video_1.mp4" type="video/mp4" />
      </video>
      <div className="overlay-bg"></div>

      {/* ========================================
        CONTENEDOR PRINCIPAL DE LA APLICACIÓN
        MAIN APP CONTAINER
        ======================================== */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "relative",
        }}>
        <ScrollToTop />
        <Toaster
          position="bottom-left"
          closeButton
          theme="dark" // Fondo oscuro para los toasts
          toastOptions={{
            style: {
              background: '#194350', // Color $secondary (Azul Petróleo)
              color: '#F8F9FA',      // Color $light (Claro) para el texto general
              border: 'none',        // Sin borde por defecto, los bordes de estado serán 'border-left'
              padding: '12px 16px',  // Ajuste de padding para el borde izquierdo
            },
            classNames: {
              title: 'text-white',    // Título en blanco
              description: 'text-gray-300', // Descripción en gris claro
              closeButton: 'bg-white hover:bg-gray-200', // Botón de cierre en blanco
            },
            // Estilos por tipo de toast
            success: {
              style: { borderLeft: '5px solid #2A9D8F' }, // Color $success
              classNames: {
                icon: 'text-success', // Color del icono
              },
            },
            error: {
              style: { borderLeft: '5px solid #DC3545' }, // Color $danger
              classNames: {
                icon: 'text-danger', // Color del icono
              },
            },
            warning: {
              style: { borderLeft: '5px solid #E6B800' }, // Color $warning
              classNames: {
                icon: 'text-warning', // Color del icono
              },
            },
            info: {
              style: { borderLeft: '5px solid #0077B6' }, // Color $info
              classNames: {
                icon: 'text-info', // Color del icono
              },
            },
            default: { // Para el toast sin tipo explícito
              style: { borderLeft: '5px solid #FFB700' }, // Color $primary
              classNames: {
                icon: 'text-primary', // Color del icono
              },
            },
          }}
        />
        <NavbarComponent />
        <main
          style={{ flex: 1, paddingTop: "90px" }}
          className={clsx({ "main-content-glass": !isLandingPage })}>
          <Routes>
            {/* ========================================
              RUTAS PÚBLICAS
              PUBLIC ROUTES
              ======================================== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterUserPage />} />
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
              <Route
                path="/visits/:visitId/qr"
                element={<UserVisitGymPage />}
              />
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
        <Footer />
        <CookieConsentModal />
      </div>
    </>
  );
}

export default App;
