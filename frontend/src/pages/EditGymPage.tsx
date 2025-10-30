/**
 * =============================================================================
 * PÁGINA: EditGymPage
 * =============================================================================
 *
 * Página para editar gimnasios existentes.
 * Page to edit existing gyms.
 *
 * Permisos / Permissions:
 * - Admin: Edita SOLO datos de texto (nombre, dirección, coordenadas)
 * - Manager: Edita SOLO imágenes (logo y main image)
 *
 * ✅ REFACTORIZADO usando:
 * - useImageUpload (para manejo de imágenes)
 * - ImageUploadPreview (componente de preview)
 * - useApiCall (llamadas API)
 * - Validadores centralizados
 * =============================================================================
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Importar contexto / Import context
import { useAuth } from "../context/AuthContext";

// Importar hooks personalizados / Import custom hooks
import { useApiCall } from "../hooks/useApiCall";
import { useImageUpload } from "../hooks/useImageUpload";

// Importar componente / Import component

import { ImageUploadPreview } from "../components/ImageUploadPreview";

// Importar servicios / Import services
import {
  getGymById,
  updateGymDetails,
  updateGymLogo,
  updateGymMainImage,
} from "../services/gym-services";

// Importar interfaces / Import interfaces
import type { Gym, ImageUploadResponse } from "../interfaces/gym-interfaces";

// Importar utilidades / Import utilities
import { handleApiError } from "../utils/error-handler";

/**
 * =============================================================================
 * ESTILOS
 * =============================================================================
 */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "20px auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  disabledInput: {
    backgroundColor: "#e9ecef",
    cursor: "not-allowed",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    marginLeft: "10px",
  },
  errorText: {
    color: "red",
    fontSize: "0.9em",
    marginTop: "10px",
  },
  previewImage: {
    maxWidth: "200px",
    maxHeight: "150px",
    marginTop: "10px",
    display: "block",
    border: "1px solid #eee",
  },
};

/**
 * =============================================================================
 * COMPONENTE: EditGymPage
 * =============================================================================
 */
export const EditGymPage = () => {
  // --- Hooks de Enrutamiento / Routing Hooks ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // --- Estados de Datos Originales / Original Data States ---
  const [originalGymData, setOriginalGymData] = useState<Gym | null>(null);

  // --- Estados de Formulario (Texto) / Form States (Text) ---
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- Estado de Error Local / Local Error State ---
  const [formError, setFormError] = useState<string | null>(null);

  // --- Hooks de API / API Hooks ---
  const {
    loading: isLoading,
    error: loadError,
    execute: executeLoadGym,
  } = useApiCall<Gym>("Error al cargar los datos del gimnasio.");

  // --- ✅ REFACTORIZADO: Hooks de Imagen / Image Hooks ---

  /**
   * Hook para el Logo / Hook for Logo
   */
  const logoUpload = useImageUpload({
    maxSizeMB: 5,
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    errorMessages: {
      invalidType: "El logo debe ser una imagen PNG, JPG, JPEG o WEBP",
      maxSize: "El logo no debe superar los 5MB",
    },
  });

  /**
   * Hook para la Imagen Principal / Hook for Main Image
   */
  const mainImageUpload = useImageUpload({
    maxSizeMB: 5,
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    errorMessages: {
      invalidType: "La imagen principal debe ser PNG, JPG, JPEG o WEBP",
      maxSize: "La imagen principal no debe superar los 5MB",
    },
  });

  // --- Determinar Rol / Determine Role ---
  const isManagerEditing = user?.role === "manager";

  // --- Efectos / Effects ---

  /**
   * =============================================================================
   * EFECTO: Cargar datos del gimnasio al montar
   * EFFECT: Load gym data on mount
   * =============================================================================
   */
  useEffect(() => {
    const fetchGymData = async () => {
      // Validar que exista ID / Validate ID exists
      if (!id) {
        setFormError("No ID provided.");
        toast.error("Invalid ID.");
        navigate("/gyms");
        return;
      }

      // Validar formato del ID / Validate ID format
      const gymId = parseInt(id, 10);
      if (isNaN(gymId)) {
        setFormError("Invalid ID format.");
        toast.error("Invalid ID.");
        navigate("/gyms");
        return;
      }

      try {
        // Cargar datos del gimnasio / Load gym data
        const data = await executeLoadGym(() => getGymById(gymId));

        // Establecer datos originales / Set original data
        setOriginalGymData(data);
        setName(data.name || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setLatitude(data.latitude?.toString() || "");
        setLongitude(data.longitude?.toString() || "");

        // Configurar preview de imágenes existentes / Set preview for existing images
        const backendBaseUrl =
          import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

        if (data.logo_url) {
          const logoUrl = `${backendBaseUrl}/${
            data.logo_url.startsWith("/")
              ? data.logo_url.substring(1)
              : data.logo_url
          }`;
          logoUpload.setPreviewUrl(logoUrl);
        }

        if (data.main_image_url) {
          const mainImageUrl = `${backendBaseUrl}/${
            data.main_image_url.startsWith("/")
              ? data.main_image_url.substring(1)
              : data.main_image_url
          }`;
          mainImageUpload.setPreviewUrl(mainImageUrl);
        }
      } catch (err) {
        const processedErrorMessage = handleApiError(
          err,
          "Error al cargar los datos del gimnasio."
        );
        setFormError(processedErrorMessage);
        toast.error(processedErrorMessage);
      }
    };

    fetchGymData();
    // ! Dependencias omitidas intencionalmente:
    // - executeLoadGym: función estable de useApiCall
    // - logoUpload.setPreviewUrl: función estable de useImageUpload
    // - mainImageUpload.setPreviewUrl: función estable de useImageUpload
    // - setFormError: función de setState estable
    // Solo ejecutar cuando cambien id o navigate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // --- Manejadores / Handlers ---

  /**
   * =============================================================================
   * FUNCIÓN: handleChange
   * =============================================================================
   *
   * Manejador de cambios en inputs de texto.
   * Handler for text input changes.
   *
   * Solo funciona si el usuario NO es manager.
   * Only works if user is NOT a manager.
   * =============================================================================
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    if (isManagerEditing) return; // Manager no puede editar texto / Manager can't edit text

    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "city":
        setCity(value);
        break;
      case "latitude":
        setLatitude(value);
        break;
      case "longitude":
        setLongitude(value);
        break;
      default:
        break;
    }
  };

  /**
   * =============================================================================
   * FUNCIÓN: handleSubmit
   * =============================================================================
   *
   * Manejador de envío del formulario.
   * Form submission handler.
   *
   * Lógica diferenciada por rol:
   * - Admin: Actualiza SOLO texto
   * - Manager: Actualiza SOLO imágenes
   *
   * Logic differentiated by role:
   * - Admin: Updates ONLY text
   * - Manager: Updates ONLY images
   * =============================================================================
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    // Validar información esencial / Validate essential information
    if (!id || !token) {
      const errorMsg = "Falta información esencial (ID o autenticación).";
      toast.error(errorMsg);
      setFormError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    // ==========================================================================
    // LÓGICA PARA ADMIN (solo texto)
    // LOGIC FOR ADMIN (text only)
    // ==========================================================================
    if (user?.role === "admin") {
      // Validar campos de texto requeridos / Validate required text fields
      if (!name || !address || !city || !latitude || !longitude) {
        const errorMsg = "Todos los campos de texto son obligatorios.";
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Validar coordenadas / Validate coordinates
      const latNum = parseFloat(latitude);
      const lonNum = parseFloat(longitude);

      if (isNaN(latNum) || isNaN(lonNum)) {
        const errorMsg = "Latitud y longitud deben ser números válidos.";
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
        const errorMsg = "Coordenadas fuera de rango válido.";
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Comprobar si los datos de texto cambiaron / Check if text data changed
      const textDataChanged =
        name !== originalGymData?.name ||
        address !== originalGymData?.address ||
        city !== originalGymData?.city ||
        latNum !== originalGymData?.latitude ||
        lonNum !== originalGymData?.longitude;

      if (!textDataChanged) {
        toast.info("No se detectaron cambios para guardar.");
        setIsSubmitting(false);
        return;
      }

      try {
        // Preparar datos de actualización / Prepare update data
        const gymDetails: Partial<Gym> = {
          name,
          address,
          city,
          latitude: latNum,
          longitude: lonNum,
        };

        // Ejecutar actualización / Execute update
        await updateGymDetails(id, gymDetails, token);
        toast.success("Gimnasio actualizado con éxito.");
        navigate("/gyms");
      } catch (err) {
        const processedErrorMessage = handleApiError(
          err,
          "Error al actualizar el gimnasio."
        );
        setFormError(processedErrorMessage);
        toast.error(processedErrorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
    // ==========================================================================
    // LÓGICA PARA MANAGER (solo imágenes)
    // LOGIC FOR MANAGER (images only)
    // ==========================================================================
    else if (user?.role === "manager") {
      const imageUpdatePromises: Promise<ImageUploadResponse>[] = [];

      // ✅ REFACTORIZADO: Usar selectedFile del hook
      // ✅ REFACTORED: Use selectedFile from hook
      if (logoUpload.selectedFile) {
        imageUpdatePromises.push(
          updateGymLogo(id, logoUpload.selectedFile, token)
        );
      }

      if (mainImageUpload.selectedFile) {
        imageUpdatePromises.push(
          updateGymMainImage(id, mainImageUpload.selectedFile, token)
        );
      }

      // Validar que se hayan seleccionado imágenes / Validate images were selected
      if (imageUpdatePromises.length === 0) {
        toast.info("No seleccionaste nuevas imágenes para guardar.");
        setIsSubmitting(false);
        return;
      }

      try {
        // Ejecutar actualizaciones de imágenes / Execute image updates
        await Promise.all(imageUpdatePromises);
        toast.success("Imágenes del gimnasio actualizadas.");
        navigate("/gyms");
      } catch (err) {
        const processedErrorMessage = handleApiError(
          err,
          "Error al actualizar las imágenes."
        );
        setFormError(processedErrorMessage);
        toast.error(processedErrorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Usuario sin permisos / User without permissions
      toast.error("No tienes permisos para realizar esta acción.");
      setIsSubmitting(false);
    }
  };

  // --- Renderizado / Rendering ---

  /**
   * Estado de carga / Loading state
   */
  if (isLoading) {
    return <div style={styles.container}>Cargando...</div>;
  }

  /**
   * Combinar errores / Combine errors
   */
  const displayError = loadError || formError;

  /**
   * Estado de error / Error state
   */
  if (displayError || !originalGymData) {
    return (
      <div style={styles.container}>
        <p style={styles.errorText}>
          {displayError || "No se encontró el gimnasio."}
        </p>
        <button onClick={() => navigate("/gyms")} style={styles.button}>
          Volver a la lista
        </button>
      </div>
    );
  }

  /**
   * Renderizado principal / Main render
   */
  return (
    <div style={styles.container}>
      {/* Título / Title */}
      <h2>
        Editar Gimnasio: {originalGymData.name} (ID: {id})
      </h2>

      {/* Formulario / Form */}
      <form onSubmit={handleSubmit}>
        {/* ====================================================================
         * SECCIÓN: CAMPOS DE TEXTO (Solo Admin)
         * SECTION: TEXT FIELDS (Admin Only)
         * ==================================================================== */}

        {/* Nombre / Name */}
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            Nombre:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            style={
              isManagerEditing
                ? { ...styles.input, ...styles.disabledInput }
                : styles.input
            }
            disabled={isManagerEditing}
            required
          />
        </div>

        {/* Dirección / Address */}
        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.label}>
            Dirección:
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={handleChange}
            style={
              isManagerEditing
                ? { ...styles.input, ...styles.disabledInput }
                : styles.input
            }
            disabled={isManagerEditing}
            required
          />
        </div>

        {/* Ciudad / City */}
        <div style={styles.formGroup}>
          <label htmlFor="city" style={styles.label}>
            Ciudad:
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={city}
            onChange={handleChange}
            style={
              isManagerEditing
                ? { ...styles.input, ...styles.disabledInput }
                : styles.input
            }
            disabled={isManagerEditing}
            required
          />
        </div>

        {/* Latitud / Latitude */}
        <div style={styles.formGroup}>
          <label htmlFor="latitude" style={styles.label}>
            Latitud:
          </label>
          <input
            type="number"
            step="any"
            id="latitude"
            name="latitude"
            value={latitude}
            onChange={handleChange}
            style={
              isManagerEditing
                ? { ...styles.input, ...styles.disabledInput }
                : styles.input
            }
            disabled={isManagerEditing}
            required
          />
        </div>

        {/* Longitud / Longitude */}
        <div style={styles.formGroup}>
          <label htmlFor="longitude" style={styles.label}>
            Longitud:
          </label>
          <input
            type="number"
            step="any"
            id="longitude"
            name="longitude"
            value={longitude}
            onChange={handleChange}
            style={
              isManagerEditing
                ? { ...styles.input, ...styles.disabledInput }
                : styles.input
            }
            disabled={isManagerEditing}
            required
          />
        </div>

        {/* ====================================================================
         * SECCIÓN: IMÁGENES (Solo Manager puede editar, Admin ve preview)
         * SECTION: IMAGES (Only Manager can edit, Admin sees preview)
         * ==================================================================== */}

        {/* Logo */}
        <div style={styles.formGroup}>
          <label htmlFor="logoFile" style={styles.label}>
            Logo
          </label>

          {/* Input de archivo: SOLO visible para Manager */}
          {/* File input: ONLY visible for Manager */}
          {isManagerEditing && (
            <>
              <input
                type="file"
                ref={logoUpload.fileInputRef}
                onChange={logoUpload.handleFileChange}
                style={{ display: "none" }}
                accept="image/png, image/jpeg, image/webp, image/jpg"
              />

              <ImageUploadPreview
                previewUrl={logoUpload.previewUrl}
                defaultImage="/images/gym/default_logo.png"
                onClick={logoUpload.handleImageClick}
                altText="Logo del gimnasio"
                shape="square"
                size={200}
                showHelpText={true}
                helpText="Haz clic para cambiar el logo"
              />
            </>
          )}

          {/* Preview solo lectura para Admin */}
          {/* Read-only preview for Admin */}
          {!isManagerEditing && logoUpload.previewUrl && (
            <img
              src={logoUpload.previewUrl}
              alt="Logo actual"
              style={styles.previewImage}
            />
          )}
        </div>

        {/* Imagen Principal / Main Image */}
        <div style={styles.formGroup}>
          <label htmlFor="mainImageFile" style={styles.label}>
            Imagen Principal
          </label>

          {/* Input de archivo: SOLO visible para Manager */}
          {/* File input: ONLY visible for Manager */}
          {isManagerEditing && (
            <>
              <input
                type="file"
                ref={mainImageUpload.fileInputRef}
                onChange={mainImageUpload.handleFileChange}
                style={{ display: "none" }}
                accept="image/png, image/jpeg, image/webp, image/jpg"
              />

              <ImageUploadPreview
                previewUrl={mainImageUpload.previewUrl}
                defaultImage="/images/gym/default_main.png"
                onClick={mainImageUpload.handleImageClick}
                altText="Imagen principal del gimnasio"
                shape="square"
                size={200}
                showHelpText={true}
                helpText="Haz clic para cambiar la imagen principal"
              />
            </>
          )}

          {/* Preview solo lectura para Admin */}
          {/* Read-only preview for Admin */}
          {!isManagerEditing && mainImageUpload.previewUrl && (
            <img
              src={mainImageUpload.previewUrl}
              alt="Imagen principal actual"
              style={styles.previewImage}
            />
          )}
        </div>

        {/* ====================================================================
         * SECCIÓN: MENSAJE DE ERROR Y BOTONES
         * SECTION: ERROR MESSAGE AND BUTTONS
         * ==================================================================== */}

        {/* Mensaje de Error / Error Message */}
        {displayError && <p style={styles.errorText}>{displayError}</p>}

        {/* Botón Guardar / Save Button */}
        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : isManagerEditing
            ? "Guardar Imágenes"
            : "Guardar Cambios"}
        </button>

        {/* Botón Cancelar / Cancel Button */}
        <button
          type="button"
          onClick={() => navigate("/gyms")}
          style={{ ...styles.button, ...styles.cancelButton }}>
          Cancelar
        </button>
      </form>
    </div>
  );
};
