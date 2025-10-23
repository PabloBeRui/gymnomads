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
