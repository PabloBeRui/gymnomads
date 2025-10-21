// Importar axios para realizar peticiones HTTP.
// Import axios for making HTTP requests.
import axios from "axios";

// Interfaz para los datos de registro .
// Registration data interface

import type { RegisterData } from "../interfaces/user-interfaces";
import type { RegisterResponse } from "../interfaces/user-interfaces";

// Definir la URL base de la API.
// Define the base API URL.

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ========================================
 * API CALL: Registrar un nuevo usuario
 * API CALL: Register a new user
 * ======================================== */

// Recibe los datos del formulario (RegisterData) y devuelve la respuesta del backend.
// Receives form data (RegisterData) and returns the backend response.

export const registerUser = async (
  userData: RegisterData
): Promise<RegisterResponse> => {
  try {
    // petición POST al endpoint '/users/register' enviando los datos.
    //  POST request to the '/users/register' endpoint sending the data.
    const response = await axios.post(`${API_URL}/users/register`, userData);

    // Devolver los datos recibidos en la respuesta del servidor.
    // Return the data received in the server response.
    return response.data;
  } catch (error) {
    // Mostrar error detallado en consola para depuración.
    // Log detailed error to console for debugging.
    console.error("Error registrando user:", error);

    // Intentar obtener un mensaje de error más específico de la respuesta del backend.
    // Try to get a more specific error message from the backend response.
    let errorMessage = "Error al registrar. Inténtalo de nuevo.";

    if (axios.isAxiosError(error) && error.response?.data?.message) {
      // Usar el mensaje de error proporcionado por la API si está disponible.
      // Use the error message provided by the API if available.
      errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
      // Usar el mensaje del objeto Error estándar si existe.
      // Use the standard Error object message if it exists.
      errorMessage = error.message;
    }

    // Lanzar un nuevo error con el mensaje procesado para que el componente lo capture.
    // Throw a new error with the processed message for the component to catch.
    throw new Error(errorMessage);
  }
};
