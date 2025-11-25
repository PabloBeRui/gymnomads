/**
 * =============================================================================
 * COMPONENTE: PageTransition
 * COMPONENT: PageTransition
 * =============================================================================
 *
 * Descripción: Un componente wrapper que proporciona transiciones de página
 * suaves (fade-in/fade-out) utilizando Framer Motion. Envuelve cada página
 * para una experiencia de usuario más fluida al navegar.
 *
 * Description: A wrapper component that provides smooth page transitions
 * (fade-in/fade-out) using Framer Motion. It wraps each page for a more
 * fluid user experience when navigating.
 *
 * =============================================================================
 */
import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode; // Contenido de la página a animar // Page content to animate
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }} // Estado inicial: completamente transparente // Initial state: fully transparent
      animate={{ opacity: 1 }} // Estado animado: completamente visible // Animated state: fully visible
      exit={{ opacity: 0 }}    // Estado de salida: completamente transparente // Exit state: fully transparent
      transition={{ duration: 0.3 }} // Duración de la transición de 0.3 segundos // Transition duration of 0.3 seconds
      style={{ width: '100%', height: '100%' }} // Asegurar que ocupa todo el espacio // Ensure it takes full space
    >
      {children}
    </motion.div>
  );
};
