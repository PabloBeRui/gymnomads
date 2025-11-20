/**
 * =============================================================================
 * COMPONENTE: NavbarComponent
 * COMPONENT: NavbarComponent
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
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../Avatar";
import { Navbar, Nav, Container, NavDropdown, Button } from "react-bootstrap";
import styles from "./NavBarComponent.module.scss";
import clsx from "clsx";

export const NavbarComponent = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    // Ref para el contenedor de la navbar // Ref for the navbar container
    const navRef = useRef<HTMLDivElement>(null); 

    // Efecto para cambiar el fondo de la navbar al hacer scroll
    // Effect to change navbar background on scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Efecto para cerrar el menú al hacer clic fuera
    // Effect to close the menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setExpanded(false);
            }
        };

        if (expanded) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [expanded]);

    const renderAuthenticatedLinks = () => (
        <>
            {user?.role === "user" && (
                <Nav.Item>
                    {/* Cierra el menú al hacer clic. */}
                    {/* Closes the menu on click. */}
                    <Nav.Link
                        as={NavLink}
                        to="/my-visits"
                        className={styles.navLink}
                        onClick={() => setExpanded(false)}>
                        Mis Visitas
                    </Nav.Link>
                </Nav.Item>
            )}
            {(user?.role === "manager" || user?.role === "admin") && (
                <>
                    <Nav.Item>
                        {/* Cierra el menú al hacer clic. */}
                        {/* Closes the menu on click. */}
                        <Nav.Link
                            as={NavLink}
                            to="/visits/manage"
                            className={styles.navLink}
                            onClick={() => setExpanded(false)}>
                            Visitas
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        {/* Cierra el menú al hacer clic. */}
                        {/* Closes the menu on click. */}
                        <Nav.Link
                            as={NavLink}
                            to="/users/manage"
                            className={styles.navLink}
                            onClick={() => setExpanded(false)}>
                            Usuarios
                        </Nav.Link>
                    </Nav.Item>
                </>
            )}
            {user?.role === "admin" && (
                <Nav.Item>
                    {/* Cierra el menú al hacer clic. */}
                    {/* Closes the menu on click. */}
                    <Nav.Link
                        as={NavLink}
                        to="/managers/manage"
                        className={styles.navLink}
                        onClick={() => setExpanded(false)}>
                        Managers
                    </Nav.Link>
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
                <NavDropdown.Item
                    onClick={() => {
                        navigate("/profile");
                        setExpanded(false);
                    }}>
                    <i className="bi bi-person-fill me-2"></i>Perfil ({user.first_name})
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                    onClick={() => {
                        logout();
                        setExpanded(false);
                    }}>
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                </NavDropdown.Item>
            </NavDropdown>
        );
    };

    return (
        // Componente principal de la barra de navegación.
        // Main navigation bar component.
        <Navbar
            ref={navRef} // Adjuntar la ref al componente Navbar // Attach the ref to the Navbar component
            fixed="top" // Fija la barra de navegación en la parte superior. // Fixes the navbar to the top.
            expand="lg" // Expande la barra de navegación en pantallas grandes y superiores. // Expands the navbar on large screens and above.
            expanded={expanded} // Controla el estado expandido/colapsado. // Controls expanded/collapsed state.
            onToggle={() => setExpanded((prev) => !prev)} // Maneja la alternancia del menú. // Handles menu toggling.
            className={clsx(
                styles.navbar,
                scrolled ? styles.navbarScrolled : styles.navbarTransparent
            )} // Aplica estilos dinámicos según el scroll. // Applies dynamic styles based on scroll.
        >
            {/* Contenedor principal de la barra de navegación. */}
            {/* Main container for the navigation bar. */}
            <Container className="d-flex align-items-center justify-content-between">
                {/* Mobile-only Avatar Link */}
                {token && user ? (
                    <Link
                        to="/profile"
                        className="d-lg-none d-flex align-items-center me-2"
                        onClick={() => setExpanded(false)}>
                        {/* Cierra el menú al hacer clic. */}
                        <Avatar
                            src={user.profile_picture}
                            firstName={user.first_name}
                            lastName={user.last_name}
                            className={styles.navAvatar} // Reuse existing navAvatar styling for size
                        />
                    </Link>
                ) : (
                    <div className="d-lg-none me-2" style={{ width: "40px" }}></div> // Placeholder for alignment
                )}

                {/* Marca de la aplicación (logo/nombre). */}
                {/* Application brand (logo/name). */}
                <Navbar.Brand
                    as={Link}
                    to="/"
                    onClick={() => setExpanded(false)}
                    className={clsx(styles.navbarBrand, "mx-auto", "mx-lg-0")}>
                    GymNomads
                </Navbar.Brand>

                {/* Botón de alternancia para el menú responsivo (hamburguesa). SVG de mancuerna animado. */}
                {/* Toggle button for responsive menu (hamburger). Animated dumbbell SVG. */}
                <Navbar.Toggle
                    aria-controls="responsive-navbar-nav"
                    className={clsx(styles.navbarToggle, "ms-auto")}>
                    {expanded ? (
                        // Icono de "cerrar" (X) cuando el menú está abierto
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            stroke="#FFB700" // Color primario
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeMiterlimit="10"
                            className={clsx(styles.dumbbellSvg, styles.isExpanded)} // Aplica clases CSS para animación
                        >
                            <g className={styles.iconGroup}>
                                <line x1="6" y1="6" x2="24" y2="24" />
                                <line x1="24" y1="6" x2="6" y2="24" />
                            </g>
                        </svg>
                    ) : (
                        // Icono de "pesas de gimnasio" cuando el menú está cerrado (Diseño mejorado)
                        // "Gym weights" icon when menu is closed (Improved design)
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            stroke="#FFB700" // Color primario
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeMiterlimit="10"
                            className={styles.dumbbellSvg} // Aplica clase CSS para animación
                        >
                            <g className={styles.iconGroup}>
                                {/* Barra superior - "Mancuerna" */}
                                {/* Superior bar - "Dumbbell" */}
                                <rect
                                    x="4"
                                    y="4"
                                    width="2"
                                    height="6"
                                    fill="#FFB700"
                                    stroke="none"
                                />
                                <line x1="6" y1="7" x2="24" y2="7" />
                                <rect
                                    x="24"
                                    y="4"
                                    width="2"
                                    height="6"
                                    fill="#FFB700"
                                    stroke="none"
                                />

                                {/* Barra del medio - más estrecha (Manillar central) */}
                                {/* Middle bar - narrower (Central handle) */}
                                <line x1="8" y1="15" x2="22" y2="15" strokeWidth="2.5" />

                                {/* Barra inferior - "Mancuerna" */}
                                {/* Lower bar - "Dumbbell" */}
                                <rect
                                    x="4"
                                    y="20"
                                    width="2"
                                    height="6"
                                    fill="#FFB700"
                                    stroke="none"
                                />
                                <line x1="6" y1="23" x2="24" y2="23" />
                                <rect
                                    x="24"
                                    y="20"
                                    width="2"
                                    height="6"
                                    fill="#FFB700"
                                    stroke="none"
                                />
                            </g>
                        </svg>
                    )}
                </Navbar.Toggle>
                {/* Contenido colapsable de la barra de navegación. */}
                {/* Collapsible content of the navigation bar. */}
                <Navbar.Collapse id="responsive-navbar-nav">
                    {/* Enlaces de navegación. */}
                    {/* Navigation links. */}
                    <Nav
                        className="ms-auto align-items-center"
                        onSelect={() => setExpanded(false)}>
                        {/* Enlace a la página de gimnasios. */}
                        {/* Link to gyms page. */}
                        <Nav.Item>
                            <Nav.Link
                                as={NavLink}
                                to="/gyms"
                                className={styles.navLink}
                                onClick={() => setExpanded(false)}>
                                Gimnasios
                            </Nav.Link>
                        </Nav.Item>

                        {/* Renderiza enlaces autenticados o de inicio de sesión/registro. */}
                        {/* Renders authenticated or login/register links. */}
                        {token && user ? (
                            <>
                                {/* Enlaces específicos para roles de usuario autenticado. */}
                                {/* Specific links for authenticated user roles. */}
                                {renderAuthenticatedLinks()}
                                {/* Dropdown del avatar (visible en desktop). */}
                                {/* Avatar dropdown (visible in desktop). */}
                                <Nav.Item className="d-none d-lg-block">
                                    {renderAvatarDropdown()}
                                </Nav.Item>
                            </>
                        ) : (
                            <>
                                {/* Enlace para iniciar sesión. */}
                                {/* Link to login. */}
                                <Nav.Item>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/login"
                                        className={styles.navLink}
                                        onClick={() => setExpanded(false)}>
                                        Login
                                    </Nav.Link>
                                </Nav.Item>
                                {/* Botón para registrarse. */}
                                {/* Button to register. */}
                                <Nav.Item>
                                    <Button
                                        onClick={() => {
                                            navigate("/register");
                                            setExpanded(false);
                                        }}
                                        variant="primary"
                                        size="sm"
                                        className="ms-lg-2">
                                        Regístrate
                                    </Button>
                                </Nav.Item>
                            </>
                        )}

                        {/* Links para menú hamburguesa en móvil */}
                        {/* Links for mobile hamburger menu */}
                        {token && user && (
                            <div className="d-lg-none mt-3 border-top pt-3">
                                <Nav.Link
                                    onClick={() => {
                                        navigate("/profile");
                                        setExpanded(false);
                                    }}
                                    className={styles.navLink}>
                                    <i className="bi bi-person-fill me-2"></i>Perfil
                                </Nav.Link>
                                <Nav.Link
                                    onClick={() => {
                                        logout();
                                        setExpanded(false);
                                    }}
                                    className={styles.navLink}>
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