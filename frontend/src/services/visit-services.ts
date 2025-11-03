/**
 * =============================================================================
 * SERVICIO: visit-services
 * =============================================================================
 * 
 * Funciones para interactuar con el backend relacionadas con visitas a gimnasios.
 * Functions to interact with the backend related to gym visits.
 * 
 * =============================================================================
 */

// Importar axios para realizar peticiones HTTP.
// Import axios for making HTTP requests.
import axios from "axios";

// Importar el manejador de errores centralizado.
// Import the centralized error handler.
import { handleApiError } from "../utils/error-handler";

// Importar interfaces de visitas
// Import visit interfaces
import type { Visit, CreateVisitResponse } from "../interfaces/visit-interfaces";

// Definir la URL base de la API para evitar repetirla.
// Define the base API URL to avoid repetition.
const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ========================================
 * API CALL: Crear una nueva visita
 * API CALL: Create a new visit
 * ======================================== */

export const createVisit = async (
  gymId: number,
  token: string
): Promise<CreateVisitResponse> => {
  // Comprobar si se proporcionó un ID válido.
  // Check if a valid ID was provided.
  if (!gymId) {
    throw new Error("Se requiere un ID de gimnasio válido.");
  }

  try {
    // Realizar petición POST al endpoint de visitas.
    // Perform POST request to the visits endpoint.
    const response = await axios.post<CreateVisitResponse>(
      `${API_URL}/visits`,
      { gym_id: gymId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Devolver los datos de la visita creada.
    // Return the created visit data.
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado con un mensaje por defecto específico.
    // Use the centralized handler with a specific default message.
    const errorMessage = handleApiError(
      error,
      "No se pudo registrar la visita."
    );
    // Lanzar un nuevo error con el mensaje procesado.
    // Throw a new error with the processed message.
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Obtener visitas del usuario actual
 * API CALL: Get current user's visits
 * ======================================== */

export const getUserVisits = async (token: string): Promise<Visit[]> => {
  try {
    // Realizar petición GET al endpoint de visitas del usuario.
    // Perform GET request to the user visits endpoint.
    const response = await axios.get<Visit[]>(`${API_URL}/visits/my-visits`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Devolver los datos de las visitas.
    // Return the visits data.
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado.
    // Use the centralized handler.
    const errorMessage = handleApiError(
      error,
      "No se pudieron cargar las visitas."
    );
    throw new Error(errorMessage);
  }
};