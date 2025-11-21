/**
 * =============================================================================
 * COMPONENTE: Footer
 * COMPONENT:  Footer
 * =============================================================================
 *
 * Descripción: Pie de página de la aplicación con un efecto de desenfoque 
 * semitransparente. Muestra enlaces de navegación, perfiles sociales y copyright.
 *
 * Description: Application footer with a semi-transparent blur effect.
 * Displays navigation links, social profiles, and copyright information.
 *
 * =============================================================================
 */
import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import styles from "./Footer.module.scss";
import clsx from "clsx";

export const Footer: React.FC = () => {
  const whatsappMessage = "Hola, he visto tu proyecto GymNomads y me gustaría contactar contigo.";
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappLink = `https://wa.me/34670025720?text=${encodedMessage}`;

  return (
    <footer className={styles.footer}>
      <Container className={styles.columnsContainer}>
        <Row className="justify-content-center">
          {/* Columna: Sobre Nosotros */}
          <Col xs={12} md={4} lg={3} className={clsx(styles.column, "text-center")}>
            <h5 className={styles.title}>Sobre Nosotros</h5>
            <Link to="/about-us" className={styles.link}>Quiénes somos</Link>
            <Link to="/faq" className={styles.link}>Preguntas Frecuentes</Link>
            <Link to="/join" className={styles.link}>Únete a Gymnomads</Link>
          </Col>

          {/* Columna: Legal */}
          <Col xs={12} md={4} lg={3} className={clsx(styles.column, "text-center")}>
            <h5 className={styles.title}>Páginas Legales</h5>
            <Link to="/privacy-policy" className={styles.link}>Política de privacidad</Link>
            <Link to="/terms-conditions" className={styles.link}>Términos y condiciones</Link>
            <Link to="/cookies-policy" className={styles.link}>Política de Cookies</Link>
            <Link to="/legal-notice" className={styles.link}>Aviso Legal</Link>
          </Col>

          {/* Columna: Contacto */}
          <Col xs={12} md={4} lg={3} className={clsx(styles.column, "text-center")}>
            <h5 className={styles.title}>Contacto</h5>
            <div className={styles.socialContainer}>
              <a href="https://github.com/PabloBeRui" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Perfil de GitHub">
                <i className="bi bi-github"></i>
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Contactar por WhatsApp">
                <i className="bi bi-whatsapp"></i>
              </a>
              <a href="msteams:l/chat/0/0?users=pablo.bellon.ruibal@gmail.com" className={styles.socialIcon} aria-label="Contactar por Microsoft Teams">
                <i className="bi bi-microsoft-teams"></i>
              </a>
            </div>
          </Col>
        </Row>
      </Container>

      <Container>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} GymNomads. Diseñado por{" "}
          <a href="https://github.com/PabloBeRui" target="_blank" rel="noopener noreferrer">
            pablobellon
          </a>.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;