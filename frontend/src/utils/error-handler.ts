// Importar tipos necesarios de axios / Import necessary types from axios
import axios from "axios";

// interfaz para la estructura esperada del error de la API
// interface for the expected API error structure

interface ApiErrorResponse {
  message: string;
}

/**
 * Procesar un error capturado de una llamada a la API con Axios.
 * Process a caught error from an Axios API call.
 * @param error El error capturado / The caught error object.
 * @param defaultMessage Mensaje a devolver si no se puede extraer uno específico / Message to return if a specific one cannot be extracted.
 * @returns Un mensaje de error procesado / A processed error message string.
 */
export const handleApiError = (
  error: unknown,
  defaultMessage: string = "Ocurrió un error inesperado"
): string => {
  // Mostrar siempre el error original en consola para depuración.
  // Always log the original error to console for debugging.

  console.error("API Error caught:", error);

  // Comprobar si es un error de Axios con respuesta del servidor.
  // Check if it's an Axios error with a server response.

  if (axios.isAxiosError(error) && error.response) {
    // Comprobar códigos de estado comunes para mensajes específicos.
    // Check common status codes for specific messages.

    if (error.response.status === 401 || error.response.status === 403) {
      // Limpiar el token inválido/expirado de localStorage.
      // Clear the invalid/expired token from localStorage.
      localStorage.removeItem("authToken");

      // Devolver mensaje indicando que se requiere re-autenticación.
      // Return message indicating re-authentication is needed
      return "Sesión inválida o expirada. Por favor, inicia sesión de nuevo.";
    }

    // Intentar extraer el mensaje de la propiedad 'message' en la data de la respuesta.
    // Try to extract the message from the 'message' property in the response data.

    const responseData = error.response.data as ApiErrorResponse;
    if (responseData && responseData.message) {
      return responseData.message;
    }
  }
  // Comprobar si es una instancia estándar de Error.
  // Check if it's a standard Error instance.
  else if (error instanceof Error) {
    // Devolver el mensaje del objeto Error.
    // Return the message from the Error object.

    return error.message;
  }

  // Si no se pudo extraer un mensaje específico, devolver el mensaje por defecto.
  // If a specific message couldn't be extracted, return the default message.
  return defaultMessage;
};
