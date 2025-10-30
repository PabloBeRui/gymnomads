/**
 * =============================================================================
 * UPLOAD HANDLER UTILITY
 * =============================================================================
 * 
 * Este módulo centraliza toda la lógica común para manejo de subida de imágenes.
 * Incluye validación de archivos, creación de previsualizaciones y formateo.
 * 
 * This module centralizes all common logic for image upload handling.
 * Includes file validation, preview creation, and formatting.
 * 
 * Casos de uso / Use cases:
 * - Validar imágenes de perfil de usuario / Validate user profile pictures
 * - Validar imágenes de gimnasios / Validate gym images
 * - Validar imágenes de reseñas / Validate review images
 * 
 * Beneficios / Benefits:
 * - DRY: Evita duplicación de código / Avoids code duplication
 * - Consistencia: Mismas reglas en toda la app / Same rules across the app
 * - Mantenibilidad: Cambios en un solo lugar / Changes in one place
 * =============================================================================
 */



/**
 * Configuración para validación de imágenes / Image validation configuration
 * 
 * Define los parámetros necesarios para validar archivos de imagen
 * Defines the necessary parameters to validate image files
 */

export interface ImageValidationConfig {
  // Tamaño máximo en MB / Maximum size in MB
  maxSizeMB: number;
  
  // Tipos MIME permitidos / Allowed MIME types
  allowedTypes: string[];
  
  // Mensajes de error personalizados (opcional) / Custom error messages (optional)
  errorMessages?: {
    invalidType?: string;
    maxSize?: string;
  };
}

/**
 * Resultado de la validación de imagen / Image validation result
 * 
 * Retorna si el archivo es válido y el error en caso contrario
 * Returns whether the file is valid and the error otherwise
 */
export interface ValidationResult {
  // Indica si el archivo pasó la validación / Indicates if the file passed validation
  isValid: boolean;
  
  // Mensaje de error si la validación falló / Error message if validation failed
  error?: string;
}



/**
 * Configuración por defecto para imágenes / Default configuration for images
 * 
 * Usa esta configuración si no se especifica una personalizada
 * Use this configuration if no custom one is specified
 */


export const DEFAULT_IMAGE_CONFIG: ImageValidationConfig = {
  maxSizeMB: 6,
  allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  errorMessages: {
    invalidType: "Por favor, selecciona una imagen válida (PNG, JPG, JPEG o WEBP)",
    maxSize: "La imagen no debe superar los {size}MB",
  },
};

/**
 * =============================================================================
 * FUNCIÓN: validateImageFile
 * =============================================================================
 * 
 * Valida que un archivo cumpla con los requisitos de tipo y tamaño.
 * Validates that a file meets the type and size requirements.
 * 
 * @param file - Archivo a validar / File to validate
 * @param config - Configuración de validación (opcional) / Validation config (optional)
 * @returns Resultado de la validación / Validation result
 * 
 * 
 * =============================================================================
 */

export const validateImageFile = (
  file: File,
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
): ValidationResult => {
  // Validar tipo de archivo / Validate file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: config.errorMessages?.invalidType || "Tipo de archivo no válido",
    };
  }

  // Validar tamaño máximo / Validate maximum size
  const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error:
        config.errorMessages?.maxSize?.replace("{size}", config.maxSizeMB.toString()) ||
        `El archivo no debe superar los ${config.maxSizeMB}MB`,
    };
  }

  // Archivo válido / Valid file
  return { isValid: true };
};

/**
 * =============================================================================
 * FUNCIÓN: createImagePreview
 * =============================================================================
 * 
 * Crea una URL de datos (data URL) para previsualizar la imagen antes de subirla.
 * Creates a data URL to preview the image before uploading it.
 * 
 * @param file - Archivo de imagen / Image file
 * @returns Promise con la URL de datos / Promise with the data URL
 * 
 * Ejemplo de uso / Usage example:
 * ```typescript
 * const preview = await createImagePreview(file);
 * setPreviewUrl(preview); // Mostrar en un <img src={preview} />
 * ```
 * 
 * !Nota: Esta función lee el archivo en el navegador, no lo sube al servidor.
 * !Note: This function reads the file in the browser, it doesn't upload it to the server.
 * =============================================================================
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Crear lector de archivos / Create file reader
    const reader = new FileReader();

    // Callback cuando termina de leer / Callback when reading is complete
    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    // Callback si hay error / Callback if there's an error
    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"));
    };

    // Leer archivo como Data URL / Read file as Data URL
    reader.readAsDataURL(file);
  });
};

/**
 * =============================================================================
 * FUNCIÓN: createImageFormData
 * =============================================================================
 * 
 * Crea un FormData listo para enviar al servidor con la imagen.
 * Creates a FormData ready to send to the server with the image.
 * 
 * @param file - Archivo de imagen / Image file
 * @param fieldName - Nombre del campo en el FormData (por defecto "image") / Field name in FormData (default "image")
 * @returns FormData con la imagen / FormData with the image
 * 
 *
 * 
 * =============================================================================
 */
export const createImageFormData = (file: File, fieldName: string = "image"): FormData => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
};

/**
 * =============================================================================
 * FUNCIÓN: formatFileSize
 * =============================================================================
 * 
 * Formatea el tamaño de un archivo en bytes a una unidad legible (B, KB, MB).
 * Formats a file size in bytes to a readable unit (B, KB, MB).
 * 
 * @param bytes - Tamaño en bytes / Size in bytes
 * @returns String formateado (ej: "2.5 MB") / Formatted string (e.g., "2.5 MB")
 * 
 * 
 * =============================================================================
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};