/**
 * =============================================================================
 * COMPONENTE: InfoSlide
 * COMPONENT:  InfoSlide
 * =============================================================================
 *
 * Descripción: Componente reutilizable que representa una "diapositiva" de
 * pantalla completa para la landing page. Está diseñado para usarse con
 * scroll-snapping. Refactorizado con SASS Modules.
 *
 * Description: Reusable component representing a full-screen "slide"
 * for the landing page. Designed to be used with scroll-snapping.
 * Refactored with SASS Modules.
 *
 * Props:
 * - title: El título principal de la diapositiva. / The main title of the slide.
 * - text: El texto explicativo. / The explanatory text.
 * - backgroundColor: El color de fondo de la diapositiva. / The background color.
 * - children: (Opcional) Contenido extra, como un botón CTA. / (Optional) Extra content, like a CTA button.
 *
 * =============================================================================
 */

import React from "react";
import { Container } from "react-bootstrap"; // Importar componentes de React-Bootstrap / Import React-Bootstrap components
import styles from "./InfoSlide.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
    INTERFACES
    ============================================================================= */
interface InfoSlideProps {
  title: string;
  text: string;
  backgroundColor: string;
  children?: React.ReactNode; // Para el botón en la última slide / For the button on the last slide
}

/* =============================================================================
    COMPONENTE: InfoSlide
    COMPONENT:  InfoSlide
    ============================================================================= */
export const InfoSlide: React.FC<InfoSlideProps> = ({
  title,
  text,
  backgroundColor,
  children,
}) => {
  return (
    // Aplicar el color de fondo dinámicamente / Apply the background color dynamically
    <Container fluid className={clsx(styles.slide, "d-flex flex-column justify-content-center align-items-center p-4")} style={{ backgroundColor }}>
      <h2 className={clsx(styles.title, "text-dark")}>{title}</h2>
      <p className={clsx(styles.text, "text-secondary")}>{text}</p>

      {/* Renderizar contenido extra (como el botón CTA) si existe */}
      {/* Render extra content (like the CTA button) if it exists */}
      {children && <div className={styles.childrenContainer}>{children}</div>}
    </Container>
  );
};
