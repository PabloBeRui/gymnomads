/**
 * =============================================================================
 * COMPONENTE: LegalPageLayout
 * COMPONENT: LegalPageLayout
 * =============================================================================
 *
 * Layout reutilizable para las páginas de contenido legal (ej. Política de
 * Privacidad, Términos y Condiciones).
 * Proporciona una estructura y estilo consistentes para estas páginas.
 *
 * Reusable layout for legal content pages (e.g., Privacy Policy, Terms and
 * Conditions).
 * It provides a consistent structure and style for these pages.
 *
 * =============================================================================
 */

import React from 'react';
import { CloseButton } from '../ui/CloseButton';

// Interfaces de las props // Props interfaces
interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

// Estilos para el layout // Styles for the layout
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative', // Necesario para el posicionamiento absoluto del CloseButton // Needed for absolute positioning of CloseButton
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem 4rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lineHeight: '1.6',
  },
  title: {
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#1a202c',
  },
  content: {
    color: '#4a5568',
  },
};

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, children }) => {
  return (
    <div style={styles.container}>
      <CloseButton navigateTo="/" />
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};
