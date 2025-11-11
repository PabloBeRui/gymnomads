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
import type {
  CreateVisitResponse,
  VisitWithDetails,
  VisitsFilters,
} from "../interfaces/visit-interfaces";

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
 * API CALL: Obtener las visitas del usuario actual
 * API CALL: Get current user's visits
 * ======================================== */

export const getMyVisits = async (
  token: string,
  gymName?: string
): Promise<VisitWithDetails[]> => {
  try {
    // Construir query params si hay filtros
    const params = new URLSearchParams();
    if (gymName) {
      params.append("gym_name", gymName);
    }
    const queryString = params.toString();
    const url = `${API_URL}/visits/my-visits${
      queryString ? `?${queryString}` : ""
    }`;

    // Realizar petición GET al endpoint de visitas del usuario.
    const response = await axios.get<VisitWithDetails[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Devolver los datos de las visitas.
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado.
    const errorMessage = handleApiError(
      error,
      "No se pudieron cargar las visitas."
    );
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Obtener todas las visitas (Admin)
 * API CALL: Get all visits (Admin)
 * ======================================== */

export const getAllVisits = async (
  token: string,
  filters?: VisitsFilters
): Promise<VisitWithDetails[]> => {
  try {
    // Construir query params si hay filtros
    // Build query params if there are filters
    const params = new URLSearchParams();

    if (filters?.gym_id) {
      params.append("gym_id", filters.gym_id.toString());
    }
    if (filters?.user_search) {
      params.append("user_search", filters.user_search);
    }
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }

    const queryString = params.toString();
    const url = `${API_URL}/visits${queryString ? `?${queryString}` : ""}`;

    // Realizar petición GET al endpoint de visitas
    // Perform GET request to the visits endpoint
    const response = await axios.get<VisitWithDetails[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Devolver los datos de las visitas
    // Return the visits data
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "No se pudieron cargar las visitas."
    );
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Obtener visitas del gimnasio del manager
 * API CALL: Get manager's gym visits
 * ======================================== */

export const getManagerGymVisits = async (
  token: string,
  filters?: Omit<VisitsFilters, "gym_id"> // Manager no puede filtrar por gym_id / Manager cannot filter by gym_id
): Promise<VisitWithDetails[]> => {
  try {
    // Construir query params si hay filtros
    // Build query params if there are filters
    const params = new URLSearchParams();

    if (filters?.user_search) {
      params.append("user_search", filters.user_search);
    }
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }

    const queryString = params.toString();
    const url = `${API_URL}/visits/my-gym${
      queryString ? `?${queryString}` : ""
    }`;

    // Realizar petición GET al endpoint de visitas del gimnasio del manager
    // Perform GET request to the manager's gym visits endpoint
    const response = await axios.get<VisitWithDetails[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Devolver los datos de las visitas
    // Return the visits data
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "No se pudieron cargar las visitas del gimnasio."
    );
    throw new Error(errorMessage);
  }
};
