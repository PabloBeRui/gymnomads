// Importar axios para realizar peticiones HTTP.
// Import axios for making HTTP requests.
import axios from "axios";

// Importar el manejador de errores centralizado.
// Import the centralized error handler.
import { handleApiError } from "../utils/error-handler";

// Interfaz Gym
// Gym interface

import type {
  Gym,
  CreateGymManagerResponse,
} from "../interfaces/gym-interfaces";

// Definir la URL base de la API para evitar repetirla.
// Define the base API URL to avoid repetition.
const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ========================================
 * API CALL: Obtener todos los gimnasios
 * API CALL: Get all gyms
 * ======================================== */

export const getAllGyms = async (): Promise<Gym[]> => {
  try {
    // Realizar petición GET al endpoint específico de gimnasios.
    // Perform a GET request to the specific gyms endpoint.

    const response = await axios.get(`${API_URL}/gyms`);

    // Devolver los datos de la respuesta (array de gimnasios).
    // Return the data from the response (array of gyms).

    return response.data;
  } catch (error) {
    // Usar el manejador centralizado con un mensaje por defecto específico para obtener gimnasios.
    // Use the centralized handler with a default message specific to fetching gyms.
    const errorMessage = handleApiError(
      error,
      "No se pudieron cargar los gimnasios."
    );
    // Lanzar un nuevo error con el mensaje procesado.
    // Throw a new error with the processed message.
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Obtener un gimnasio por ID
 * API CALL: Get gym by ID
 * ======================================== */
// Obtener un gimnasio específico por ID.
// Get a specific gym by ID.

export const getGymById = async (gymId: number): Promise<Gym> => {
  // Comprobar si se proporcionó un ID válido.
  // Check if a valid ID was provided.

  if (!gymId) {
    // Lanzar error si el ID no es válido o no se proporcionó.
    // Throw an error if the ID is invalid or not provided.

    throw new Error("Se requiere un ID de gimnasio válido.");
  }
  try {
    // Realizar petición GET al endpoint específico del gimnasio (ej. /api/gyms/123).
    // Perform a GET request to the specific gym endpoint (e.g., /api/gyms/123).

    const response = await axios.get<Gym>(`${API_URL}/gyms/${gymId}`);

    // Devolver los datos del gimnasio recibidos.
    // Return the received gym data.
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado con un mensaje por defecto específico.
    // Use the centralized handler with a specific default message.
    const errorMessage = handleApiError(
      error,
      `Error al obtener el gimnasio con ID ${gymId}.`
    );
    // Lanzar un nuevo error con el mensaje procesado.
    // Throw a new error with the processed message.
    throw new Error(errorMessage);
  }
};

/**
 * ========================================
 * API CALL: Crear un nuevo gimnasio + manager
 * API CALL: Create a new gym + manager
 * ========================================
 *
 * - Recibe FormData y el token / Receives FormData and the token
 * - No fijamos 'Content-Type' manualmente para que axios/Browser añada el boundary.
 * - We don't set 'Content-Type' manually so axios/browser can add the boundary.
 */
export const createGym = async (
  gymData: FormData,
  token: string
): Promise<CreateGymManagerResponse> => {
  try {
    const response = await axios.post<CreateGymManagerResponse>(
      `${API_URL}/gyms`,
      gymData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data; // Devuelve toda la respuesta / Return full response
  } catch (error) {
    const errorMessage = handleApiError(error, "No se pudo crear el gimnasio.");
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Eliminar un gimnasio (Admin)
 * API CALL: Delete a gym (Admin)
 * ======================================== */

export const deleteGym = async (
  gymId: number,
  token: string
): Promise<void> => {
  // Recibe el ID del gimnasio a borrar y el token
  // Receives the ID of the gym to delete and the token
  try {
    // Realizar petición DELETE al endpoint específico (/api/gyms/:id)
    // Perform DELETE request to the specific endpoint (/api/gyms/:id)
    await axios.delete(`${API_URL}/gyms/${gymId}`, {
      headers: {
        // Enviar el token de autorización para verificar permisos
        // Send the authorization token to verify permissions
        Authorization: `Bearer ${token}`,
      },
    });

    // No se devuelve nada en el cuerpo de la respuesta si tiene éxito (espera un 204)
    // Nothing is returned in the response body on success ( expect a 204)
  } catch (error) {
    // Usar el manejador centralizado para procesar el error
    // Use the centralized handler to process the error
    const errorMessage = handleApiError(
      error,
      "No se pudo eliminar el gimnasio."
    );
    // Lanzar un nuevo error con el mensaje procesado para que el componente lo capture
    // Throw a new error with the processed message for the component to catch
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Actualizar datos de texto de un gimnasio (Admin)
 * API CALL: Update text data of a gym (Admin)
 * ======================================== */
// Definir la interfaz para los datos de texto a actualizar
// Define the interface for the text data to update
interface GymUpdateData {
  name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}
// Definir la función asíncrona updateGymDetails
// Define the async updateGymDetails function
export const updateGymDetails = async (
  gymId: number | string,
  data: Partial<GymUpdateData>,
  token: string
): Promise<Gym> => {
  // Recibe ID, datos parciales y token // Receives ID, partial data, and token
  try {
    // Realizar petición PUT al endpoint específico (/api/gyms/:id)
    // Perform PUT request to the specific endpoint (/api/gyms/:id)
    const response = await axios.put(`${API_URL}/gyms/${gymId}`, data, {
      headers: {
        "Content-Type": "application/json", // Enviar datos como JSON // Send data as JSON
        Authorization: `Bearer ${token}`,
      },
    });
    // Devolver los datos actualizados del gimnasio (si la API los devuelve)
    // Return the updated gym data (if the API returns them)
    return response.data; // Asumiendo que la API devuelve el gimnasio actualizado o un mensaje
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "No se pudieron actualizar los detalles del gimnasio."
    );
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Actualizar/Subir logo de un gimnasio (Admin/Manager)
 * API CALL: Update/Upload gym logo (Admin/Manager)
 * ======================================== */

export const updateGymLogo = async (
  gymId: number | string,
  logoFile: File,
  token: string
): Promise<{ message: string; filePath: string }> => {
  // Recibe ID, archivo y token // Receives ID, file, and token
  const formData = new FormData();
  formData.append("logo", logoFile); // La clave 'logo' debe coincidir con Multer y createUploadHandler // Key 'logo' must match Multer and createUploadHandler

  try {
    // Realizar petición POST al endpoint de subida de logo (/api/gyms/:id/logo)
    // Perform POST request to the logo upload endpoint (/api/gyms/:id/logo)
    const response = await axios.post(
      `${API_URL}/gyms/${gymId}/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Necesario para archivos // Necessary for files
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Devolver la respuesta (mensaje y ruta del archivo)
    // Return the response (message and file path)
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "No se pudo actualizar el logo del gimnasio."
    );
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Actualizar/Subir imagen principal de un gimnasio (Admin/Manager)
 * API CALL: Update/Upload gym main image (Admin/Manager)
 * ======================================== */
// Definir la función asíncrona updateGymMainImage
// Define the async updateGymMainImage function
export const updateGymMainImage = async (
  gymId: number | string,
  mainImageFile: File,
  token: string
): Promise<{ message: string; filePath: string }> => {
  // Recibe ID, archivo y token // Receives ID, file, and token
  const formData = new FormData();
  formData.append("mainImage", mainImageFile); // La clave 'mainImage' debe coincidir con Multer // Key 'mainImage' must match Multer

  try {
    // Realizar petición POST al endpoint de subida de imagen principal (/api/gyms/:id/image)
    // Perform POST request to the main image upload endpoint (/api/gyms/:id/image)
    const response = await axios.post(
      `${API_URL}/gyms/${gymId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Devolver la respuesta
    // Return the response
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "No se pudo actualizar la imagen principal del gimnasio."
    );
    throw new Error(errorMessage);
  }
};
