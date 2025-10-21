// Importar axios para realizar peticiones HTTP.
// Import axios for making HTTP requests.
import axios from "axios";

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
    // Mostrar error detallado en consola si la petición falla.
    // Log a detailed error to the console if the request fails.

    console.error("Error fetching gyms:", error);

    // Lanzar un nuevo error para que el componente que llama pueda manejarlo.
    // Throw a new error so the calling component can handle it.

    throw new Error("No se pudieron cargar los gimnasios.");
  }
};
