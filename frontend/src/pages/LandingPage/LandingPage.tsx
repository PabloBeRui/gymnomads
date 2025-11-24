import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSlide } from '../../components/landing/HeroSlide';
import { InfoSlide } from '../../components/landing/InfoSlide';

// Importar el módulo SCSS / Import the SCSS module
import styles from "./LandingPage.module.scss";
// import clsx from "clsx"; // Importar clsx / Import clsx

/**
 * =============================================================================
 * PÁGINA: LandingPage
 * PAGE:     LandingPage
 * =============================================================================
 *
 * Descripción: La página de inicio principal ("/") de la aplicación.
 * Actúa como un contenedor de pantalla completa con "scroll-snapping"
 * para guiar al usuario a través de una serie de diapositivas (slides).
 * Refactorizado para usar SASS Modules.
 *
 * Description: The main landing page ("/") of the application.
 * Acts as a full-screen container with "scroll-snapping"
 * to guide the user through a series of slides.
 * Refactored to use SASS Modules.
 *
 * =============================================================================
 */


export const LandingPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.scrollContainer}>
        {/* Slide 1: El Héroe con la animación */}
        {/* Slide 1: The Hero with the animation */}
        <HeroSlide />

        {/* Slide 2: "Viaja" */}
        {/* Slide 2: "Travel" */}
        <InfoSlide
          title="Viaja"
          text="Explora cientos de gimnasios en toda España. Ya sea por trabajo o placer, tu próximo entrenamiento está a solo un clic de distancia."
          backgroundImage="/images/info-slide/slide-background-viaja.png"
        >
          <Link to="/gyms" className={styles.ctaButton}>
            Explorar Gimnasios
          </Link>
        </InfoSlide>

        {/* Slide 3: "Entrena" */}
        {/* Slide 3: "Train" */}
        <InfoSlide
          title="Entrena"
          text="Accede a instalaciones de calidad sin pagar pases de día. Tu abono en un gimnasio de la red es tu pase para todos."
          backgroundImage="/images/info-slide/slide-background-entrena.png"
        >
          <Link to="/about-us" className={styles.ctaButton}>
            Quiénes somos
          </Link>
        </InfoSlide>

        {/* Slide 4: "Repite" */}
        {/* Slide 4: "Repeat" */}
        <InfoSlide
          title="Repite"
          text="Mantén tu rutina. Haz crecer la comunidad. Conviértete en un auténtico GymNomad."
          backgroundImage="/images/info-slide/slide-background-repite.png"
        >
          <Link to="/join" className={styles.ctaButton}>
            Únete a Gymnomads
          </Link>
        </InfoSlide>
      </div>
    </div>
  );
};
