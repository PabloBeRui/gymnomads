/**
 * =============================================================================
 * COMPONENTE: Spinner
 * COMPONENT: Spinner
 * =============================================================================
 *
 * Componente reutilizable para indicar estados de carga. Utiliza estilos de Bootstrap
 * y personalización con SCSS para ajustarse al tema de la aplicación.
 *
 * Reusable component to indicate loading states. Uses Bootstrap styles
 * and SCSS customization to fit the application theme.
 *
 * =============================================================================
 */

import React from "react";
import styles from "./Spinner.module.scss";

interface SpinnerProps {
  // Define si el spinner debe centrarse en el contenedor // Defines if the spinner should be centered in the container
  center?: boolean;
  // Define si el spinner debe ocupar toda la pantalla // Defines if the spinner should take up the full screen
  fullScreen?: boolean;
  // Tamaño opcional (sm, md, lg) // Optional size (sm, md, lg)
  size?: "sm" | "md" | "lg";
  // Clase adicional opcional para el contenedor // Optional additional class for the container
  className?: string;
  // Variante de color // Color variant
  variant?: "primary" | "light" | "dark";
}

const Spinner: React.FC<SpinnerProps> = ({
  center = false,
  fullScreen = false,
  size = "md",
  className = "",
  variant = "primary",
}) => {
  const wrapperClasses = `
    ${styles.spinnerWrapper} 
    ${center ? styles.center : ""} 
    ${fullScreen ? styles.fullScreen : ""}
    ${className}
  `.trim();

  const spinnerClasses = `
    spinner-border 
    ${styles.customSpinner}
    ${styles[size]}
    ${styles[variant]}
  `.trim();

  return (
    <div className={wrapperClasses} role="status">
      <div className={spinnerClasses}>
        <span className="visually-hidden">Cargando... / Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;
