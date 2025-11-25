/**
 * =============================================================================
 * COMPONENT: ImageUploadPreview
 * =============================================================================
 *
 * Componente reutilizable para mostrar preview de imágenes antes de subirlas.
 * Refactorizado para usar SASS Modules.
 *
 * Reusable component to show image previews before uploading.
 * Refactored to use SASS Modules.
 *
 * Características / Features:
 * - Muestra imagen de preview o imagen por defecto / Shows preview or default image
 * - Soporta forma circular o cuadrada / Supports circular or square shape
 * - Tamaño configurable / Configurable size
 * - Clickable para abrir selector de archivos / Clickable to open file picker
 * - Borde punteado para indicar área clickeable / Dashed border to indicate clickable area
 * - Efecto hover para mejor UX / Hover effect for better UX
 * - Accesible con teclado / Keyboard accessible
 *
 * Casos de uso / Use cases:
 * - Preview de foto de perfil (circular) / Profile picture preview (circular)
 * - Preview de imagen de gimnasio (cuadrada) / Gym image preview (square)
 * - Preview de imagen de reseña (cuadrada) / Review image preview (square)
 * =============================================================================
 */

import React from "react";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./ImageUploadPreview.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx

/**
 * =============================================================================
 * INTERFAZ: ImageUploadPreviewProps
 * =============================================================================
 *
 * Propiedades del componente / Component properties
 * =============================================================================
 */
export interface ImageUploadPreviewProps {
  // URL de la imagen a mostrar (null = usar defaultImage) / Image URL to display (null = use defaultImage)
  previewUrl: string | null;

  // Imagen por defecto si no hay preview / Default image if no preview
  defaultImage: string;

  // Función a ejecutar al hacer click (opcional) / Function to execute on click (optional)
  onClick?: () => void;

  // Texto alternativo para accesibilidad / Alternative text for accessibility
  altText: string;

  // Forma de la imagen / Image shape
  shape?: "circle" | "square";

  // Tamaño de la imagen en píxeles / Image size in pixels
  size?: number;

  // Mostrar texto de ayuda / Show help text
  showHelpText?: boolean;

  // Texto de ayuda personalizado / Custom help text
  helpText?: string;

  // Estilos adicionales personalizados / Additional custom styles
  style?: React.CSSProperties;
}

/**
 * =============================================================================
 * COMPONENTE: ImageUploadPreview
 * =============================================================================
 *
 * Renderiza una previsualización de imagen con opciones de personalización.
 * Renders an image preview with customization options.
 *
 * @param props - Propiedades del componente / Component properties
 * @returns Elemento JSX / JSX Element
 * =============================================================================
 */
export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  previewUrl,
  defaultImage,
  onClick,
  altText,
  shape = "square",
  size = 200,
  showHelpText = false,
  helpText = "Haz clic para seleccionar una imagen",
  style,
}) => {
  // --- Determinar URL a mostrar / Determine URL to display ---
  const imageUrl = previewUrl || defaultImage;

  // --- Renderizado / Rendering ---

  return (
    <div className={styles.container} style={style}>
      <img
        src={imageUrl}
        alt={altText}
        className={clsx(styles.image, styles[shape], {
          [styles.clickable]: onClick,
        })}
        style={{ width: `${size}px`, height: `${size}px` }}
        onClick={onClick}
      />
      {showHelpText && <p className={clsx(styles.helpText, 'text-primary')}>{helpText}</p>}
    </div>
  );
};