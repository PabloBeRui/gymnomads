// =============================================================================
// HOOK UNIFICADO: useImageUpload
// =============================================================================
//
// Descripción general / Overview:
// Este hook centraliza la gestión de imágenes en el frontend: selección,
// validación, generación de preview y subida opcional al servidor.
// It centralizes image handling on the frontend: selection, validation,
// preview generation and optional upload to the server.
//
// Funcionalidad principal / Main responsibilities:
// - Selección de archivo desde un input oculto y apertura del file picker.
//   Select a file from a hidden input and open the file picker.
// - Validación del archivo según una configuración (tipo y tamaño).
//   Validate the file according to a configuration (type and size).
// - Creación de una data URL para preview y control del estado de preview.
//   Create a data URL for preview and manage preview state.
// - Reset / clear del estado de imagen para permitir re-selección.
//   Reset / clear image state to allow re-selection.
// - Subida opcional: si se proporciona una función de subida (uploadFn)
//   o se pasa una al llamar uploadImage, el hook la ejecuta usando
//   useApiCall para manejar loading y errores.
//   Optional upload: if an upload function (uploadFn) is provided or passed
//   to uploadImage, the hook executes it using useApiCall to manage loading
//   and errors.
//
// API del hook (qué devuelve) / Hook API (what it returns):
// - selectedFile: File | null
//   Archivo actualmente seleccionado o null.
//   Currently selected file or null.
//
// - previewUrl: string | null
//   URL de previsualización (data URL o URL remota) o null.
//   Preview URL (data URL or remote URL) or null.
//
// - fileInputRef: RefObject<HTMLInputElement | null>
//   Ref para el input[type="file"] oculto. Útil para integrarlo en el DOM.
//   Ref for the hidden input[type="file"]. Useful to attach in the DOM.
//
// - handleFileChange(e): Promise<void>
//   Manejador para onChange del input de archivo. Valida y crea preview.
//   Handler for file input onChange. Validates and creates preview.
//
// - handleImageClick(): void
//   Abre el selector de archivos (click en el input oculto).
//   Opens the file picker (clicks the hidden input).
//
// - resetImage(): void
//   Resetea selectedFile y previewUrl y limpia el input para permitir reselect.
//   Resets selectedFile and previewUrl and clears the input to allow re-select.
//
// - setPreviewUrl(url): void
//   Permite establecer manualmente la URL de preview (útil para previews remotos).
//   Allows setting the preview URL manually (useful for remote previews).
//
// - clearImage(): void
//   Alias para resetImage (semántica más clara en algunos contextos).
//   Alias for resetImage (clearer semantic in some contexts).
//
// - isUploading: boolean
//   Indica si actualmente se está ejecutando una subida gestionada por useApiCall.
//   Indicates whether an upload managed by useApiCall is in progress.
//
// - uploadImage(...args): Promise<unknown>
//   Ejecuta la función de subida:
//     - Si el primer argumento es una función, se usa como uploadFn local:
//         uploadImage(localUploadFn, ...rest)
//     - Si no, se usa el uploadFn (opcional) pasado al crear el hook:
//         uploadImage(...rest)
//   La función de subida recibirá el File seleccionado como primer argumento:
//     fn(selectedFile, ...rest)
//   Returns the result of the provided upload function (unknown).
//
// Contrato de uploadFn / uploadFn contract:
// - Firma esperada: (file: File, ...args) => Promise<unknown>
// - El hook no asume detalles del salto (URL de respuesta, shape, etc.),
//   por eso uploadImage retorna Promise<unknown> y el caller debe castear/leer.
// - Expected signature: (file: File, ...args) => Promise<unknown>
// - The hook does not assume response shape; uploadImage returns Promise<unknown>.
//
// =============================================================================

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useApiCall } from "./useApiCall";
import {
  validateImageFile,
  createImagePreview,
  formatFileSize,
  DEFAULT_IMAGE_CONFIG,
} from "../utils/upload-handler";
// Importar tipos exportados por utils/upload-handler / Import types from utils/upload-handler
import type {
  ImageValidationConfig,
  ValidationResult,
} from "../utils/upload-handler";

/**
 * INTERFAZ: UseImageUploadReturn
 * RETURN INTERFACE: UseImageUploadReturn
 *
 * Define la forma del objeto que devuelve el hook.
 * Defines the shape of the object returned by the hook.
 */
export interface UseImageUploadReturn {
  selectedFile: File | null;
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Handlers / Handlers
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleImageClick: () => void;
  resetImage: () => void;

  // Manual preview control / Control manual del preview
  setPreviewUrl: (url: string | null) => void;
  clearImage: () => void;

  // Upload (optional) / Upload (opcional)
  isUploading: boolean;
  uploadImage: (...args: unknown[]) => Promise<unknown>;
}

/**
 * useImageUpload
 *
 * @param config - ImageValidationConfig opcional / optional validation config
 * @param uploadFn - función opcional para subir el archivo / optional upload function
 *                   firma: (file: File, ...args) => Promise<unknown>
 * @param defaultErrorMessage - mensaje por defecto para useApiCall / default error message
 */
export const useImageUpload = (
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG,
  uploadFn?: (file: File, ...args: unknown[]) => Promise<unknown>,
  defaultErrorMessage = "Error al subir la imagen."
): UseImageUploadReturn => {
  // --- Estados / Refs --- / --- States / Refs ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // useApiCall para la subida: maneja loading y manejo centralizado de errores
  // useApiCall for uploads: handles loading and centralized error management
  const { loading: isUploading, execute: executeUpload } =
    useApiCall<unknown>(defaultErrorMessage);

  // --- handleFileChange: valida y genera preview ---
  // --- handleFileChange: validates and generates preview ---
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;

      // Validación tipada: usamos ValidationResult exportado por utils/upload-handler
      // Typed validation: we use ValidationResult exported by utils/upload-handler
      const validation = validateImageFile(file, config) as ValidationResult;

      // Si la validación falla, mostramos mensaje orientado al usuario (predefinido)
      // If validation fails, show a user-facing predefined message
      if (!validation.isValid) {
        toast.error(
          validation.error ||
            "La imagen no cumple los requisitos. Por favor selecciona otra imagen."
        );

        // Detalle para desarrollador solo en DEV / Dev detail only in DEV
        if (import.meta.env.DEV) {
          console.error("validateImageFile result:", validation);
        }

        // Limpiar el input para permitir una nueva selección / Clear input to allow re-select
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Archivo válido: guardar y generar preview / Valid file: save and create preview
      setSelectedFile(file);
      try {
        const url = await createImagePreview(file);
        setPreviewUrl(url);

        // Log informativo en DEV con tamaño/archivo / Informative DEV log with file/size
        if (import.meta.env.DEV) {
          console.log(
            "📸 Imagen seleccionada:",
            file.name,
            `(${formatFileSize(file.size)})`
          );
        }
      } catch (err) {
        // Mensaje user-facing si falla la generación de preview
        // User-facing message if preview generation fails
        toast.error("Error al procesar la imagen");

        // Detalles para desarrollador en DEV / Dev details in DEV
        if (import.meta.env.DEV) {
          console.error("No se pudo generar preview:", err);
        }
      }
    },
    [config]
  );

  // --- handleImageClick: abre el file picker ---
  // --- handleImageClick: opens the file picker ---
  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // --- resetImage / clear image state ---
  // --- resetImage / clear image state ---
  const resetImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // clearImage es alias semántico / clearImage is a semantic alias
  const clearImage = useCallback(() => {
    resetImage();
  }, [resetImage]);

  /**
   * uploadImage
   *
   * Comportamiento:
   * - Si el primer argumento pasado a uploadImage es una función, se usa como
   *   uploadFn local: uploadImage(localFn, ...rest)
   * - Si no, se usa el uploadFn que se pasó al crear el hook (si existe)
   *
   * Uso esperado:
   * - Con uploadFn preconfigurado al crear el hook:
   *    const u = useImageUpload(cfg, (file,gymId,token) => updateGymMainImage(gymId,file,token))
   *    await u.uploadImage(gymId, token)
   *
   * - Pasando la función en la llamada:
   *    const u = useImageUpload(cfg)
   *    await u.uploadImage((file) => updateGymLogo(id, file, token))
   *
   * Nota: la función de subida recibirá el File seleccionado como primer argumento.
   */

  const uploadImage = useCallback(
    async (...args: unknown[]) => {
      // Determinar la función de subida a usar
      let fn: ((file: File, ...a: unknown[]) => Promise<unknown>) | undefined;
      let restArgs: unknown[] = [];

      if (typeof args[0] === "function") {
        fn = args[0] as (file: File, ...a: unknown[]) => Promise<unknown>;
        restArgs = args.slice(1);
      } else {
        fn = uploadFn;
        restArgs = args;
      }

      if (!fn) {
        // Error de uso: lanzar para visibilidad de desarrollador (no toast)
        throw new Error(
          "No se proporcionó ninguna función de subida. Pasa uploadFn al crear el hook o como primer argumento de uploadImage."
        );
      }

      if (!selectedFile) {
        throw new Error("No hay ningún archivo seleccionado para subir.");
      }

      // Ejecutar la subida mediante useApiCall para manejo consistente de loading/errores
      const result = await executeUpload(() => fn!(selectedFile!, ...restArgs));
      return result;
    },
    [uploadFn, selectedFile, executeUpload]
  );

  // --- API pública del hook / Hook public API ---
  return {
    selectedFile,
    previewUrl,
    fileInputRef,
    handleFileChange,
    handleImageClick,
    resetImage,
    setPreviewUrl,
    clearImage,
    isUploading,
    uploadImage,
  };
};
