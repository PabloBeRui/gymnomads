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

import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap"; // Importar componentes de React-Bootstrap / Import React-Bootstrap components
import styles from "./InfoSlide.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
    INTERFACES
    ============================================================================= */
interface InfoSlideProps {
  title: string;
  text: string;
  backgroundColor?: string; // Hacer que el color de fondo sea opcional / Make background color optional
  backgroundImage?: string; // Ruta de la imagen de fondo / Background image path
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
  backgroundImage,
  children,
}) => {
  // Refs y Estados para la animación
  // Refs and States for animation
  const slideRef = useRef<HTMLDivElement>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const currentSlideRef = slideRef.current; // Capturar el valor actual del ref // Capture the current ref value

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Cuando el slide es visible al 50%
          // When the slide is 50% visible
          if (entry.isIntersecting) {
            // Esperar 500ms para iniciar la animación (similar a HeroSlide)
            // Wait 500ms to start animation (similar a HeroSlide)
            setTimeout(() => {
              setIsAnimated(true);
            }, 500);

            // Desconectar el observador para que solo anime una vez
            // Disconnect observer so it only animates once
            if (currentSlideRef) {
              // Usar el valor capturado // Use the captured value
              observer.unobserve(currentSlideRef);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (currentSlideRef) {
      // Usar el valor capturado // Use the captured value
      observer.observe(currentSlideRef);
    }

    return () => {
      if (currentSlideRef) {
        // Usar el valor capturado // Use the captured value
        observer.unobserve(currentSlideRef);
      }
    };
  }, []);

  // Estilos dinámicos para el contenedor / Dynamic styles for the container
  const containerStyle: React.CSSProperties = {
    backgroundColor: !backgroundImage ? backgroundColor : "transparent", // Usar color si no hay imagen
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
    backgroundSize: backgroundImage ? "cover" : "auto",
    backgroundPosition: backgroundImage ? "center" : "auto",
    backgroundRepeat: backgroundImage ? "no-repeat" : "initial",
    position: "relative", // Necesario para posicionar el overlay / Needed for overlay positioning
  };

  return (
    // Aplicar los estilos dinámicamente / Apply dynamic styles
    <Container
      fluid
      className={clsx(
        styles.slide,
        "d-flex flex-column justify-content-center align-items-center p-4"
      )}
      style={containerStyle}
      ref={slideRef} // Asignar ref al contenedor / Assign ref to container
    >
      {backgroundImage && <div className={styles.backgroundOverlay}></div>}{" "}
      {/* Overlay para legibilidad */}
      <div className={styles.contentWrapper}>
        {" "}
        {/* Wrapper para el contenido */}
        <h2
          className={clsx(styles.title, {
            [styles.titleAnimated]: isAnimated,
          })}>
          {title}
        </h2>{" "}
        {/* Título animado / Animated title */}
        <p className={clsx(styles.text, "text-light")}>{text}</p>{" "}
        {/* Cambiar a text-light para contraste */}
        {/* Renderizar contenido extra (como el botón CTA) si existe */}
        {/* Render extra content (like the CTA button) if it exists */}
        {children && <div className={styles.childrenContainer}>{children}</div>}
      </div>
    </Container>
  );
};
