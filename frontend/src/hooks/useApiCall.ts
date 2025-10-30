// Importar hooks de React / Import React hooks
import { useState } from "react";
// Importar el manejador centralizado de errores / Import the centralized error handler
import { handleApiError } from "../utils/error-handler";

// Definir y exportar el hook personalizado para manejar llamadas API / Define and export the custom hook to handle API calls
// <T = unknown>: Parámetro de tipo genérico con 'unknown' como valor por defecto / Generic type parameter with 'unknown' as default
export const useApiCall = <T = unknown>(defaultErrorMsg?: string) => {
  // Crear useState para controlar el estado de carga / Create useState to control loading state
  const [loading, setLoading] = useState(false);
  // Crear useState para almacenar mensajes de error / Create useState to store error messages
  const [error, setError] = useState<string | null>(null);
  // Crear useState para almacenar los datos de respuesta / Create useState to store response data
  const [data, setData] = useState<T | null>(null);

  // Definir función para ejecutar llamadas API con soporte para tipo genérico por llamada / Define function to execute API calls with support for generic type per call
  const execute = async <R = T>(
    apiCall: () => Promise<R>,
    errorMsg = defaultErrorMsg
  ): Promise<R> => {
    setError(null); // Limpiar errores previos / Clear previous errors
    setLoading(true); // Activar estado de carga / Activate loading state
    try {
      // Ejecutar la llamada API / Execute the API call
      const result = await apiCall();
      // Guardar el resultado en el estado (casting a T para compatibilidad) / Save the result in state (casting to T for compatibility)
      setData(result as unknown as T);
      // Devolver el resultado con su tipo específico / Return the result with its specific type
      return result;
    } catch (err) {
      // Usar el manejador centralizado para obtener el mensaje de error / Use centralized handler to get error message
      const message = handleApiError(err, errorMsg);
      // Actualizar el estado de error / Update error state
      setError(message);
      // Re-lanzar el error para manejo adicional si es necesario / Re-throw error for additional handling if needed
      throw err;
    } finally {
      // Desactivar estado de carga / Deactivate loading state
      setLoading(false);
    }
  };

  // Definir función para limpiar errores / Define function to clear errors
  const resetError = () => setError(null);

  // Definir función para reiniciar todo el estado / Define function to reset all state
  const reset = () => {
    setError(null);
    setData(null);
    setLoading(false);
  };

  // Devolver el estado y las funciones / Return state and functions
  return { loading, error, data, execute, resetError, reset };
};