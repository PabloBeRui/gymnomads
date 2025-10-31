/**
 * =============================================================================
 * HOOK UNIFICADO Y GENÉRICO: useImageUpload
 * =============================================================================
 *
 * Propósito / Purpose:
 * - Gestionar selección, validación y preview de imágenes.
 * - Soportar subida opcional con uploadFn tipado como:
 *     (file: File, ...args: UploadArgs) => Promise<UploadResult>
 *
 * Ventaja principal / Main benefit:
 * - Tipado fuerte de los argumentos y resultado de la función de subida,
 *   evitando casts en páginas y wrappers.
 *
 * Nota: mantenemos la API de runtime — sólo añadimos tipado genérico.
 * Note: runtime API is unchanged — we only add generic typing.
 * =============================================================================
 */

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useApiCall } from "./useApiCall";
import {
  validateImageFile,
  createImagePreview,
  formatFileSize,
  DEFAULT_IMAGE_CONFIG,
} from "../utils/upload-handler";
import type {
  ImageValidationConfig,
  ValidationResult,
} from "../utils/upload-handler";

/**
 * INTERFAZ GENÉRICA: UseImageUploadReturn
 * UploadArgs: tuple de argumentos que pasará uploadImage (ej. [string] para token)
 * UploadResult: tipo devuelto por la promesa de upload
 */
export interface UseImageUploadReturn<
  UploadArgs extends unknown[] = unknown[],
  UploadResult = unknown
> {
  selectedFile: File | null;
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Handlers
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleImageClick: () => void;
  resetImage: () => void;

  // Control manual del preview
  setPreviewUrl: (url: string | null) => void;
  clearImage: () => void;

  // Upload (opcional)
  isUploading: boolean;
  /**
   * uploadImage soporta:
   * - uploadImage(localUploadFn, ...restArgs)
   * - uploadImage(...restArgs) // si uploadFn fue provisto al crear el hook
   *
   * uploadFn local debe ser (file: File, ...a: UploadArgs) => Promise<UploadResult>
   */
  uploadImage: (
    ...args:
      | [(file: File, ...a: UploadArgs) => Promise<UploadResult>, ...unknown[]]
      | UploadArgs
  ) => Promise<UploadResult>;
}

/**
 * useImageUpload genérico
 *
 * @param config - configuración de validación de imagen
 * @param uploadFn - función opcional de subida: (file, ...args) => Promise<UploadResult>
 * @param defaultErrorMessage - mensaje por defecto para useApiCall
 */
export const useImageUpload = <
  UploadArgs extends unknown[] = unknown[],
  UploadResult = unknown
>(
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG,
  uploadFn?: (file: File, ...args: UploadArgs) => Promise<UploadResult>,
  defaultErrorMessage = "Error al subir la imagen."
): UseImageUploadReturn<UploadArgs, UploadResult> => {
  // --- Estados / Refs ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // useApiCall maneja loading y errores tipados para UploadResult
  const { loading: isUploading, execute: executeUpload } =
    useApiCall<UploadResult>(defaultErrorMessage);

  // --- handleFileChange: validar y generar preview ---
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;

      const validation = validateImageFile(file, config) as ValidationResult;

      if (!validation.isValid) {
        toast.error(
          validation.error ||
            "La imagen no cumple los requisitos. Por favor selecciona otra imagen."
        );
        if (import.meta.env.DEV) {
          console.error("validateImageFile result:", validation);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setSelectedFile(file);
      try {
        const url = await createImagePreview(file);
        setPreviewUrl(url);
        if (import.meta.env.DEV) {
          console.log(
            "📸 Imagen seleccionada:",
            file.name,
            `(${formatFileSize(file.size)})`
          );
        }
      } catch (err) {
        toast.error("Error al procesar la imagen");
        if (import.meta.env.DEV) {
          console.error("No se pudo generar preview:", err);
        }
      }
    },
    [config]
  );

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const resetImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const clearImage = useCallback(() => {
    resetImage();
  }, [resetImage]);

  /**
   * uploadImage genérico:
   * - Si el primer arg es función, la usamos como uploadFn local.
   * - En otro caso usamos uploadFn pasado al crear el hook.
   */
  const uploadImage = useCallback(
    async (...args: unknown[]) => {
      let fn:
        | ((file: File, ...a: UploadArgs) => Promise<UploadResult>)
        | undefined;
      let restArgs: unknown[] = [];

      if (typeof args[0] === "function") {
        fn = args[0] as (file: File, ...a: UploadArgs) => Promise<UploadResult>;
        restArgs = args.slice(1);
      } else {
        fn = uploadFn;
        restArgs = args;
      }

      if (!fn) {
        throw new Error(
          "No se proporcionó ninguna función de subida. Pasa uploadFn al crear el hook o como primer argumento de uploadImage."
        );
      }

      if (!selectedFile) {
        throw new Error("No hay ningún archivo seleccionado para subir.");
      }

      // Ejecutar la subida a través de useApiCall (casteamos restArgs a UploadArgs)
      const result = await executeUpload(() =>
        fn!(selectedFile, ...(restArgs as UploadArgs))
      );
      return result;
    },
    [uploadFn, selectedFile, executeUpload]
  );

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
