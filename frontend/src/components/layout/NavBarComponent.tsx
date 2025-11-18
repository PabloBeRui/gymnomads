/**
 * =============================================================================
 * COMPONENTE: NavbarComponent
 * COMPONENT:  NavbarComponent
 * =============================================================================
 *
 * Descripción: Barra de navegación principal y responsive de la aplicación.
 * Muestra enlaces condicionales basados en el estado de autenticación y rol.
 * El menú móvil se autocolapsa al hacer clic y se muestra como un overlay
 * a la derecha.
 *
 * Description: Main responsive navigation bar for the application.
 * Displays conditional links based on authentication state and role.
 * The mobile menu auto-collapses on click and is displayed as an overlay
 * on the right.
 *
 * =============================================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../Avatar";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import styles from "./NavBarComponent.module.scss";
import clsx from "clsx";

export const NavbarComponent = () => {
  const { user, token, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Renderiza los enlaces para usuarios autenticados.
  // Renders links for authenticated users.
  const renderAuthenticatedLinks = () => (
    <>
      {user?.role === "user" && (
        <Nav.Link as={Link} to="/my-visits" eventKey="1">
          Mis Visitas
        </Nav.Link>
      )}
      {(user?.role === "manager" || user?.role === "admin") && (
        <>
          <Nav.Link as={Link} to="/visits/manage" eventKey="2">
            Visitas
          </Nav.Link>
          <Nav.Link as={Link} to="/users/manage" eventKey="3">
            Usuarios
          </Nav.Link>
        </>
      )}
      {user?.role === "admin" && (
        <Nav.Link as={Link} to="/managers/manage" eventKey="4">
          Managers
        </Nav.Link>
      )}
    </>
  );

      // Renderiza el menú desplegable del avatar.

      // Renders the avatar dropdown menu.

      const renderAvatarDropdown = (extraClassName?: string) => {

          if (!user) return null;

  

          return (

              <NavDropdown

                  title={

                      <Avatar

                          src={user.profile_picture}

                          firstName={user.first_name}

                          lastName={user.last_name}

                          className={clsx(styles.navAvatar, "mt-3")}

                      />

                  }

                  id="avatar-dropdown"

                  align="end"

                  className={extraClassName} // Aplica la clase extra aquí

              >

                  <NavDropdown.Item as={Link} to="/profile" eventKey="5">

                      Perfil ({user.first_name})

                  </NavDropdown.Item>

                  <NavDropdown.Divider />

                  <NavDropdown.Item

                      onClick={() => {

                          logout();

                          setExpanded(false);

                      }}

                      eventKey="6"

                  >

                      Cerrar Sesión

                  </NavDropdown.Item>

              </NavDropdown>

          );

      };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      sticky="top"
      expanded={expanded}
      onToggle={() => setExpanded((prev) => !prev)}>
      <Container className="position-relative">
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
          GymNomads
        </Navbar.Brand>

        {/* --- CONTROLES DE LA VISTA MÓVIL --- */}
        {/* --- MOBILE VIEW CONTROLS --- */}
        {/* Este bloque solo es visible en pantallas pequeñas (d-lg-none) */}
        {/* This block is only visible on small screens (d-lg-none) */}
        <div className="d-lg-none d-flex align-items-center gap-3">
          {/* Si el usuario está logueado, muestra el avatar aquí */}
          {/* If the user is logged in, show the avatar here */}
          {user && token && renderAvatarDropdown("me-3")}
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        </div>

        <Navbar.Collapse
          id="responsive-navbar-nav"
          className={styles.mobileOverlay}>
          {/* NAV 1: Enlaces principales (siempre visibles en el collapse) */}
          {/* NAV 1: Main links (always visible in the collapse) */}
          <Nav className="me-auto" onSelect={() => setExpanded(false)}>
            <Nav.Link as={Link} to="/" eventKey="7">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/gyms" eventKey="8">
              Gimnasios
            </Nav.Link>
            {user && token && renderAuthenticatedLinks()}
          </Nav>

          {/* NAV 2: Controles de autenticación */}
          {/* NAV 2: Authentication controls */}
          <Nav
            className="align-items-center"
            onSelect={() => setExpanded(false)}>
            {token && user ? (
              // En escritorio: muestra el avatar (oculto en móvil)
              // On desktop: show the avatar (hidden on mobile)
              <div className="d-none d-lg-block ms-lg-4">
                {renderAvatarDropdown()}
              </div>
            ) : (
              // Para todos los tamaños: muestra Login/Registro si no está logueado.
              // For all sizes: show Login/Register if not logged in.
              <>
                <Nav.Link as={Link} to="/register-user" eventKey="9">
                  Registro
                </Nav.Link>
                <Nav.Link as={Link} to="/login" eventKey="10">
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
