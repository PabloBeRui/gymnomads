/**
 * =============================================================================
 * CUSTOM HOOK: useProfilePictureUpload
 * =============================================================================
 * 
 * Hook especializado para la subida de fotos de perfil de usuario.
 * Specialized hook for uploading user profile pictures.
 * 
 * Este hook combina:
 * This hook combines:
 * - useImageUpload (para validación y preview) / for validation and preview
 * - useApiCall (para la subida al servidor) / for server upload
 * 
 * Flujo de trabajo / Workflow:
 * 1. Usuario selecciona imagen → validación automática
 * 2. Se muestra preview circular
 * 3. Al enviar formulario → uploadImage() sube al servidor
 * 4. Se actualiza el estado del usuario con la nueva foto
 * 
 * 1. User selects image → automatic validation
 * 2. Circular preview is shown
 * 3. On form submit → uploadImage() uploads to server
 * 4. User state is updated with new photo
 * =============================================================================
 */

// Importar hook genérico de imagen / Import generic image hook
import { useImageUpload } from "./useImageUpload";

// Importar hook de llamadas API / Import API calls hook
import { useApiCall } from "./useApiCall";

// Importar servicio de subida / Import upload service
import { uploadProfilePicture } from "../services/user-services";

// Importar tipo de respuesta / Import response type
import type { UploadProfilePictureResponse } from "../interfaces/user-interfaces";

/**
 * Valor de retorno del hook / Hook return value
 * 
 * Extiende UseImageUploadReturn con funcionalidad de subida
 * Extends UseImageUploadReturn with upload functionality
 */
export interface UseProfilePictureUploadReturn {
  // Archivo seleccionado / Selected file
  selectedFile: File | null;
  
  // URL de preview / Preview URL
  previewUrl: string | null;
  
  // Ref del input / Input ref
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  
  // Manejadores / Handlers
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleImageClick: () => void;
  resetImage: () => void;
  
  // Estado de subida / Upload state
  isUploading: boolean;
  
  // Función de subida / Upload function
  uploadImage: (token: string) => Promise<UploadProfilePictureResponse>;
}

/**
 * =============================================================================
 * HOOK: useProfilePictureUpload
 * =============================================================================
 * 
 * Hook especializado que combina selección y subida de foto de perfil.
 * Specialized hook that combines profile picture selection and upload.
 * 
 * @returns Objeto con estado y funciones / Object with state and functions
 * 
 * Ejemplo de uso / Usage example:
 * ```typescript
 * const {
 *   selectedFile,
 *   previewUrl,
 *   fileInputRef,
 *   handleFileChange,
 *   handleImageClick,
 *   isUploading,
 *   uploadImage
 * } = useProfilePictureUpload();
 * 
 * const handleSubmit = async () => {
 *   // ... registrar usuario y obtener token
 *   
 *   if (selectedFile) {
 *     const result = await uploadImage(token);
 *     console.log('Imagen subida:', result.filePath);
 *   }
 * };
 * ```
 * =============================================================================
 */
export const useProfilePictureUpload = (): UseProfilePictureUploadReturn => {
  // --- Usar hook genérico de imagen / Use generic image hook ---
  const imageUpload = useImageUpload({
    maxSizeMB: 5,
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    errorMessages: {
      invalidType: "Por favor, selecciona una imagen válida (PNG, JPG, JPEG o WEBP)",
      maxSize: "La foto de perfil no debe superar los 5MB",
    },
  });

  // --- Usar hook de llamadas API / Use API calls hook ---
  const { loading: isUploading, execute: executeUpload } =
    useApiCall<UploadProfilePictureResponse>("Error al subir la imagen de perfil.");

  /**
   * =============================================================================
   * FUNCIÓN: uploadImage
   * =============================================================================
   * 
   * Sube la imagen de perfil al servidor.
   * Uploads profile picture to server.
   * 
   * @param token - Token de autenticación JWT / JWT authentication token
   * @returns Promise con la respuesta del servidor / Promise with server response
   * @throws Error si no hay imagen seleccionada / if no image is selected
   * 
   * Nota: Esta función debe llamarse DESPUÉS de que el usuario esté autenticado
   * Note: This function must be called AFTER the user is authenticated
   * 
   * Ejemplo de uso / Usage example:
   * ```typescript
   * try {
   *   const result = await uploadImage(userToken);
   *   console.log('✅ Imagen subida:', result.filePath);
   * } catch (error) {
   *   console.error('❌ Error:', error);
   * }
   * ```
   * =============================================================================
   */
  const uploadImage = async (token: string): Promise<UploadProfilePictureResponse> => {
    // Validar que hay una imagen seleccionada / Validate that there's a selected image
    if (!imageUpload.selectedFile) {
      throw new Error("No hay imagen seleccionada para subir");
    }

    // Ejecutar la subida usando el hook de API / Execute upload using API hook
    return executeUpload(() => uploadProfilePicture(token, imageUpload.selectedFile!));
  };

  // Retornar valores y funciones combinadas / Return combined values and functions
  return {
    ...imageUpload,
    isUploading,
    uploadImage,
  };
};