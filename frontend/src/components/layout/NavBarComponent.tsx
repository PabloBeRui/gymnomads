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
            <Nav.Link as={NavLink} to="/my-visits" className={styles.navLink}>Mis Visitas</Nav.Link>
        </Nav.Item>
      )}
      {(user?.role === "manager" || user?.role === "admin") && (
        <>
          <Nav.Item>
            <Nav.Link as={NavLink} to="/visits/manage" className={styles.navLink}>Visitas</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={NavLink} to="/users/manage" className={styles.navLink}>Usuarios</Nav.Link>
          </Nav.Item>
        </>
      )}
      {user?.role === "admin" && (
        <Nav.Item>
            <Nav.Link as={NavLink} to="/managers/manage" className={styles.navLink}>Managers</Nav.Link>
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
      >
        <NavDropdown.Item onClick={() => navigate('/profile')}>
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
    <Navbar
      fixed="top"
      expand="lg"
      expanded={expanded}
      onToggle={() => setExpanded((prev) => !prev)}
      className={clsx(styles.navbar, scrolled ? styles.navbarScrolled : styles.navbarTransparent)}
    >
      <Container>
        <div className="d-lg-none">
            {token && user && renderAvatarDropdown()}
        </div>
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)} className={styles.navbarBrand}>
          GymNomads
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className={styles.navbarToggle} />
        
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto align-items-center" onSelect={() => setExpanded(false)}>
            <Nav.Item>
                <Nav.Link as={NavLink} to="/gyms" className={styles.navLink}>Gimnasios</Nav.Link>
            </Nav.Item>

            {token && user ? (
              <>
                {renderAuthenticatedLinks()}
                <Nav.Item className="d-none d-lg-block">{renderAvatarDropdown()}</Nav.Item>
              </>
            ) : (
              <>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/login" className={styles.navLink}>Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Button onClick={() => navigate('/register')} variant="primary" size="sm" className="ms-lg-2">Regístrate</Button>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};