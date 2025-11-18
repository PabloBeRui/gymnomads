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
import { CloseButton } from '../ui/CloseButton';
import { Container } from 'react-bootstrap'; // Importar componentes de React-Bootstrap / Import React-Bootstrap components
import styles from './LegalPageLayout.module.scss'; // Importar el módulo SCSS / Import the SCSS module
import clsx from 'clsx'; // Importar clsx / Import clsx

// Interfaces de las props / Props interfaces
interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, children }) => {
  return (
    <Container className={clsx(styles.container, "my-4 p-4 bg-white rounded shadow-sm")}>
      <CloseButton navigateTo="/" />
      <h1 className={clsx(styles.title, "mb-4 text-center text-dark")}>{title}</h1>
      <div className={clsx(styles.content, "text-secondary")}>
        {children}
      </div>
    </Container>
  );
};
