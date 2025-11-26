/**
 * =============================================================================
 * COMPONENTE: ScrollToTop
 * COMPONENT:  ScrollToTop
 * =============================================================================
 *
 * Descripción: Componente utilitario que desplaza la ventana hacia arriba
 * automáticamente cada vez que cambia la ruta (pathname).
 *
 * Description: Utility component that scrolls the window to the top
 * automatically whenever the route (pathname) changes.
 *
 * =============================================================================
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Obtener la ubicación actual (ruta)
  // Get the current location (route)
  const { pathname } = useLocation();

  useEffect(() => {
    // Intentar desplazar inmediatamente
    // Try to scroll immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);

    // Asegurar el desplazamiento después de un breve retraso para anular la restauración del navegador
    // Ensure scrolling after a short delay to override browser restoration
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // Usar 'instant' para evitar conflictos visuales / Use 'instant' to avoid visual conflicts
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100); // Aumentado a 100ms para mayor seguridad

    return () => clearTimeout(timer);
  }, [pathname]); // Se ejecuta cada vez que cambia el pathname // Runs every time the pathname changes

  return null; // Este componente no renderiza nada visual // This component renders nothing visual
};

export default ScrollToTop;
