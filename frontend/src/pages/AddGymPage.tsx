import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import { createGym } from '../services/gym-services'; // Servicio para crear el gimnasio // Service to create the gym
import { toast } from 'sonner'; // <-- Sonner notifications
import { handleApiError } from "../utils/error-handler";
// Estilos básicos inline (similar a ListGymsPage)
// Basic inline styles (similar to ListGymsPage)
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
  button: {
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
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

/**
 * Página con formulario para que un administrador añada un nuevo gimnasio.
 * Page with a form for an administrator to add a new gym.
 *
 */

export const AddGymPage = () => {
  const navigate = useNavigate(); // Hook para navegar // Hook to navigate
    const { token } = useAuth(); // Obtener el token del contexto // Get token from context

  // Defino useSates para cada campo del formulario
  // I define useSate for each form field
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [latitude, setLatitude] = useState<string>(""); // Usar string inicialmente por el input
  const [longitude, setLongitude] = useState<string>(""); // Usar string inicialmente por el input
  const [logoFile, setLogoFile] = useState<File | null>(null); // Estado para el archivo del logo
  const [mainImageFile, setMainImageFile] = useState<File | null>(null); // Estado para la imagen principal

  // useSate para manejar errores del formulario o de la API
  // useSate to handle form or API errors
  const [error, setError] = useState<string | null>(null);
  // useSate para indicar si se está enviando el formulario
  // useSate to indicate if the form is being submitted
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estados para las URLs de previsualización
  // States for the preview URLs
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(
    null
  );

  // Manejador genérico para inputs de texto
  // Generic handler for text inputs

  // Defino la función 'handleChange' que se ejecutará cuando ocurra un evento de cambio
  // I define the 'handleChange' function that will run when a change event occurs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    // 1. Obtengo el 'name' y el 'value' del elemento que disparó el evento (el input)
    // 1. I get the 'name' and 'value' from the element that triggered the event (the input)
    const { name, value } = e.target;

    // 2. Uso un 'switch' para decidir qué estado actualizar, basándome en el 'name' del input
    // 2. I use a 'switch' to decide which state to update, based on the input's 'name'
    switch (name) {
      // Si el 'name' del input es "name", llamo a la función para actualizar el estado 'name'
      // If the input's 'name' is "name", I call the function to update the 'name' state
      case "name":
        setName(value); // Actualizo el estado 'name' con el nuevo 'value'
        break;
      // Si el 'name' es "address", actualizo el estado 'address'
      // If the 'name' is "address", I update the 'address' state
      case "address":
        setAddress(value);
        break;
      // Y así sucesivamente para cada input de texto...
      // And so on for each text input...
      case "city":
        setCity(value);
        break;
      case "latitude":
        setLatitude(value); // ?Guardo el valor como string por ahora
        break;
      case "longitude":
        setLongitude(value); // ?Guardo el valor como string por ahora
        break;
      // Si el 'name' no coincide con ninguno de los casos anteriores, no hago nada
      // If the 'name' doesn't match any of the previous cases, I do nothing
      default:
        break;
    }
  };

  // Definir el manejador para los inputs de tipo archivo (logo, imagen principal)
  // Define my handler for file type inputs (logo, main image)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Obtener el 'name' del input ('logoFile' o 'mainImageFile') y la lista de archivos seleccionados
    // Get the 'name' of the input ('logoFile' or 'mainImageFile') and the list of selected files
    const { name, files } = e.target;

    // Verificar si se ha seleccionado al menos un archivo
    // Check if at least one file has been selected
    if (files && files.length > 0) {
      // Si se seleccionó un archivo, tomar el primero de la lista
      // If a file was selected, take the first one from the list
      const selectedFile = files[0];
      // Crear una URL temporal para la previsualización
      // Create a temporary URL for the preview
      const previewUrl = URL.createObjectURL(selectedFile);

      // Comprobar el 'name' del input para saber qué estado actualizar
      // Check the input's 'name' to know which state to update
      if (name === "logoFile") {
        // Si es el input del logo, actualizar el estado 'logoFile'
        // If it's the logo input, Update the 'logoFile' state
        setLogoFile(selectedFile);
        // Guardar la URL de previsualización del logo
        // Save the logo preview URL
        setLogoPreviewUrl(previewUrl);
      } else if (name === "mainImageFile") {
        // Si es el input de la imagen principal, actualizar el estado 'mainImageFile'
        // If it's the main image input, Update the 'mainImageFile' state
        setMainImageFile(selectedFile);

        // Guardar la URL de previsualización de la imagen principal
        // Save the main image preview URL
        setMainImagePreviewUrl(previewUrl);
      }
    }
    // Si no se selecciona archivo (files es null o vacío), no hacer nada y el estado se queda como estaba
    // If no file is selected (files is null or empty), do nothing and the state remains as it was
  };

  // Efecto para limpiar (revocar) las URLs de objeto cuando el componente se desmonta
  // Effect to clean up (revoke) object URLs when the component unmounts
  useEffect(() => {
    // Esta función se ejecutará cuando el componente se desmonte
    // This function will run when the component unmounts
    return () => {
      // Si existía una URL de previsualización para el logo, revocarla
      // If a preview URL for the logo existed, revoke it
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      // Si existía una URL de previsualización para la imagen principal, revocarla
      // If a preview URL for the main image existed, revoke it
      if (mainImagePreviewUrl) {
        URL.revokeObjectURL(mainImagePreviewUrl);
      }
    };
  }, [logoPreviewUrl, mainImagePreviewUrl]); // Dependencias: se ejecuta si cambian las URLs // Dependencies: runs if URLs change

  // Definir el manejador para enviar el formulario
    // Define the handler to submit the form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        // Prevenir el envío por defecto del navegador
        // Prevent default browser submission
        e.preventDefault();
        // Limpiar errores previos
        // Clear previous errors
        setError(null);
        // Indicar que el envío está en progreso
        // Indicate submission is in progress
        setIsSubmitting(true);

        // Realizar validación básica (campos requeridos)
        // Perform basic validation (required fields)
        if (!name || !address || !city) {
            const errorMsg = 'Nombre, Dirección y Ciudad son campos obligatorios.';
            setError(errorMsg);
            toast.error(errorMsg); // Notificar error con sonner
            setIsSubmitting(false);
            // Detener ejecución si faltan campos requeridos
            // Stop execution if required fields are missing
            return;
        }

        // Verificar que se tiene el token
        // Verify the token is available
        if (!token) {
             const errorMsg = 'No se está autenticado. Por favor, iniciar sesión de nuevo.';
             setError(errorMsg);
             toast.error(errorMsg); // Notificar error con sonner
             setIsSubmitting(false);
             // Detener si no hay token
             // Stop if no token
             return;
        }

        // Crear objeto FormData para enviar datos y archivos
        // Create FormData object to send data and files
        const formData = new FormData();
        formData.append('name', name);
        formData.append('address', address);
        formData.append('city', city);

        // Añadir latitud y longitud solo si tienen valor y son números válidos
        // Add latitude and longitude only if they have value and are valid numbers
        const latNum = parseFloat(latitude);
        const lonNum = parseFloat(longitude);
        if (!isNaN(latNum)) {
             // Enviar como string, el backend se encargará de parsearlo
             // Send as string, the backend will handle parsing
             formData.append('latitude', latitude);
        }
         if (!isNaN(lonNum)) {
             // Enviar como string
             // Send as string
             formData.append('longitude', longitude);
         }

        // Añadir archivos si existen, usando las claves que espera Multer ('logo', 'mainImage')
        // Add files if they exist, using the keys expected by Multer ('logo', 'mainImage')
        if (logoFile) {
            formData.append('logo', logoFile);
        }
        if (mainImageFile) {
            formData.append('mainImage', mainImageFile);
        }

        try {
            // Llamar al servicio para crear el gimnasio, pasando FormData y token
            // Call the service to create the gym, passing FormData and token
            await createGym(formData, token);

            // Éxito: Mostrar notificación con sonner y redirigir a la lista de gimnasios
            // Success: Show notification with sonner and redirect to the gym list
            toast.success('¡Gimnasio añadido con éxito!');
            navigate('/gyms'); // Redirigir // Redirect

        } catch (err) {
            // Error: Usar el manejador de errores centralizado
            // Error: Use the centralized error handler
            const processedErrorMessage = handleApiError(err, 'Ocurrió un error al añadir el gimnasio.');
            // Mostrar notificación de error con sonner
            // Show error notification with sonner
            toast.error(processedErrorMessage);
            // Establecer el mensaje de error procesado en el estado (opcional, por si se muestra en UI)
            // Set the processed error message in the state (optional, in case it's shown in UI)
            setError(processedErrorMessage);
            // Registrar el error original en consola para depuración
            // Log the original error in console for debugging
            console.error("Error creating gym:", err);
        } finally {
            // Al finalizar (éxito o error), indicar que el envío ha terminado
            // Upon completion (success or error), indicate that submission has finished
            setIsSubmitting(false);
        }
    };

  return (
    <div style={styles.container}>
      <h2>Añadir Nuevo Gimnasio</h2>
          <form onSubmit={handleSubmit}>
        {/* Campo Nombre */}
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
            style={styles.input}
            required
          />
        </div>

        {/* Campo Dirección */}
        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.label}>
            Dirección:
          </label>
          <input
            type="text" // Podría ser textarea si prefieres más espacio
            id="address"
            name="address"
            value={address}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        {/* Campo Ciudad */}
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
            style={styles.input}
            required
          />
        </div>

        {/* Campo Latitud */}
        <div style={styles.formGroup}>
          <label htmlFor="latitude" style={styles.label}>
            Latitud:
          </label>
          <input
            type="number" // Input de tipo número
            step="any" // Permite decimales
            id="latitude"
            name="latitude"
            value={latitude}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        {/* Campo Longitud */}
        <div style={styles.formGroup}>
          <label htmlFor="longitude" style={styles.label}>
            Longitud:
          </label>
          <input
            type="number" // Input de tipo número
            step="any" // Permite decimales
            id="longitude"
            name="longitude"
            value={longitude}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        {/* Input para subir archivo de Logo */}
        <div style={styles.formGroup}>
          <label htmlFor="logoFile" style={styles.label}>
            Logo (opcional):
          </label>
          <input
            type="file"
            id="logoFile"
            name="logoFile"
            accept="image/*" // Aceptar solo imágenes /accept only images
            onChange={handleFileChange}
            style={styles.input}
          />
          {/* Previsualización del logo seleccionado */}
          {/* Preview of the selected logo */}
          {logoPreviewUrl && (
            <img
              src={logoPreviewUrl}
              alt="Previsualización del logo"
              style={styles.previewImage}
            />
          )}
        </div>

        {/*Input para subir archivo de Imagen Principal */}
        <div style={styles.formGroup}>
          <label htmlFor="mainImageFile" style={styles.label}>
            Imagen Principal (opcional):
          </label>
          <input
            type="file"
            id="mainImageFile"
            name="mainImageFile"
            accept="image/*" // Aceptar solo imágenes / acccept only images
            onChange={handleFileChange}
            style={styles.input}
          />
          {/* Previsualización de la imagen principal seleccionada */}
          {/* Preview of the selected main image */}
          {mainImagePreviewUrl && (
            <img
              src={mainImagePreviewUrl}
              alt="Previsualización imagen principal"
              style={styles.previewImage}
            />
          )}
        </div>

        {/* Mensaje de Error */}
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Botón de Envío */}
        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Añadiendo..." : "Añadir Gimnasio"}
        </button>
      </form>
    </div>
  );
};
