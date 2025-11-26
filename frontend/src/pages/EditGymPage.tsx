/**
 * =============================================================================
 * PÁGINA: EditGymPage
 * =============================================================================
 *
 * Página para editar gimnasios existentes.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Page to edit existing gyms.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * Permisos / Permissions:
 * - Admin: puede editar SOLO datos de texto (nombre, dirección, coordenadas)
 * - Manager: puede editar SOLO imágenes (logo y imagen principal)
 * - Admin: can edit ONLY text fields (name, address, coordinates)
 * - Manager: can edit ONLY images (logo and main image)
 *
 * Flujo de trabajo / Workflow:
 * - Admin: editar texto -> updateGymDetails
 * - Manager: seleccionar imágenes -> upload mediante useImageUpload.uploadImage
 * - Admin: edit text -> updateGymDetails
 * - Manager: select images -> upload via useImageUpload.uploadImage
 *
 * Reutiliza / Reuses:
 * - useImageUpload (gestión de selección, validación y subida opcional; tipado genérico)
 * - ImageUploadPreview (componente UI para preview y trigger)
 * - useApiCall (centraliza llamadas API y manejo de loading/error)
 *
 * Observaciones importantes / Important notes:
 * - useImageUpload se instancia con tipos concretos (UploadArgs/UploadResult)
 *   para que uploadImage(...) tenga la firma correcta sin casts.
 * - useImageUpload is instantiated with concrete types (UploadArgs/UploadResult)
 *   so uploadImage(...) has the correct signature without casts.
 *
 * =============================================================================
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Contexto de autenticación / Auth context
import { useAuth } from "../context/AuthContext";

// Hooks reutilizables / Reusable hooks
import { useApiCall } from "../hooks/useApiCall";
import { useImageUpload } from "../hooks/useImageUpload";

// Componentes UI / UI components
import { ImageUploadPreview } from "../components/ImageUploadPreview";
import { CloseButton } from "../components/ui/CloseButton"; // Importar el botón de cierre // Import the close button

// Servicios API / API services
import {
  getGymById,
  updateGymDetails,
  updateGymLogo,
  updateGymMainImage,
} from "../services/gym-services";

// Tipos / Types
import type { Gym } from "../interfaces/gym-interfaces";

// Utilidades / Utilities
import { handleApiError } from "../utils/error-handler";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Form, Button, Alert } from "react-bootstrap";
import Spinner from "../components/ui/Spinner";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./EditGymPage.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
   COMPONENTE: EditGymPage
   ============================================================================= */
export const EditGymPage = () => {
  // Routing & auth
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Original data
  const [originalGymData, setOriginalGymData] = useState<Gym | null>(null);

  // Text fields (admin)
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [gymHours, setGymHours] = useState<string>(""); // NUEVO: Estado para el horario del gimnasio
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Local error
  const [formError, setFormError] = useState<string | null>(null);

  // Load gym data
  const {
    loading: isLoading,
    error: loadError,
    execute: executeLoadGym,
  } = useApiCall<Gym>("Error al cargar los datos del gimnasio.");

  /* ===========================================================================
     Image hooks (typed)
     - UploadArgs = [gymId, token]
     - UploadResult = { message, filePath }
     =========================================================================== */
  const logoUpload = useImageUpload<
    [number | string, string],
    { message: string; filePath: string }
  >(
    {
      maxSizeMB: 5,
      allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      errorMessages: {
        invalidType: "El logo debe ser una imagen PNG, JPG, JPEG o WEBP",
        maxSize: "El logo no debe superar los 5MB",
      },
    },
    async (file: File, gymId: number | string, tokenArg: string) =>
      await updateGymLogo(gymId, file, tokenArg)
  );

  const mainImageUpload = useImageUpload<
    [number | string, string],
    { message: string; filePath: string }
  >(
    {
      maxSizeMB: 5,
      allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      errorMessages: {
        invalidType: "La imagen principal debe ser PNG, JPG, JPEG o WEBP",
        maxSize: "La imagen principal no debe superar los 5MB",
      },
    },
    async (file: File, gymId: number | string, tokenArg: string) =>
      await updateGymMainImage(gymId, file, tokenArg)
  );

  // Disable submit while uploading images
  const anyImageUploading =
    logoUpload.isUploading || mainImageUpload.isUploading;

  // Role helper
  const isManagerEditing = user?.role === "manager";

  /* ===========================================================================
     EFFECT: load gym
     - validates id param
     - populates form and image previews
     =========================================================================== */
  useEffect(() => {
    const fetchGymData = async () => {
      if (!id) {
        setFormError("No ID provided.");
        toast.error("Invalid ID.");
        navigate("/gyms");
        return;
      }

      const gymId = parseInt(id, 10);
      if (isNaN(gymId)) {
        setFormError("Invalid ID format.");
        toast.error("Invalid ID.");
        navigate("/gyms");
        return;
      }

      try {
        const data = await executeLoadGym(() => getGymById(gymId));

        setOriginalGymData(data);
        setName(data.name || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setLatitude(data.latitude?.toString() || "");
        setLongitude(data.longitude?.toString() || "");
        setGymHours(data.gym_hours || ""); // NUEVO: Inicializar gymHours

        // Build preview URLs if backend provides paths
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
        const processed = handleApiError(
          err,
          "Error al cargar los datos del gimnasio."
        );
        setFormError(processed);
        toast.error(processed);
      }
    };

    fetchGymData();
    // Intentional: only run when id/navigate change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  /* ===========================================================================
     HANDLERS
     =========================================================================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    if (isManagerEditing) return;

    const { name: field, value } = e.target;
    switch (field) {
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
      case "gymHours": // NUEVO: Manejar el estado del horario
        setGymHours(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!id || !token) {
      const err = "Falta información esencial (ID o autenticación).";
      setFormError(err);
      toast.error(err);
      setIsSubmitting(false);
      return;
    }

    if (user?.role === "admin") {
      // Validate required text fields
      if (!name || !address || !city || !latitude || !longitude) {
        const err = "Todos los campos de texto son obligatorios.";
        setFormError(err);
        toast.error(err);
        setIsSubmitting(false);
        return;
      }

      const latNum = parseFloat(latitude);
      const lonNum = parseFloat(longitude);
      if (isNaN(latNum) || isNaN(lonNum)) {
        const err = "Latitud y longitud deben ser números válidos.";
        setFormError(err);
        toast.error(err);
        setIsSubmitting(false);
        return;
      }
      if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
        const err = "Coordenadas fuera de rango válido.";
        setFormError(err);
        toast.error(err);
        setIsSubmitting(false);
        return;
      }

      const textDataChanged =
        name !== originalGymData?.name ||
        address !== originalGymData?.address ||
        city !== originalGymData?.city ||
        latNum !== originalGymData?.latitude ||
        lonNum !== originalGymData?.longitude ||
        gymHours !== originalGymData?.gym_hours; // NUEVO: Comparar gymHours

      if (!textDataChanged) {
        toast.info("No se detectaron cambios para guardar.");
        setIsSubmitting(false);
        return;
      }

      try {
        const gymDetails: Partial<Gym> = {
          name,
          address,
          city,
          latitude: latNum,
          longitude: lonNum,
          gym_hours: gymHours, // NUEVO: Añadir gym_hours
        };
        await updateGymDetails(id, gymDetails, token);
        toast.success("Gimnasio actualizado con éxito.");
        navigate("/gyms");
      } catch (err) {
        const processed = handleApiError(
          err,
          "Error al actualizar el gimnasio."
        );
        setFormError(processed);
        toast.error(processed);
      } finally {
        setIsSubmitting(false);
      }
    } else if (user?.role === "manager") {
      // Image uploads only
      const promises: Promise<unknown>[] = [];

      if (logoUpload.selectedFile)
        promises.push(logoUpload.uploadImage(id, token));
      if (mainImageUpload.selectedFile)
        promises.push(mainImageUpload.uploadImage(id, token));

      if (promises.length === 0) {
        toast.info("No seleccionaste nuevas imágenes para guardar.");
        setIsSubmitting(false);
        return;
      }

      try {
        await Promise.all(promises);
        toast.success("Imágenes del gimnasio actualizadas.");
        navigate("/gyms");
      } catch (err) {
        const processed = handleApiError(
          err,
          "Error al actualizar las imágenes."
        );
        setFormError(processed);
        toast.error(processed);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("No tienes permisos para realizar esta acción.");
      setIsSubmitting(false);
    }
  };

  /* ===========================================================================
     RENDER
     =========================================================================== */
  if (isLoading)
    return (
      <Container className="text-center mt-5">
        <Spinner center size="lg" />
      </Container>
    );

  const displayError = loadError || formError;

  if (displayError || !originalGymData) {
    return (
      <div className={styles.pageWrapper} onClick={() => navigate(-1)}>
        <Container className={styles.container} onClick={(e) => e.stopPropagation()}>
          <Alert variant="danger">
            {displayError || "No se encontró el gimnasio."}
          </Alert>
          <Button onClick={() => navigate("/gyms")} variant="primary">
            Volver a la lista
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper} onClick={() => navigate(-1)}>
      <Container
        className={clsx(styles.container, "py-5", "position-relative")}
        onClick={(e) => e.stopPropagation()}>
        {/* Añadir position-relative para el posicionamiento absoluto del botón */}
        <CloseButton
          onClick={() => navigate(-1)}
          className={styles.closeButton}
          color="#FFB700"
          ariaLabel="Volver a la página anterior"
        />
        <h2 className="text-primary mb-4 text-center">
          Editar Gimnasio:<br /> <span className="text-secondary">{originalGymData.name}</span> <span style={{ fontSize: '0.6em' }}>(id: {id})</span>
        </h2>
        <Form onSubmit={handleSubmit}>
        {/* TEXT FIELDS (Admin only) / CAMPOS DE TEXTO (solo Admin) */}
        <Form.Group className="mb-3">
          <Form.Label className="text-secondary fw-bold">Nombre:</Form.Label>
          <Form.Control
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={handleChange}
            className={clsx({ [styles.disabledInput]: isManagerEditing })}
            disabled={isManagerEditing}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-secondary fw-bold">Dirección:</Form.Label>
          <Form.Control
            id="address"
            name="address"
            type="text"
            value={address}
            onChange={handleChange}
            className={clsx({ [styles.disabledInput]: isManagerEditing })}
            disabled={isManagerEditing}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-secondary fw-bold">Ciudad:</Form.Label>
          <Form.Control
            id="city"
            name="city"
            type="text"
            value={city}
            onChange={handleChange}
            className={clsx({ [styles.disabledInput]: isManagerEditing })}
            disabled={isManagerEditing}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-secondary fw-bold">Latitud:</Form.Label>
          <Form.Control
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={handleChange}
            className={clsx({ [styles.disabledInput]: isManagerEditing })}
            disabled={isManagerEditing}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-secondary fw-bold">Longitud:</Form.Label>
          <Form.Control
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={handleChange}
            className={clsx({ [styles.disabledInput]: isManagerEditing })}
            disabled={isManagerEditing}
            required
          />
        </Form.Group>

        {/* Horario del Gimnasio (Admin only) / Gym Hours (Admin only) */}
        <Form.Group className="mb-3">
          <Form.Label className="text-secondary fw-bold">Horario:</Form.Label>
          <Form.Control
            id="gymHours"
            name="gymHours"
            as="textarea"
            rows={3}
            value={gymHours}
            onChange={handleChange}
            className={clsx({ [styles.disabledInput]: isManagerEditing })}
            disabled={isManagerEditing}
            placeholder="Ej: L-V: 07:00 - 23:00&#10;S: 09:00 - 14:00&#10;D: Cerrado"
          />
          <Form.Text className={clsx(styles.helperText, "text-dark")}>
            Introduce el horario de apertura del gimnasio. Los saltos de línea se respetarán.
          </Form.Text>
        </Form.Group>

        {/* IMAGES SECTION (Manager edits, Admin sees read-only previews) */}
        {isManagerEditing ? (
          <div className="mt-5 pt-4 border-top border-secondary-subtle">
            <h5 className="text-primary mb-4 text-center text-md-start">Gestión de Imágenes</h5>
            <div className="row">
              <div className="col-12 col-md-6 mb-4 mb-md-0">
                <Form.Group className="d-flex flex-column align-items-center">
                  <Form.Label className="text-secondary fw-bold mb-2">Logo</Form.Label>
                  <input
                    id="logoFile"
                    type="file"
                    ref={logoUpload.fileInputRef}
                    onChange={logoUpload.handleFileChange}
                    style={{ display: "none" }}
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                  />
                  <div className="mb-2">
                    <ImageUploadPreview
                      previewUrl={logoUpload.previewUrl}
                      defaultImage="/images/gym-logo/default-gym-logo.png"
                      onClick={logoUpload.handleImageClick}
                      altText="Logo del gimnasio"
                      shape="square"
                      size={150}
                    />
                  </div>
                  <Form.Text className={clsx(styles.helperText, "text-dark text-center")}>
                    Haz clic para cambiar el logo
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="col-12 col-md-6">
                <Form.Group className="d-flex flex-column align-items-center">
                  <Form.Label className="text-secondary fw-bold mb-2">Imagen Principal</Form.Label>
                  <input
                    id="mainImageFile"
                    type="file"
                    ref={mainImageUpload.fileInputRef}
                    onChange={mainImageUpload.handleFileChange}
                    style={{ display: "none" }}
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                  />
                  <div className="mb-2">
                    <ImageUploadPreview
                      previewUrl={mainImageUpload.previewUrl}
                      defaultImage="/images/gym-image/default-gym-image.jpg"
                      onClick={mainImageUpload.handleImageClick}
                      altText="Imagen principal del gimnasio"
                      shape="square"
                      size={150}
                    />
                  </div>
                  <Form.Text className={clsx(styles.helperText, "text-dark text-center")}>
                    Haz clic para cambiar la imagen
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Form.Group className="mb-3">
              {logoUpload.previewUrl && (
                <>
                  <Form.Label className="text-secondary fw-bold">Logo</Form.Label>
                  <img
                    src={logoUpload.previewUrl}
                    alt="Logo actual"
                    className={styles.previewImage}
                  />
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              {mainImageUpload.previewUrl && (
                <>
                  <Form.Label className="text-secondary fw-bold">Imagen Principal</Form.Label>
                  <img
                    src={mainImageUpload.previewUrl}
                    alt="Imagen principal actual"
                    className={styles.previewImage}
                  />
                </>
              )}
            </Form.Group>
          </>
        )}

        {/* ERROR MESSAGE & BUTTONS */}
        {displayError && <Alert variant="danger">{displayError}</Alert>}

        <div className="d-flex justify-content-end gap-2 mt-5">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || anyImageUploading}>
            {isSubmitting || anyImageUploading ? (
              <>
                <Spinner size="sm" variant="light" className="me-2" />
                Guardando...
              </>
            ) : isManagerEditing ? (
              "Guardar Imágenes"
            ) : (
              "Guardar Cambios"
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/gyms")}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
    </div>
  );
};
