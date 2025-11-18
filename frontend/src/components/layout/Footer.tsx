/**
 * =============================================================================
 * COMPONENTE: Footer
 * COMPONENT: Footer
 * =============================================================================
 *
 * Componente de pie de página reutilizable para toda la aplicación.
 * Muestra información de la empresa, enlaces de navegación, perfiles de redes
 * sociales y el aviso de derechos de autor. Está dividido en varias columnas
 * para una mejor organización del contenido. Refactorizado con SASS Modules.
 *
 * Reusable footer component for the entire application.
 * Displays company information, navigation links, social media profiles, and
 * the copyright notice. It is divided into several columns for better content
 * organization. Refactored with SASS Modules.
 *
 * =============================================================================
 */

import React from "react";
import { FaGithub, FaWhatsapp, FaMicrosoft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap"; // Importar componentes de React-Bootstrap / Import React-Bootstrap components
import styles from "./Footer.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

const Footer: React.FC = () => {
  //WHATSAPP
  // 1. Definir el mensaje de texto / Define the text message
  const whatsappMessage =
    "Hola, he visto tu proyecto GymNomads y me gustaría contactar contigo.";

  // 2. Codificar el mensaje para la URL / Encode the message for the URL
  const encodedMessage = encodeURIComponent(whatsappMessage);

  // 3. Crear el enlace completo / Create the full link
  const whatsappLink = `https://wa.me/34670025720?text=${encodedMessage}`;

  return (
    <footer className={styles.footer}>
      <Container className={styles.columnsContainer}>
        <Row className="justify-content-around w-100">
          {/* Columna: Sobre Nosotros / Column: About Us */}
          <Col xs={12} md={4} lg={3} className={styles.column}>
            <h3 className={styles.title}>Sobre Nosotros</h3>
            <Link to="/about-us" className={styles.link}>
              Quiénes somos
            </Link>
            <Link to="/faq" className={styles.link}>
              Preguntas Frecuentes
            </Link>
            <Link to="/join" className={styles.link}>
              Únete a Gymnomads
            </Link>
          </Col>

          {/* Columna: Legal / Column: Legal */}
          <Col xs={12} md={4} lg={3} className={styles.column}>
            <h3 className={styles.title}>Páginas Legales</h3>
            <Link to="/privacy-policy" className={styles.link}>
              Política de privacidad
            </Link>
            <Link to="/terms-conditions" className={styles.link}>
              Términos y condiciones
            </Link>
            <Link to="/cookies-policy" className={styles.link}>
              Política de Cookies
            </Link>
            <Link to="/legal-notice" className={styles.link}>
              Aviso Legal
            </Link>
          </Col>

          {/* Columna: Contacto / Column: Contact */}
          <Col xs={12} md={4} lg={3} className={styles.column}>
            <h3 className={styles.title}>Contacto</h3>
            <div className={styles.socialContainer}>
              <a
                href="https://github.com/PabloBeRui"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(styles.link, styles.socialIcon)}
                aria-label="Perfil de GitHub">
                <FaGithub />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(styles.link, styles.socialIcon)}
                aria-label="Contactar por WhatsApp">
                <FaWhatsapp />
              </a>
              <a
                href="msteams:l/chat/0/0?users=pablo.bellon.ruibal@gmail.com"
                className={clsx(styles.link, styles.socialIcon)}
                aria-label="Contactar por Microsoft Teams">
                <FaMicrosoft />
              </a>
            </div>
          </Col>
        </Row>
      </Container>

      <div className={styles.copyright}>
        <a
          href="https://github.com/PabloBeRui"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}>
          © pablobellon 2025
        </a>
      </div>
    </footer>
  );
};

export default Footer;
