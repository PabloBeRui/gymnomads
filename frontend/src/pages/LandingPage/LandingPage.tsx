/**
 * =============================================================================
 * PÁGINA: LandingPage
 * PAGE:     LandingPage
 * =============================================================================
 *
 * Descripción: La página de inicio principal ("/") de la aplicación.
 * Actúa como un contenedor de pantalla completa con "scroll-snapping"
 * para guiar al usuario a través de una serie de diapositivas (slides).
 *
 * Description: The main landing page ("/") of the application.
 * Acts as a full-screen container with "scroll-snapping"
 * to guide the user through a series of slides.
 *
 * =============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSlide } from '../../components/landing/HeroSlide';
import { InfoSlide } from '../../components/landing/InfoSlide';

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  // 1. El contenedor principal para el scroll-snapping
  // 1. The main container for scroll-snapping
  pageContainer: {
    height: '100vh', // Ocupar la altura completa del viewport
    width: '100%',
    overflowY: 'scroll', // Permitir scroll vertical
    scrollSnapType: 'y mandatory', // La magia del snap vertical
  },
  
  // 2. Estilo para el botón CTA (Llamada a la Acción)
  // 2. Style for the CTA (Call to Action) button
  ctaButton: {
    padding: '12px 30px',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#007bff', // Color primario (configurable)
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform 0.2s, background-color 0.2s',
  },
  ctaButtonHover: {
    backgroundColor: '#0056b3',
    transform: 'scale(1.05)',
  }
};

/* =============================================================================
    COMPONENTE: LandingPage
    COMPONENT:  LandingPage
    ============================================================================= */
export const LandingPage: React.FC = () => {
  return (
    <div style={styles.pageContainer}>
      
      {/* Slide 1: El Héroe con la animación */}
      {/* Slide 1: The Hero with the animation */}
      <HeroSlide />

      {/* Slide 2: "Viaja" */}
      {/* Slide 2: "Travel" */}
      <InfoSlide
        title="Viaja"
        text="Explora cientos de gimnasios en toda España. Ya sea por trabajo o placer, tu próximo entrenamiento está a solo un clic de distancia."
        backgroundColor="#f8f9fa" // Un gris muy claro
      />

      {/* Slide 3: "Entrena" */}
      {/* Slide 3: "Train" */}
      <InfoSlide
        title="Entrena"
        text="Accede a instalaciones de calidad sin pagar pases de día. Tu abono en un gimnasio de la red es tu pase para todos."
        backgroundColor="#e9ecef" // Un gris un poco más oscuro
      />

      {/* Slide 4: "Repite" (con el botón CTA) */}
      {/* Slide 4: "Repeat" (with the CTA button) */}
      <InfoSlide
        title="Repite"
        text="Mantén tu rutina. Haz crecer la comunidad. Conviértete en un auténtico GymNomad."
        backgroundColor="#dee2e6" // Gris final
      >
        {/* La Llamada a la Acción (CTA) */}
        {/* The Call to Action (CTA) */}
        <Link
          to="/gyms" // Enlace a la página de listado de gimnasios
          style={styles.ctaButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = styles.ctaButtonHover.backgroundColor || '';
            e.currentTarget.style.transform = styles.ctaButtonHover.transform || '';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = styles.ctaButton.backgroundColor || '';
            e.currentTarget.style.transform = '';
          }}
        >
          Explorar Gimnasios
        </Link>
      </InfoSlide>

    </div>
  );
};