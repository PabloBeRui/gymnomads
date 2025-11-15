/**
 * =============================================================================
 * COMPONENTE: Footer
 * COMPONENT: Footer
 * =============================================================================
 *
 * Componente de pie de página reutilizable para toda la aplicación.
 * Muestra información de la empresa, enlaces de navegación, perfiles de redes
 * sociales y el aviso de derechos de autor. Está dividido en varias columnas
 * para una mejor organización del contenido.
 *
 * Reusable footer component for the entire application.
 * Displays company information, navigation links, social media profiles, and
 * the copyright notice. It is divided into several columns for better content
 * organization.
 *
 * =============================================================================
 */

import React from 'react';
import { FaGithub, FaWhatsapp, FaMicrosoft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  // Estilos para el contenedor principal del footer. // Styles for the main footer container.
  const footerStyle: React.CSSProperties = {
    backgroundColor: '#1a202c', // Un gris oscuro y moderno // A dark, modern gray
    color: '#e2e8f0', // Un color de texto claro que contrasta bien // A light text color that contrasts well
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  };

  // Estilos para el contenedor de las columnas de enlaces. // Styles for the link columns container.
  const columnsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '2rem',
  };

  // Estilos para cada columna individual. // Styles for each individual column.
  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
    marginBottom: '2rem',
  };

  // Estilos para los títulos de las columnas. // Styles for the column titles.
  const titleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#a0aec0', // Un color de acento sutil // A subtle accent color
    textTransform: 'uppercase',
  };

  // Estilos para los enlaces del footer. // Styles for the footer links.
  const linkStyle: React.CSSProperties = {
    color: '#e2e8f0',
    textDecoration: 'none',
    marginBottom: '0.5rem',
    transition: 'color 0.3s ease',
  };

  // Estilos para la sección de redes sociales. // Styles for the social media section.
  const socialContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  // Estilos para los iconos de redes sociales. // Styles for the social media icons.
  const socialIconStyle: React.CSSProperties = {
    fontSize: '2rem',
    transition: 'transform 0.3s ease',
  };

  // Estilos para la sección de derechos de autor. // Styles for the copyright section.
  const copyrightStyle: React.CSSProperties = {
    borderTop: '1px solid #4a5568',
    paddingTop: '1.5rem',
    width: '100%',
    maxWidth: '1200px',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#a0aec0',
  };

  return (
    <footer style={footerStyle}>
      <div style={columnsContainerStyle}>
        {/* Columna: Sobre Nosotros */}
        <div style={columnStyle}>
          <h3 style={titleStyle}>Sobre Nosotros</h3>
          <Link to="/about-us" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color='#ffffff'} onMouseOut={(e) => e.currentTarget.style.color='#e2e8f0'}>Quiénes somos</Link>
          <Link to="/faq" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color='#ffffff'} onMouseOut={(e) => e.currentTarget.style.color='#e2e8f0'}>Preguntas Frecuentes</Link>
          <Link to="/join" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color='#ffffff'} onMouseOut={(e) => e.currentTarget.style.color='#e2e8f0'}>Únete a Gymnomads</Link>
        </div>

        {/* Columna: Legal */}
        <div style={columnStyle}>
          <h3 style={titleStyle}>Páginas Legales</h3>
          <Link to="/privacy-policy" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color='#ffffff'} onMouseOut={(e) => e.currentTarget.style.color='#e2e8f0'}>Política de privacidad</Link>
          <Link to="/terms-conditions" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color='#ffffff'} onMouseOut={(e) => e.currentTarget.style.color='#e2e8f0'}>Términos y condiciones</Link>
          <Link to="/cookies-policy" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color='#ffffff'} onMouseOut={(e) => e.currentTarget.style.color='#e2e8f0'}>Política de Cookies</Link>
          <Link to="/legal-notice" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color='#ffffff'} onMouseOut={(e) => e.currentTarget.style.color='#e2e8f0'}>Aviso Legal</Link>
        </div>

        {/* Columna: Contacto */}
        <div style={columnStyle}>
          <h3 style={titleStyle}>Contacto</h3>
          <div style={socialContainerStyle}>
            <a href="https://github.com/PabloBeRui" target="_blank" rel="noopener noreferrer" style={{...linkStyle, ...socialIconStyle}} onMouseOver={(e) => e.currentTarget.style.transform='scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'}>
              <FaGithub />
            </a>
            <a href="https://wa.me/34670025720" target="_blank" rel="noopener noreferrer" style={{...linkStyle, ...socialIconStyle}} onMouseOver={(e) => e.currentTarget.style.transform='scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'}>
              <FaWhatsapp />
            </a>
            <a href="msteams:l/chat/0/0?users=pablo.bellon.ruibal@gmail.com" style={{...linkStyle, ...socialIconStyle}} onMouseOver={(e) => e.currentTarget.style.transform='scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'}>
              <FaMicrosoft />
            </a>
          </div>
        </div>
      </div>

      <div style={copyrightStyle}>
        <a href="https://github.com/PabloBeRui" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color='#ffffff'} onMouseOut={(e) => e.currentTarget.style.color='#a0aec0'}>
          © pablobellon 2025
        </a>
      </div>
    </footer>
  );
};

export default Footer;
