/**
 * =============================================================================
 * COMPONENTE: NavbarComponent
 * COMPONENT:  NavbarComponent
 * =============================================================================
 *
 * Descripción: Barra de navegación principal y responsive de la aplicación.
 * Es transparente por defecto y se vuelve sólida al hacer scroll.
 *
 * Description: Main responsive navigation bar for the application.
 * It's transparent by default and becomes solid on scroll.
 *
 * =============================================================================
 */
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../Avatar";
import { Navbar, Nav, Container, NavDropdown,Button } from "react-bootstrap";
import styles from "./NavBarComponent.module.scss";
import clsx from "clsx";

export const NavbarComponent = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para cambiar el fondo de la navbar al hacer scroll
  // Effect to change navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderAuthenticatedLinks = () => (
    <>
      {user?.role === "user" && (
        <Nav.Item>
            {/* Cierra el menú al hacer clic. */}
            {/* Closes the menu on click. */}
            <Nav.Link as={NavLink} to="/my-visits" className={styles.navLink} onClick={() => setExpanded(false)}>Mis Visitas</Nav.Link>
        </Nav.Item>
      )}
      {(user?.role === "manager" || user?.role === "admin") && (
        <>
          <Nav.Item>
            {/* Cierra el menú al hacer clic. */}
            {/* Closes the menu on click. */}
            <Nav.Link as={NavLink} to="/visits/manage" className={styles.navLink} onClick={() => setExpanded(false)}>Visitas</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            {/* Cierra el menú al hacer clic. */}
            {/* Closes the menu on click. */}
            <Nav.Link as={NavLink} to="/users/manage" className={styles.navLink} onClick={() => setExpanded(false)}>Usuarios</Nav.Link>
          </Nav.Item>
        </>
      )}
      {user?.role === "admin" && (
        <Nav.Item>
            {/* Cierra el menú al hacer clic. */}
            {/* Closes the menu on click. */}
            <Nav.Link as={NavLink} to="/managers/manage" className={styles.navLink} onClick={() => setExpanded(false)}>Managers</Nav.Link>
        </Nav.Item>
      )}
    </>
  );

  const renderAvatarDropdown = () => {
    if (!user) return null;
    return (
      <NavDropdown
        title={
          <Avatar
            src={user.profile_picture}
            firstName={user.first_name}
            lastName={user.last_name}
            className={styles.navAvatar}
          />
        }
        id="avatar-dropdown"
        align="end"
        className={styles.avatarDropdown}
        onClick={() => setExpanded(false)} // Cierra el menú principal al abrir el dropdown. // Closes main menu on dropdown open.
      >
        <NavDropdown.Item onClick={() => { navigate('/profile'); setExpanded(false); }}> {/* Cierra el menú al hacer clic. */}
            <i className="bi bi-person-fill me-2"></i>Perfil ({user.first_name})
        </NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item
          onClick={() => {
            logout();
            setExpanded(false);
          }}
        >
            <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
        </NavDropdown.Item>
      </NavDropdown>
    );
  };

  return (
    // Componente principal de la barra de navegación.
    // Main navigation bar component.
    <Navbar
      fixed="top" // Fija la barra de navegación en la parte superior. // Fixes the navbar to the top.
      expand="lg" // Expande la barra de navegación en pantallas grandes y superiores. // Expands the navbar on large screens and above.
      expanded={expanded} // Controla el estado expandido/colapsado. // Controls expanded/collapsed state.
      onToggle={() => setExpanded((prev) => !prev)} // Maneja la alternancia del menú. // Handles menu toggling.
      className={clsx(styles.navbar, scrolled ? styles.navbarScrolled : styles.navbarTransparent)} // Aplica estilos dinámicos según el scroll. // Applies dynamic styles based on scroll.
    >
      {/* Contenedor principal de la barra de navegación. */}
      {/* Main container for the navigation bar. */}
      <Container className="d-flex align-items-center justify-content-between">
        {/* Mobile-only Avatar Link */}
        {token && user ? (
            <Link to="/profile" className="d-lg-none d-flex align-items-center me-2" onClick={() => setExpanded(false)}> {/* Cierra el menú al hacer clic. */}
              <Avatar
                src={user.profile_picture}
                firstName={user.first_name}
                lastName={user.last_name}
                className={styles.navAvatar} // Reuse existing navAvatar styling for size
              />
            </Link>
        ) : (
            <div className="d-lg-none me-2" style={{ width: '40px' }}></div> // Placeholder for alignment
        )}
        
        {/* Marca de la aplicación (logo/nombre). */}
        {/* Application brand (logo/name). */}
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)} className={clsx(styles.navbarBrand, "mx-auto", "mx-lg-0")}>
          GymNomads
        </Navbar.Brand>
        {/* Botón de alternancia para el menú responsivo (hamburguesa). */}
        {/* Toggle button for responsive menu (hamburger). */}
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className={clsx(styles.navbarToggle, "ms-auto")} />
        {/* Contenido colapsable de la barra de navegación. */}
        {/* Collapsible content of the navigation bar. */}
        <Navbar.Collapse id="responsive-navbar-nav">
          {/* Enlaces de navegación. */}
          {/* Navigation links. */}
          <Nav className="ms-auto align-items-center" onSelect={() => setExpanded(false)}>
            {/* Enlace a la página de gimnasios. */}
            {/* Link to gyms page. */}
            <Nav.Item>
                <Nav.Link as={NavLink} to="/gyms" className={styles.navLink} onClick={() => setExpanded(false)}>Gimnasios</Nav.Link>
            </Nav.Item>

            {/* Renderiza enlaces autenticados o de inicio de sesión/registro. */}
            {/* Renders authenticated or login/register links. */}
            {token && user ? (
              <>
                {/* Enlaces específicos para roles de usuario autenticado. */}
                {/* Specific links for authenticated user roles. */}
                {renderAuthenticatedLinks()}
                {/* Dropdown del avatar (visible en desktop). */}
                {/* Avatar dropdown (visible en desktop). */}
                <Nav.Item className="d-none d-lg-block">{renderAvatarDropdown()}</Nav.Item>
              </>
            ) : (
              <>
                {/* Enlace para iniciar sesión. */}
                {/* Link to login. */}
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/login" className={styles.navLink} onClick={() => setExpanded(false)}>Login</Nav.Link>
                </Nav.Item>
                {/* Botón para registrarse. */}
                {/* Button to register. */}
                <Nav.Item>
                    <Button onClick={() => { navigate('/register'); setExpanded(false); }} variant="primary" size="sm" className="ms-lg-2">Regístrate</Button>
                </Nav.Item>
              </>
            )}

            {/* Links para menú hamburguesa en móvil */}
            {token && user && (
              <div className="d-lg-none mt-3 border-top pt-3">
                <Nav.Link onClick={() => { navigate('/profile'); setExpanded(false); }} className={styles.navLink}>
                    <i className="bi bi-person-fill me-2"></i>Perfil
                </Nav.Link>
                <Nav.Link onClick={() => { logout(); setExpanded(false); }} className={styles.navLink}>
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                </Nav.Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
