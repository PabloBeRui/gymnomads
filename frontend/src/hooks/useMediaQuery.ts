/**
 * =============================================================================
 * HOOK: useMediaQuery
 * =============================================================================
 *
 * Descripción: Un hook personalizado de React que detecta si el tamaño de la
 * ventana del navegador coincide con una media query de CSS específica.
 *
 * Description: A custom React hook that tracks whether the browser window
 * size matches a specific CSS media query.
 *
 * =============================================================================
 */
import { useState, useEffect } from 'react';

/**
 * Hook para detectar si se cumple una media query.
 * Hook to detect if a media query is met.
 * @param query - La cadena de la media query (p. ej., '(min-width: 768px)')
 * @returns `true` si la media query coincide, `false` en caso contrario.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    // Crear el objeto media query list
    // Create the media query list object
    const mediaQueryList = window.matchMedia(query);

    // Función para actualizar el estado cuando cambie la media query
    // Function to update state when the media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Añadir el listener
    // Add the listener
    mediaQueryList.addEventListener('change', handleChange);

    // Limpiar el listener al desmontar el componente
    // Clean up the listener on component unmount
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]); // Volver a ejecutar solo si la query cambia // Re-run only if the query changes

  return matches;
};
