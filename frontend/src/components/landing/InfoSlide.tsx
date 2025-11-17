/**
 * =============================================================================
 * COMPONENTE: InfoSlide
 * COMPONENT:  InfoSlide
 * =============================================================================
 *
 * Descripción: Componente reutilizable que representa una "diapositiva" de
 * pantalla completa para la landing page. Está diseñado para usarse con
 * scroll-snapping.
 *
 * Description: Reusable component representing a full-screen "slide"
 * for the landing page. Designed to be used with scroll-snapping.
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

/* =============================================================================
    INTERFACES
    ============================================================================= */
interface InfoSlideProps {
  title: string;
  text: string;
  backgroundColor: string;
  children?: React.ReactNode; // Para el botón en la última slide
}

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  slide: {
    height: "100vh", // Ocupar toda la altura del viewport
    width: "100%",
    scrollSnapAlign: "start", // Clave para el scroll-snapping
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    boxSizing: "border-box", // Asegurar que el padding no desborde
    textAlign: "center",
    transition: "background-color 0.5s ease", // Transición suave de color
  },
  title: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)", // Tamaño de fuente responsive
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#222", // Color de texto oscuro por defecto
  },
  text: {
    fontSize: "clamp(1rem, 2.5vw, 1.25rem)", // Tamaño de fuente responsive
    color: "#444",
    maxWidth: "600px",
    lineHeight: 1.6,
  },
  // Estilo para el contenedor del botón (opcional)
  // Style for the (optional) button container
  childrenContainer: {
    marginTop: "2.5rem",
  },
};

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
    // Aplicar el color de fondo dinámicamente
    // Apply the background color dynamically
    <div style={{ ...styles.slide, backgroundColor }}>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.text}>{text}</p>

      {/* Renderizar contenido extra (como el botón CTA) si existe */}
      {/* Render extra content (like the CTA button) if it exists */}
      {children && <div style={styles.childrenContainer}>{children}</div>}
    </div>
  );
};
