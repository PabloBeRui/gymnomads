/**
 * =============================================================================
 * COMPONENTE: LegalPageLayout
 * COMPONENT: LegalPageLayout
 * =============================================================================
 *
 * Layout reutilizable para las páginas de contenido legal (ej. Política de
 * Privacidad, Términos y Condiciones).
 * Proporciona una estructura y estilo consistentes para estas páginas.
 * Refactorizado con SASS Modules.
 *
 * Reusable layout for legal content pages (e.g., Privacy Policy, Terms and
 * Conditions).
 * It provides a consistent structure and style for these pages.
 * Refactored with SASS Modules.
 *
 * =============================================================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate // Import useNavigate
import { CloseButton } from '../ui/CloseButton';
import { Container } from 'react-bootstrap'; // Importar componentes de React-Bootstrap / Import React-Bootstrap components
import styles from './LegalPageLayout.module.scss'; // Importar el módulo SCSS / Import the SCSS module
import clsx from 'clsx'; // Importar clsx / Import clsx

// Interfaces de las props / Props interfaces
interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
  closeButtonTopOffset?: string; // Nueva prop // New prop
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, children, closeButtonTopOffset }) => {
  const navigate = useNavigate(); // Inicializar useNavigate // Initialize useNavigate

  const handleClose = () => {
    navigate(-1); // Navegar hacia atrás en el historial // Navigate back in history
  };

  const closeButtonStyle: React.CSSProperties = closeButtonTopOffset ? { top: closeButtonTopOffset } : {}; // Estilo dinámico // Dynamic style

  // Manejador para clics en el fondo (wrapper)
  // Handler for background clicks (wrapper)
  const handleWrapperClick = () => {
    handleClose();
  };

  // Detener la propagación del clic dentro del contenedor para evitar cierre accidental
  // Stop click propagation inside the container to prevent accidental closing
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.wrapper} onClick={handleWrapperClick}>
      <Container 
        className={clsx(styles.container, "bg-white rounded shadow-sm")} // Eliminamos márgenes bootstrap (my-4) ya que los maneja el SCSS // Removed bootstrap margins (my-4) as SCSS handles them
        onClick={handleContainerClick}
      >
        <CloseButton
          onClick={handleClose}
          className={styles.closeButton}
          style={closeButtonStyle} // Aplicar estilo dinámico // Apply dynamic style
          color="#FFB700" // Color primario del proyecto // Project's primary color
          ariaLabel="Cerrar página legal"
        />
        <h1 className={clsx(styles.title, "mb-4 text-center text-dark")} dangerouslySetInnerHTML={{ __html: title }}></h1>
        <div className={clsx(styles.content, "text-dark")}>
          {children}
        </div>
      </Container>
    </div>
  );
};