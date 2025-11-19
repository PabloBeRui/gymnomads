/**
 * =============================================================================
 * UTILIDADES: avatar-utils
 * UTILITIES: avatar-utils
 * =============================================================================
 *
 * Descripción: Funciones de utilidad para la generación de avatares,
 * incluyendo la extracción de iniciales y la asignación de colores consistentes
 * basados en una cadena de texto.
 *
 * Description: Utility functions for avatar generation,
 * including extracting initials and assigning consistent colors
 * based on a text string.
 *
 * =============================================================================
 */

// Obtener las iniciales de un nombre completo
// Get initials from full name
export const getInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName?.charAt(0).toUpperCase() || "";
  const lastInitial = lastName?.charAt(0).toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

// Generar un color consistente basado en un string (nombre)
// Generate a consistent color based on a string (name)
export const getColorFromString = (str: string): string => {
  // Lista de colores profesionales para avatares
  // List of professional colors for avatars
  const colors = [
    "#FF6B6B", // Rojo suave / Soft red
    "#4ECDC4", // Turquesa / Turquoise
    "#45B7D1", // Azul cielo / Sky blue
    "#FFA07A", // Salmón / Salmon
    "#98D8C8", // Verde menta / Mint green
    "#F7DC6F", // Amarillo / Yellow
    "#BB8FCE", // Púrpura / Purple
    "#85C1E2", // Azul claro / Light blue
    "#F8B739", // Naranja / Orange
    "#52B788", // Verde / Green
  ];

  // Algoritmo de hash simple para consistencia
  // Simple hash algorithm for consistency
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Seleccionar color basado en el hash
  // Select color based on hash
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};