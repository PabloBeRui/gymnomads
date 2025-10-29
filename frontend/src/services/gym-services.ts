// Importar axios para realizar peticiones HTTP.
// Import axios for making HTTP requests.
import axios from "axios";

// Importar el manejador de errores centralizado.
// Import the centralized error handler.
import { handleApiError } from "../utils/error-handler";

// Interfaz Gym
// Gym interface

import type { Gym } from "../interfaces/gym-interfaces";

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

/* ========================================
 * API CALL: Crear un nuevo gimnasio
 * API CALL: Create a new gym
 * ======================================== */

// Recibe FormData y el token // Receives FormData and the token
export const createGym = async (
  gymData: FormData,
  token: string
): Promise<Gym> => {
  try {
    // Realizar petición POST al endpoint de gimnasios (/api/gyms)
    // Perform POST request to the gyms endpoint (/api/gyms)
    const response = await axios.post(`${API_URL}/gyms`, gymData, {
      headers: {
        // Importante: 'Content-Type': 'multipart/form-data' es necesario para enviar archivos con FormData
        // Important: 'Content-Type': 'multipart/form-data' is necessary to send files with FormData
        "Content-Type": "multipart/form-data",
        // Enviar el token de autorización para verificar permisos
        // Send the authorization token to verify permissions
        Authorization: `Bearer ${token}`,
      },
    });

    // Devolver los datos del gimnasio creado (según lo que devuelva la API)
    // Return the data of the created gym (according to what the API returns)
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado para procesar el error
    // Use the centralized handler to process the error
    const errorMessage = handleApiError(
      `No se pudo crear el gimnasio. Error ${error}`
    );
    // Lanzar un nuevo error con el mensaje procesado para que el componente lo capture
    // Throw a new error with the processed message for the component to catch
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
