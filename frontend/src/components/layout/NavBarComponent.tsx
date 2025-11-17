/**
 * =============================================================================
 * COMPONENTE: Navbar
 * COMPONENT:  Navbar
 * =============================================================================
 *
 * Descripción: Barra de navegación principal y responsive de la aplicación.
 * Utiliza React-Bootstrap y React-Router para la navegación y muestra
 * enlaces condicionales basados en el estado de autenticación y el rol del usuario.
 *
 * Description: Main responsive navigation bar for the application.
 * Uses React-Bootstrap and React-Router for navigation and displays
 * conditional links based on authentication state and user role.
 *
 * =============================================================================
 */

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../Avatar"; // Asumiendo que Avatar está en 'components'

// Importar componentes de React-Bootstrap
// Import React-Bootstrap components
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

export const NavbarComponent = () => {
  // Obtener el estado de autenticación y la función logout del contexto.
  // Get authentication state and logout function from the context.
  const { user, token, logout } = useAuth();

  return (
    // 'sticky="top"' mantiene el navbar pegado arriba
    // 'sticky="top"' keeps the navbar fixed at the top
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        {/* --- Marca/Logo --- */}
        <Navbar.Brand as={Link} to="/">
          GymNomads
        </Navbar.Brand>

        {/* --- Botón Hamburguesa (se muestra en móvil) --- */}
        {/* --- Hamburger Button (shows on mobile) --- */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* --- Contenido Colapsable --- */}
        {/* --- Collapsible Content --- */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Enlaces que todos ven */}
            {/* Links everyone sees */}
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/gyms">
              Gimnasios
            </Nav.Link>
          </Nav>

          {/* --- Lógica de Autenticación (derecha) --- */}
          {/* --- Authentication Logic (right) --- */}
          <Nav>
            {token && user ? (
              // --- ESTADO AUTENTICADO ---
              // --- AUTHENTICATED STATE ---
              <>
                {/* Enlaces de Usuario/Manager/Admin */}
                {user.role === "user" && (
                  <Nav.Link as={Link} to="/my-visits">
                    Mis Visitas
                  </Nav.Link>
                )}

                {(user.role === "manager" || user.role === "admin") && (
                  <>
                    <Nav.Link as={Link} to="/visits/manage">
                      Visitas
                    </Nav.Link>
                    <Nav.Link as={Link} to="/users/manage">
                      Usuarios
                    </Nav.Link>
                  </>
                )}

                {user.role === "admin" && (
                  <Nav.Link as={Link} to="/managers/manage">
                    Managers
                  </Nav.Link>
                )}

                {/* --- Menú de Perfil (Dropdown) --- */}
                {/* --- Profile Menu (Dropdown) --- */}
                <NavDropdown
                  title={
                    <Avatar
                      src={user.profile_picture}
                      firstName={user.first_name}
                      lastName={user.last_name}
                      size={30}
                    />
                  }
                  id="basic-nav-dropdown"
                  align="end" // Alinea el menú a la derecha
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    Perfil ({user.first_name})
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>
                    Cerrar Sesión (Logout)
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              // --- ESTADO NO AUTENTICADO ---
              // --- NON-AUTHENTICATED STATE ---
              <>
                <Nav.Link as={Link} to="/register-user">
                  Registro
                </Nav.Link>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
