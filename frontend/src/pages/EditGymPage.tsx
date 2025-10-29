import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; //  hooks de enrutamiento //  routing hooks
// Importar los servicios necesarios // Import necessary services
import {
  getGymById,
  updateGymDetails,
  updateGymLogo,
  updateGymMainImage,
} from "../services/gym-services";
import type { Gym, ImageUploadResponse } from "../interfaces/gym-interfaces"; //  interfaces Gym //  Gym interfaces
import { useAuth } from "../context/AuthContext"; //  hook de autenticación //  auth hook
import { toast } from "sonner"; //  sonner toast
import { handleApiError } from "../utils/error-handler"; // Importar manejador de errores // Import error handler

//  estilos básicos temporales inline
// basic temporal inline styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "20px auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  formGroup: { marginBottom: "15px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
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
  errorText: { color: "red", fontSize: "0.9em", marginTop: "10px" },

  previewImage: {
    maxWidth: "200px",
    maxHeight: "150px",
    marginTop: "10px",
    display: "block",
    border: "1px solid #eee",
  },
};

// Componente EditGymPage
// EditGymPage Component
export const EditGymPage = () => {
  // Obtener parámetros de URL y hooks necesarios
  // Get URL parameters and necessary hooks

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Obtener usuario y token // Get user and token

  // Definir estado para los datos originales del gimnasio
  // Define state for the original gym data
  const [originalGymData, setOriginalGymData] = useState<Gym | null>(null);
  // Definir estado para indicar si se está cargando
  // Define state to indicate loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Definir estado para almacenar errores
  // Define state to store errors
  const [error, setError] = useState<string | null>(null);

  // Definir estados para los campos del formulario
  // Define states for the form fields
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(
    null
  );
  // Definir estado para indicar si se está enviando el formulario
  // Define state to indicate if the form is being submitted
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Definir efecto para obtener los datos del gimnasio al cargar la página
  // Define effect to fetch gym data when the page loads
  useEffect(() => {
    const fetchGymData = async () => {
      if (!id) {
        setError("No ID provided.");
        setIsLoading(false);
        toast.error("Invalid ID.");
        navigate("/gyms");
        return;
      }
      const gymId = parseInt(id, 10);
      if (isNaN(gymId)) {
        setError("Invalid ID format.");
        setIsLoading(false);
        toast.error("Invalid ID.");
        navigate("/gyms");
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const data = await getGymById(gymId);
        setOriginalGymData(data);
        setName(data.name || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setLatitude(data.latitude?.toString() || "");
        setLongitude(data.longitude?.toString() || "");
        const backendBaseUrl =
          import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";
        setLogoPreviewUrl(
          data.logo_url
            ? `${backendBaseUrl}/${
                data.logo_url.startsWith("/")
                  ? data.logo_url.substring(1)
                  : data.logo_url
              }`
            : null
        );
        setMainImagePreviewUrl(
          data.main_image_url
            ? `${backendBaseUrl}/${
                data.main_image_url.startsWith("/")
                  ? data.main_image_url.substring(1)
                  : data.main_image_url
              }`
            : null
        );
      } catch (err) {
        const processedErrorMessage = handleApiError(
          err,
          "Error al cargar los datos del gimnasio."
        );
        setError(processedErrorMessage);
        toast.error(processedErrorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGymData();
  }, [id, navigate]);

  // Determinar si el usuario es un manager
  // Determine if the user is a manager
  const isManagerEditing = user?.role === "manager";

  // Definir el manejador para cambios en inputs de texto
  // Define the handler for changes in text inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    if (!isManagerEditing) {
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
    }
  };

  // Definir el manejador para cambios en inputs de archivo
  // Define the handler for changes in file inputs
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, files } = e.target;
    let currentPreviewUrl: string | null = null;
    let previousFileStateSetter: React.Dispatch<
      React.SetStateAction<File | null>
    > | null = null;
    let previousPreviewStateSetter: React.Dispatch<
      React.SetStateAction<string | null>
    > | null = null;

    if (name === "logoFile") {
      currentPreviewUrl = logoPreviewUrl;
      previousFileStateSetter = setLogoFile;
      previousPreviewStateSetter = setLogoPreviewUrl;
    } else if (name === "mainImageFile") {
      currentPreviewUrl = mainImagePreviewUrl;
      previousFileStateSetter = setMainImageFile;
      previousPreviewStateSetter = setMainImagePreviewUrl;
    }

    if (currentPreviewUrl && currentPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(currentPreviewUrl);
    }

    if (
      files &&
      files.length > 0 &&
      previousFileStateSetter &&
      previousPreviewStateSetter
    ) {
      const selectedFile = files[0];
      const newPreviewUrl = URL.createObjectURL(selectedFile);
      previousFileStateSetter(selectedFile);
      previousPreviewStateSetter(newPreviewUrl);
    } else if (previousFileStateSetter && previousPreviewStateSetter) {
      previousFileStateSetter(null);
      previousPreviewStateSetter(null);
    }
  };

  // Definir efecto de limpieza para URLs de previsualización
  // Define cleanup effect for preview URLs

  useEffect(() => {
    return () => {
      if (logoPreviewUrl && logoPreviewUrl.startsWith("blob:"))
        URL.revokeObjectURL(logoPreviewUrl);
      if (mainImagePreviewUrl && mainImagePreviewUrl.startsWith("blob:"))
        URL.revokeObjectURL(mainImagePreviewUrl);
    };
  }, [logoPreviewUrl, mainImagePreviewUrl]);

  // Definir el manejador para enviar el formulario de edición
  // Define the handler to submit the edit form

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    // Prevenir el comportamiento por defecto del formulario
    // Prevent default form behavior
    e.preventDefault();
    // Limpiar errores previos e indicar que se inicia el envío
    // Clear previous errors and indicate submission start
    setError(null);
    setIsSubmitting(true);

    // Validar que se tenga ID y token
    // Validate ID and token presence
    if (!id || !token) {
      const errorMsg = "Falta información esencial (ID o autenticación).";
      toast.error(errorMsg);
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    // --- Lógica separada por rol ---
    // --- Logic separated by role ---

    if (user?.role === "admin") {
      // Lógica para Administrador
      // Logic for Administrator

      // Validar campos de texto requeridos
      // Validate required text fields
      if (!name || !address || !city || !latitude || !longitude) {
        const errorMsg = "Todos los campos de texto son obligatorios.";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }
      // Validar formato numérico y rango de coordenadas
      // Validate numeric format and range for coordinates
      const latNum = parseFloat(latitude);
      const lonNum = parseFloat(longitude);
      if (isNaN(latNum) || isNaN(lonNum)) {
        const errorMsg = "Latitud y longitud deben ser números válidos.";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }
      if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
        const errorMsg = "Coordenadas fuera de rango válido.";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Crear array para almacenar las promesas de actualización
      // Create array to store update promises
      // Usar tipo unión para permitir ambos tipos de promesas
      // Use union type to allow both promise types
      const updatePromises: (Promise<Gym> | Promise<ImageUploadResponse>)[] =
        [];
      // Comprobar si los datos de texto han cambiado
      // Check if text data has changed
      const textDataChanged =
        name !== originalGymData?.name ||
        address !== originalGymData?.address ||
        city !== originalGymData?.city ||
        latNum !== originalGymData?.latitude ||
        lonNum !== originalGymData?.longitude;
      if (textDataChanged) {
        // Si cambiaron, preparar datos y añadir promesa de actualización de detalles
        // If changed, prepare data and add promise for detail update
        const gymDetails: Partial<Gym> = {
          name,
          address,
          city,
          latitude: latNum,
          longitude: lonNum,
        };
        updatePromises.push(updateGymDetails(id, gymDetails, token));
      }

      // Comprobar si se seleccionó un nuevo logo
      // Check if a new logo was selected
      if (logoFile) {
        // Si true añadir promesa de actualización de logo
        // If true, add promise for logo update
        updatePromises.push(updateGymLogo(id, logoFile, token));
      }

      // Comprobar si se seleccionó una nueva imagen principal
      // Check if a new main image was selected
      if (mainImageFile) {
        // Si true, añadir promesa de actualización de imagen principal
        // If true, add promise for main image update
        updatePromises.push(updateGymMainImage(id, mainImageFile, token));
      }

      // Intentar ejecutar todas las actualizaciones necesarias
      // Try to execute all necessary updates
      try {
        // Ejecutar solo si hay algo que actualizar
        // Execute only if there's something to update
        if (updatePromises.length > 0) {
          // Esperar a que todas las promesas se completen
          // Wait for all promises to complete
          await Promise.all(updatePromises);
          // Notificar éxito
          // Notify success
          toast.success("Gimnasio actualizado con éxito.");
        } else {
          // Informar si no hubo cambios
          // Inform if there were no changes
          toast.info("No se detectaron cambios para guardar.");
        }
        // Redirigir a la lista de gimnasios
        // Redirect to the gym list
        navigate("/gyms");
      } catch (err) {
        // Capturar errores de las promesas
        // Process and display errors from promises
        const processedErrorMessage = handleApiError(
          err,
          "Error al actualizar el gimnasio."
        );
        setError(processedErrorMessage);
        toast.error(processedErrorMessage);
      } finally {
        // Ejecutar siempre al finalizar
        // Always execute upon completion
        setIsSubmitting(false); // Indicar que el envío terminó // Indicate submission finished
      }
      // Lógica para Manager (solo imágenes)
      // Logic for Manager (images only)
    } else if (user?.role === "manager") {
      // Crear array para promesas de actualización de imágenes
      // Create array for image update promises
      const imageUpdatePromises: Promise<ImageUploadResponse>[] = [];

      // Comprobar si se seleccionó nuevo logo
      // Check if new logo was selected
      if (logoFile) {
        // Añadir promesa de actualización de logo
        // Add promise for logo update
        imageUpdatePromises.push(updateGymLogo(id, logoFile, token));
      }
      // Comprobar si se seleccionó nueva imagen principal
      // Check if new main image was selected
      if (mainImageFile) {
        // Añadir promesa de actualización de imagen principal
        // Add promise for main image update
        imageUpdatePromises.push(updateGymMainImage(id, mainImageFile, token));
      }

      // Intentar ejecutar las actualizaciones de imágenes
      // Try to execute image updates
      try {
        // Ejecutar solo si hay imágenes para actualizar
        // Execute only if there are images to update
        if (imageUpdatePromises.length > 0) {
          // Esperar a que las promesas se completen
          // Wait for promises to complete
          await Promise.all(imageUpdatePromises);
          // Notificar éxito
          // Notify success
          toast.success("Imágenes del gimnasio actualizadas.");
        } else {
          // Informar si no se seleccionaron imágenes
          // Inform if no images were selected
          toast.info("No seleccionaste nuevas imágenes para guardar.");
        }
        // Redirigir a la lista
        // Redirect to the list
        navigate("/gyms");
      } catch (err) {
        // Capturar errores de las promesas
        // Process and display errors from promises
        const processedErrorMessage = handleApiError(
          err,
          "Error al actualizar las imágenes."
        );
        setError(processedErrorMessage);
        toast.error(processedErrorMessage);
      } finally {
        // Ejecutar siempre al finalizar
        // Always execute upon completion
        setIsSubmitting(false); // Indicar fin de envío // Indicate submission end
      }
    } else {
      // Si el rol no es admin ni manager (improbable por ProtectedRoute)
      // If role is neither admin nor manager (unlikely due to ProtectedRoute)
      toast.error("No tienes permisos para realizar esta acción.");
      setIsSubmitting(false);
    }
  };

  // Renderizar mensaje de carga
  // Render loading message
  if (isLoading) {
    /* Cargando... */
  }
  // Renderizar mensaje de error
  // Render error message
  if (error || !originalGymData) {
    /* ... */
  }

  // Renderizar el formulario principal
  // Render the main form
  return (
    // Contenedor principal del formulario
    // Main form container
    <div style={styles.container}>
      {/* Título: Usa datos originales por si el nombre se edita */}
      {/* Title: Use original data in case the name is edited */}
      <h2>
        Editar Gimnasio: {originalGymData?.name} (ID: {id})
      </h2>

      {/* Formulario / Form */}

      <form onSubmit={handleSubmit}>
        {/* --- CAMPOS DEL FORMULARIO ---  --- FORM FIELDS --- */}

        {/* Campo Nombre (deshabilitado si es manager) */}
        {/* Name Field (disabled if manager) */}
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
                ? { ...styles.input, ...styles.disabledInput } // Aplicar estilo deshabilitado si es manager // Apply disabled style if manager
                : styles.input // Estilo normal si no es manager // Normal style if not manager
            }
            disabled={isManagerEditing} // Deshabilitar si es manager // Disable if manager
            required // Campo obligatorio // Required field
          />
        </div>

        {/* Campo Dirección (deshabilitado si es manager) */}
        {/* Address Field (disabled if manager) */}
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

        {/* Campo Ciudad (deshabilitado si es manager) */}
        {/* City Field (disabled for manager) */}
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

        {/* Campo Latitud (deshabilitado si es manager, requerido) */}
        {/* Latitude Field (disabled for manager, required) */}
        <div style={styles.formGroup}>
          <label htmlFor="latitude" style={styles.label}>
            Latitud:
          </label>
          <input
            type="number"
            step="any" // Permitir decimales // Allow decimals
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
            required // Hacer obligatorio // Make required
          />
        </div>

        {/* Campo Longitud (deshabilitado si es manager, requerido) */}
        {/* Longitude Field (disabled for manager, required) */}
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
            required // Hacer obligatorio // Make required
          />
        </div>

        {/* --- Input y Previsualización Logo --- */}
        {/* --- Logo Input and Preview --- */}
        <div style={styles.formGroup}>
          {/* Label siempre visible */}
          {/* Label always visible */}
          <label htmlFor="logoFile" style={styles.label}>
            Logo
          </label>

          {/* Input de archivo: Renderizar SOLO si es manager */}
          {/* File input: Render ONLY if manager */}
          {isManagerEditing && (
            <input
              type="file"
              id="logoFile"
              name="logoFile" // Coincidir con handleFileChange // Match handleFileChange
              accept="image/*" // Aceptar solo imágenes // Accept only images
              onChange={handleFileChange} // Conectar manejador // Connect handler
              style={styles.input} // Estilo normal // Normal style
              // Quitar 'disabled' y estilo condicional de aquí // Remove 'disabled' and conditional style from here
            />
          )}

          {/* Previsualización: Renderizar si hay URL (visible para admin y manager) */}
          {/* Preview: Render if URL exists (visible for admin and manager) */}
          {logoPreviewUrl && (
            <img
              src={logoPreviewUrl} // Usar URL de previsualización (blob o del backend) // Use preview URL (blob or from backend)
              alt="Previsualización logo"
              style={styles.previewImage} // Aplicar estilo // Apply style
            />
          )}
        </div>

        {/* --- Input y Previsualización Imagen Principal --- */}
        {/* --- Main Image Input and Preview --- */}
        <div style={styles.formGroup}>
          {/* Label siempre visible */}
          {/* Label always visible */}
          <label htmlFor="mainImageFile" style={styles.label}>
            Imagen Principal
          </label>

          {/* Input de archivo: Renderizar SOLO si es manager */}
          {/* File input: Render ONLY if manager */}
          {isManagerEditing && (
            <input
              type="file"
              id="mainImageFile"
              name="mainImageFile" // Coincidir con handleFileChange // Match handleFileChange
              accept="image/*"
              onChange={handleFileChange}
              style={styles.input}
              // Quitar 'disabled' y estilo condicional de aquí // Remove 'disabled' and conditional style from here
            />
          )}

          {/* Previsualización: Renderizar si hay URL (visible para admin y manager) */}
          {/* Preview: Render if URL exists (visible for admin and manager) */}
          {mainImagePreviewUrl && (
            <img
              src={mainImagePreviewUrl}
              alt="Previsualización principal"
              style={styles.previewImage}
            />
          )}
        </div>

        {/* Mensaje de Error (si existe) */}
        {/* Error Message (if exists) */}
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Botón Guardar (texto cambia según rol) */}
        {/* Save Button (text changes based on role) */}
        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting // Si está enviando // If submitting
            ? "Guardando..."
            : isManagerEditing // Si es manager // If manager
            ? "Guardar Imágenes" // Texto para manager // Text for manager
            : "Guardar Cambios"}{" "}
          {/* Texto para admin */} {/* Text for admin */}
        </button>

        {/* Botón Cancelar (navega a la lista) */}
        {/* Cancel Button (navigates to the list) */}
        <button
          type="button" // tipo 'button' para no enviar el form //  type 'button' not to submit form
          onClick={() => navigate("/gyms")} // Navegar al hacer clic // Navigate on click
          style={{ ...styles.button, ...styles.cancelButton }}>
          Cancelar
        </button>
      </form>
    </div>
  );
};
