

// Wrapper: useGymImageUpload
// Wrapper: useGymImageUpload
//
// Propósito: adaptar updateGymMainImage a useImageUpload para imágenes de gimnasio.
// Purpose: adapt updateGymMainImage to useImageUpload for gym images.

import { useImageUpload } from "./useImageUpload";
import { updateGymMainImage } from "../services/gym-services";

export const useGymImageUpload = () =>
  useImageUpload(
    {
      maxSizeMB: 5,
      allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      errorMessages: {
        invalidType:
          "Por favor, selecciona una imagen válida (PNG, JPG, JPEG o WEBP)",
        maxSize: "La imagen del gimnasio no debe superar los 5MB",
      },
    },
    // QUICK FIX:
    // - La función real tiene firma (file: File, gymId: number|string, token: string)
    // - La función esperada por useImageUpload es (file: File, ...args: unknown[]) => Promise<unknown>
    // - Aplicamos un doble cast para satisfacer a TS sin perder la implementación concreta.
    //
    // QUICK FIX:
    // - The real function signature is (file: File, gymId: number|string, token: string)
    // - useImageUpload expects (file: File, ...args: unknown[]) => Promise<unknown>
    // - We apply a double-cast to satisfy TS while keeping the concrete implementation.
    (async (file: File, gymId: number | string, token: string) =>
      await updateGymMainImage(gymId, file, token)) as unknown as (
      file: File,
      ...args: unknown[]
    ) => Promise<unknown>,
    "Error al subir la imagen del gimnasio."
  );






/**
 * =============================================================================
 * CUSTOM HOOK: useGymImageUpload
 * =============================================================================
 *
 * Hook especializado para la subida de imágenes de gimnasios.
 * Specialized hook for uploading gym images.
 *
 * Este hook combina:
 * This hook combines:
 * - useImageUpload (para validación y preview) / for validation and preview
 * - useApiCall (para la subida al servidor) / for server upload
 *
 * Flujo de trabajo / Workflow:
 * 1. Usuario selecciona imagen del gimnasio → validación automática
 * 2. Se muestra preview cuadrado
 * 3. Al enviar formulario → uploadImage() sube al servidor
 * 4. Se actualiza el gimnasio con la nueva imagen
 *
 * 1. User selects gym image → automatic validation
 * 2. Square preview is shown
 * 3. On form submit → uploadImage() uploads to server
 * 4. Gym is updated with new image
 *
 * Diferencias con useProfilePictureUpload / Differences with useProfilePictureUpload:
 * - Tamaño máximo: 5MB (igual que perfiles) / Max size: 5MB (same as profiles)
 * - Uso: EditGymPage / Usage: CreateGymPage, EditGymPage
 * =============================================================================
 */

// // Importar hook genérico de imagen / Import generic image hook
// import { useImageUpload } from "./useImageUpload";

// // Importar hook de llamadas API / Import API calls hook
// import { useApiCall } from "./useApiCall";

// // Importar servicio de subida / Import upload service
// import { updateGymMainImage } from "../services/gym-services";

// /**
//  * Tipo de respuesta del servicio / Service response type
//  *
//  * Basado en lo que retorna updateGymMainImage
//  * Based on what updateGymMainImage returns
//  */
// interface GymImageUploadResponse {
//   message: string;
//   filePath: string;
// }

// /**
//  * Valor de retorno del hook / Hook return value
//  *
//  * Extiende UseImageUploadReturn con funcionalidad de subida
//  * Extends UseImageUploadReturn with upload functionality
//  */

// export interface UseGymImageUploadReturn {
//   // Archivo seleccionado / Selected file
//   selectedFile: File | null;

//   // URL de preview / Preview URL
//   previewUrl: string | null;

//   // Ref del input / Input ref
//   fileInputRef: React.RefObject<HTMLInputElement | null>;

//   // Manejadores / Handlers
//   handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
//   handleImageClick: () => void;
//   resetImage: () => void;

//   // Estado de subida / Upload state
//   isUploading: boolean;

//   // Función de subida / Upload function
//   uploadImage: (
//     token: string,
//     gymId: number | string
//   ) => Promise<GymImageUploadResponse>;
// }

// /**
//  * =============================================================================
//  * HOOK: useGymImageUpload
//  * =============================================================================
//  *
//  * Hook especializado que combina selección y subida de imagen de gimnasio.
//  * Specialized hook that combines gym image selection and upload.
//  *
//  * @returns Objeto con estado y funciones / Object with state and functions
//  *
//  * =============================================================================
//  */
// export const useGymImageUpload = (): UseGymImageUploadReturn => {
//   // --- Usar hook genérico de imagen / Use generic image hook ---
//   const imageUpload = useImageUpload({
//     maxSizeMB: 5, // ✅ 5MB límite estándar del proyecto / 5MB project standard limit
//     allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
//     errorMessages: {
//       invalidType:
//         "Por favor, selecciona una imagen válida (PNG, JPG, JPEG o WEBP)",
//       maxSize: "La imagen del gimnasio no debe superar los 5MB",
//     },
//   });

//   // --- Usar hook de llamadas API / Use API calls hook ---
//   const { loading: isUploading, execute: executeUpload } =
//     useApiCall<GymImageUploadResponse>(
//       "Error al subir la imagen del gimnasio."
//     );

//   /**
//    * =============================================================================
//    * FUNCIÓN: uploadImage
//    * =============================================================================
//    *
//    * Sube la imagen principal del gimnasio al servidor.
//    * Uploads gym main image to server.
//    *
//    * @param token - Token de autenticación JWT / JWT authentication token
//    * @param gymId - ID del gimnasio (puede ser number o string) / Gym ID (can be number or string)
//    * @returns Promise con la respuesta del servidor / Promise with server response
//    * @throws Error si no hay imagen seleccionada / if no image is selected
//    *
//    * Nota: Esta función debe llamarse DESPUÉS de crear/actualizar el gimnasio
//    * Note: This function must be called AFTER creating/updating the gym
//    *
//    * Flujo de trabajo / Workflow:
//    * ```
//    * 1. Validar que hay imagen seleccionada
//    * 2. Llamar al servicio updateGymMainImage()
//    * 3. El servicio crea FormData con clave 'mainImage'
//    * 4. Hace POST a /api/gyms/:id/image
//    * 5. El servidor guarda la imagen y retorna message + filePath
//    * 6. Se actualiza la BD con la nueva ruta de imagen
//    *
//    * =============================================================================
//    */
//   const uploadImage = async (
//     token: string,
//     gymId: number | string
//   ): Promise<GymImageUploadResponse> => {
//     // Validar que hay una imagen seleccionada / Validate that there's a selected image
//     if (!imageUpload.selectedFile) {
//       throw new Error("No hay imagen seleccionada para subir");
//     }

//     // Ejecutar la subida usando el hook de API / Execute upload using API hook
//     //  Usa updateGymMainImage que ya existe en gym-services.ts

//     return executeUpload(() =>
//       updateGymMainImage(gymId, imageUpload.selectedFile!, token)
//     );
//   };

//   // Retornar valores y funciones combinadas / Return combined values and functions
//   return {
//     ...imageUpload,
//     isUploading,
//     uploadImage,
//   };
// };
