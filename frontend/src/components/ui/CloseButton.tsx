/**
 * =============================================================================
 * COMPONENTE: CloseButton
 * COMPONENT: CloseButton
 * =============================================================================
 *
 * Botón de cierre reutilizable para modales y páginas.
 * Proporciona una "X" estilizada que permite al usuario cerrar una vista.
 * Su comportamiento es configurable:
 * - Si se proporciona `onClick`, ejecuta esa función (ideal para modales).
 * - Si se proporciona `navigateTo`, navega a la ruta especificada (ideal para páginas).
 * - Si no se proporciona ninguno, navega hacia atrás en el historial del navegador.
 * Refactorizado para usar SASS Modules.
 *
 * Reusable close button for modals and pages.
 * Provides a stylized "X" that allows the user to close a view.
 * Its behavior is configurable:
 * - If `onClick` is provided, it executes that function (ideal for modals).
 * - If `navigateTo` is provided, it navigates to the specified route (ideal for pages).
 * - If neither is provided, it navigates back in the browser history.
 * Refactored to use SASS Modules.
 *
 * =============================================================================
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CloseButton.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
   INTERFACES
   INTERFACES
   ============================================================================= */
interface CloseButtonProps {
  //  Función a ejecutar al hacer clic (para modales).
  //  Function to execute on click (for modals).
  onClick?: () => void;
  //  Ruta a la que navegar (para páginas).
  //  Route to navigate to (for pages).
  navigateTo?: string;
  //  Etiqueta de accesibilidad para el botón.
  //  Accessibility label for the button.
  ariaLabel?: string;
}

/* =============================================================================
   COMPONENTE: CloseButton
   COMPONENT: CloseButton
   ============================================================================= */
export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  navigateTo,
  ariaLabel = "Cerrar", // Valor por defecto / Default value
}) => {
  const navigate = useNavigate();

  // Español: Manejador de clic para el botón.
  // English: Click handler for the button.
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    } else {
      // Español: Comportamiento por defecto: ir hacia atrás en el historial del navegador.
      // English: Default behavior: go back in browser history.
      navigate(-1);
    }
  };

  return (
    <button
      className={clsx(styles.closeButton)}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      &times;
    </button>
  );
};
