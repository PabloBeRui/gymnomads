/**
 * =============================================================================
 * CUSTOM HOOK: useImageUpload
 * =============================================================================
 *
 * Hook genérico para manejar la selección y previsualización de imágenes.
 * Generic hook to handle image selection and preview.
 *
 * Este hook encapsula toda la lógica necesaria para:
 * This hook encapsulates all the necessary logic to:
 * - Validar archivos de imagen / Validate image files
 * - Crear previsualizaciones / Create previews
 * - Manejar la selección de archivos / Handle file selection
 * - Resetear la selección / Reset the selection
 *
 * Beneficios / Benefits:
 * - Reutilizable en múltiples páginas / Reusable across multiple pages
 * - Validación consistente / Consistent validation
 * - Código limpio y mantenible / Clean and maintainable code
 *
 * Casos de uso / Use cases:
 * - Subir foto de perfil / Upload profile picture
 * - Subir imagen de gimnasio / Upload gym image
 * - Subir imagen de reseña / Upload review image
 * =============================================================================
 */

// Importar hooks de React / Import React hooks
import { useState, useRef } from "react";

// Importar notificaciones / Import notifications
import { toast } from "sonner";

// Importar utilidades de validación / Import validation utilities
import {
  validateImageFile,
  createImagePreview,
  formatFileSize,
  type ImageValidationConfig,
  DEFAULT_IMAGE_CONFIG,
} from "../utils/upload-handler";

/**
 * =============================================================================
 * INTERFAZ: UseImageUploadReturn
 * =============================================================================
 * 
 * Valor de retorno del hook / Hook return value
 *
 * Define todos los valores y funciones que el hook expone
 * Defines all values and functions that the hook exposes
 * =============================================================================
 */
export interface UseImageUploadReturn {
  // Archivo seleccionado (null si no hay selección) / Selected file (null if no selection)
  selectedFile: File | null;

  // URL de previsualización (null si no hay archivo) / Preview URL (null if no file)
  previewUrl: string | null;

  // Referencia al input oculto (puede ser null inicialmente) / Reference to hidden input (can be null initially)
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Manejador de cambio de archivo / File change handler
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  // Manejador de clic en el área de imagen / Image area click handler
  handleImageClick: () => void;

  // Función para resetear la selección / Function to reset selection
  resetImage: () => void;

  // Función para establecer URL de preview manualmente / Function to set preview URL manually
  setPreviewUrl: (url: string | null) => void;

  // Función para limpiar imagen seleccionada / Function to clear selected image
  clearImage: () => void;
}

/**
 * =============================================================================
 * HOOK: useImageUpload
 * =============================================================================
 *
 * Hook personalizado para manejar subida de imágenes con validación y preview.
 * Custom hook to handle image uploads with validation and preview.
 *
 * @param config - Configuración de validación (opcional) / Validation config (optional)
 * @returns Objeto con estado y funciones / Object with state and functions
 * =============================================================================
 */
export const useImageUpload = (
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
): UseImageUploadReturn => {
  // --- Estados / States ---

  // Estado para almacenar el archivo seleccionado / State to store selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estado para almacenar la URL de previsualización / State to store preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Referencia al input de archivo oculto / Reference to hidden file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Funciones / Functions ---

  /**
   * =============================================================================
   * FUNCIÓN: handleImageClick
   * =============================================================================
   * 
   * Abre el selector de archivos del navegador / Opens the browser file picker
   *
   * Usa el optional chaining (?.) para evitar errores si ref es null
   * Uses optional chaining (?.) to avoid errors if ref is null
   * =============================================================================
   */
  const handleImageClick = (): void => {
    fileInputRef.current?.click();
  };

  /**
   * =============================================================================
   * FUNCIÓN: handleFileChange
   * =============================================================================
   * 
   * Maneja la selección de un archivo / Handles file selection
   *
   * Este manejador:
   * - Valida el tipo y tamaño del archivo
   * - Crea una previsualización
   * - Actualiza el estado
   * - Muestra notificaciones de error si es necesario
   *
   * This handler:
   * - Validates file type and size
   * - Creates a preview
   * - Updates the state
   * - Shows error notifications if needed
   * =============================================================================
   */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    // Obtener el primer archivo seleccionado / Get the first selected file
    const file = e.target.files?.[0];

    // Si no hay archivo, salir / If no file, exit
    if (!file) return;

    // Validar el archivo / Validate the file
    const validation = validateImageFile(file, config);

    // Si la validación falla, mostrar error y salir / If validation fails, show error and exit
    if (!validation.isValid) {
      toast.error(validation.error || "Archivo no válido");
      return;
    }

    // Crear previsualización / Create preview
    try {
      const preview = await createImagePreview(file);

      // Actualizar estados / Update states
      setSelectedFile(file);
      setPreviewUrl(preview);

      // Log en desarrollo para debugging / Development log for debugging
      if (import.meta.env.DEV) {
        console.log(
          "📸 Imagen seleccionada:",
          file.name,
          `(${formatFileSize(file.size)})`
        );
      }
    } catch (error) {
      // Manejar error al crear preview / Handle preview creation error
      toast.error("Error al procesar la imagen");
      if (import.meta.env.DEV) {
        console.error("Error creating preview:", error);
      }
    }
  };

  /**
   * =============================================================================
   * FUNCIÓN: resetImage
   * =============================================================================
   * 
   * Resetea la selección de imagen / Resets image selection
   *
   * Útil cuando se quiere limpiar el formulario o cancelar la subida
   * Useful when you want to clear the form or cancel the upload
   * =============================================================================
   */
  const resetImage = (): void => {
    setSelectedFile(null);
    setPreviewUrl(null);

    // Limpiar el valor del input para permitir reseleccionar el mismo archivo
    // Clear the input value to allow reselecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * =============================================================================
   * FUNCIÓN: clearImage
   * =============================================================================
   * 
   * Limpiar imagen seleccionada / Clear selected image
   * 
   * Similar a resetImage pero también revoca las URLs blob para liberar memoria
   * Similar to resetImage but also revokes blob URLs to free memory
   * =============================================================================
   */
  const clearImage = (): void => {
    setSelectedFile(null);
    
    // Revocar URL blob si existe para liberar memoria / Revoke blob URL if exists to free memory
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
  };

  // --- Retorno / Return ---

  // Retornar valores y funciones / Return values and functions
  return {
    selectedFile,
    previewUrl,
    fileInputRef,
    handleFileChange,
    handleImageClick,
    resetImage,
    setPreviewUrl,
    clearImage,
  };
};