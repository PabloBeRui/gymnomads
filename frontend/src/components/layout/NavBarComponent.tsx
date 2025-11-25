import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
    const navRef = useRef<HTMLDivElement>(null);

    // Conocer la ubicación para el renderizado condicional
    // Know the location for conditional rendering
    const location = useLocation();
    const isLandingPage = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    <Nav.Link as={NavLink} to="/my-visits" className={styles.navLink} onClick={() => setExpanded(false)}>
                        Mis Visitas
                    </Nav.Link>
                </Nav.Item>
            )}
            {(user?.role === "manager" || user?.role === "admin") && (
                <>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/visits/manage" className={styles.navLink} onClick={() => setExpanded(false)}>
                            Visitas
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/users/manage" className={styles.navLink} onClick={() => setExpanded(false)}>
                            Usuarios
                        </Nav.Link>
                    </Nav.Item>
                </>
            )}
            {user?.role === "admin" && (
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/managers/manage" className={styles.navLink} onClick={() => setExpanded(false)}>
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
                title={<Avatar src={user.profile_picture} firstName={user.first_name} lastName={user.last_name} className={styles.navAvatar} />}
                id="avatar-dropdown"
                align="end"
                className={styles.avatarDropdown}
                onClick={() => setExpanded(false)}
            >
                <NavDropdown.Item onClick={() => { navigate("/profile"); setExpanded(false); }}>
                    <i className="bi bi-person-fill me-2"></i>Perfil ({user.first_name})
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => { logout(); setExpanded(false); }}>
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                </NavDropdown.Item>
            </NavDropdown>
        );
    };

    // Renderiza el contenido del Navbar, reutilizable en ambos casos
    // Renders the Navbar content, reusable in both cases
    const navbarContent = (
        <Container className="d-flex align-items-center justify-content-between">
            {token && user ? (
                <Link to="/profile" className="d-lg-none d-flex align-items-center me-2" onClick={() => setExpanded(false)}>
                    <Avatar src={user.profile_picture} firstName={user.first_name} lastName={user.last_name} className={styles.navAvatar} />
                </Link>
            ) : (
                <div className="d-lg-none me-2" style={{ width: "40px" }}></div>
            )}
            <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)} className={clsx(styles.navbarBrand, "mx-auto", "mx-lg-0")}>
                <span>Gym</span><span className="text-light">Nomads</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" className={clsx(styles.navbarToggle, "ms-auto")}>
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
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="ms-auto align-items-center" onSelect={() => setExpanded(false)}>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/gyms" className={styles.navLink} onClick={() => setExpanded(false)}>
                            Gimnasios
                        </Nav.Link>
                    </Nav.Item>
                    {token && user ? (
                        <>
                            {renderAuthenticatedLinks()}
                            <Nav.Item className="d-none d-lg-block">{renderAvatarDropdown()}</Nav.Item>
                        </>
                    ) : (
                        <>
                            <Nav.Item>
                                <Nav.Link as={NavLink} to="/login" className={styles.navLink} onClick={() => setExpanded(false)}>
                                    Login
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Button onClick={() => { navigate("/register"); setExpanded(false); }} variant="primary" size="sm" className="ms-lg-2">
                                    Regístrate
                                </Button>
                            </Nav.Item>
                        </>
                    )}
                    {token && user && (
                        <div className="d-lg-none mt-3 border-top pt-3">
                            <Nav.Link onClick={() => { navigate("/profile"); setExpanded(false); }} className={styles.navLink}>
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
    );

    if (isLandingPage) {
        return (
            <Navbar
                ref={navRef}
                fixed="top"
                expand="lg"
                expanded={expanded}
                onToggle={() => setExpanded((prev) => !prev)}
                className={clsx(styles.navbar, scrolled ? styles.navbarScrolled : styles.navbarTransparent)}
            >
                {navbarContent}
            </Navbar>
        );
    }

    // Para todas las demás páginas, renderizar el Navbar con su propio fondo de video
    // For all other pages, render the Navbar with its own video background
    return (
        <div ref={navRef} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1030, height: 'auto' }}>
            <video autoPlay muted loop playsInline style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }}>
                <source src="/videos/landing_video_1.mp4" type="video/mp4" />
            </video>
            <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: -1, backgroundColor: 'rgba(26, 32, 44, 0.78)' }}></div>

            <Navbar
                expand="lg"
                expanded={expanded}
                onToggle={() => setExpanded((prev) => !prev)}
                className={clsx(styles.navbar, styles.navbarScrolled)} // Siempre 'scrolled' en esta versión
            >
                {navbarContent}
            </Navbar>
        </div>
    );
};