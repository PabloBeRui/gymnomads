/**
 * =============================================================================
 * CUSTOM HOOK: useApiCall
 * =============================================================================
 * 
 * Hook genérico para manejar llamadas a la API con estado de carga y errores.
 * Generic hook to handle API calls with loading state and error handling.
 * 
 * Características / Features:
 * - Estado de carga automático / Automatic loading state
 * - Manejo centralizado de errores / Centralized error handling
 * - Almacena datos de respuesta / Stores response data
 * - Estado de error detallado / Detailed error state
 * - Funciones de reset / Reset functions
 * - Tipado genérico con TypeScript / Generic TypeScript typing
 * - Reutilizable en toda la app / Reusable across the app
 * 
 * Casos de uso / Use cases:
 * - Llamadas a APIs / API calls
 * - Subida de archivos / File uploads
 * - Peticiones con estado de carga / Requests with loading state
 * - Manejo de errores centralizado / Centralized error handling
 * =============================================================================
 */

// Importar hooks de React / Import React hooks
import { useState } from "react";

// Importar el manejador centralizado de errores / Import the centralized error handler
import { handleApiError } from "../utils/error-handler";

/**
 * =============================================================================
 * HOOK: useApiCall
 * =============================================================================
 * 
 * Hook genérico para manejar llamadas a APIs con estado completo.
 * Generic hook to handle API calls with complete state management.
 * 
 * @template T - Tipo de dato por defecto que retorna la API / Default type of data returned by API
 * @param defaultErrorMsg - Mensaje de error por defecto / Default error message
 * @returns Objeto con estado y funciones / Object with state and functions
 * 
 * Ejemplo de uso básico / Basic usage example:
 * ```typescript
 * const { loading, error, data, execute } = useApiCall<User[]>(
 *   "Error al obtener usuarios"
 * );
 * 
 * const handleGetUsers = async () => {
 *   try {
 *     const users = await execute(() => getAllUsers());
 *     console.log('Usuarios:', users);
 *   } catch (err) {
 *     console.error('Error capturado:', err);
 *   }
 * };
 * ```
 * 
 * Ejemplo con tipo específico por llamada / Example with specific type per call:
 * ```typescript
 * const { execute } = useApiCall("Error en la operación");
 * 
 * // Primera llamada retorna User
 * const user = await execute<User>(() => getUserById(1));
 * 
 * // Segunda llamada retorna Gym[]
 * const gyms = await execute<Gym[]>(() => getAllGyms());
 * ```
 * =============================================================================
 */
export const useApiCall = <T = unknown>(defaultErrorMsg?: string) => {
  // --- Estados del Hook / Hook States ---
  
  // Controlar el estado de carga / Control loading state
  const [loading, setLoading] = useState(false);
  
  // Almacenar mensajes de error / Store error messages
  const [error, setError] = useState<string | null>(null);
  
  // Almacenar los datos de respuesta / Store response data
  const [data, setData] = useState<T | null>(null);

  /**
   * =============================================================================
   * FUNCIÓN: execute
   * =============================================================================
   * 
   * Ejecuta una llamada API con manejo automático de estados.
   * Executes an API call with automatic state management.
   * 
   * @template R - Tipo específico de retorno para esta llamada / Specific return type for this call
   * @param apiCall - Función que retorna una Promise / Function that returns a Promise
   * @param errorMsg - Mensaje de error específico (opcional) / Specific error message (optional)
   * @returns Promise con los datos tipados / Promise with typed data
   * @throws Re-lanza el error original / Re-throws the original error
   * 
   * Flujo / Flow:
   * 1. Limpiar errores previos / Clear previous errors
   * 2. Activar loading / Activate loading
   * 3. Ejecutar llamada API / Execute API call
   * 4. Guardar resultado / Save result
   * 5. Manejar errores si ocurren / Handle errors if they occur
   * 6. Desactivar loading / Deactivate loading
   * =============================================================================
   */
  const execute = async <R = T>(
    apiCall: () => Promise<R>,
    errorMsg = defaultErrorMsg
  ): Promise<R> => {
    // Limpiar errores previos / Clear previous errors
    setError(null);
    
    // Activar estado de carga / Activate loading state
    setLoading(true);
    
    try {
      // Ejecutar la llamada API / Execute the API call
      const result = await apiCall();
      
      // Guardar el resultado en el estado (casting a T para compatibilidad)
      // Save the result in state (casting to T for compatibility)
      setData(result as unknown as T);
      
      // Devolver el resultado con su tipo específico / Return the result with its specific type
      return result;
    } catch (err) {
      // Usar el manejador centralizado para obtener el mensaje de error
      // Use centralized handler to get error message
      const message = handleApiError(err, errorMsg);
      
      // Actualizar el estado de error / Update error state
      setError(message);
      
      // Re-lanzar el error para manejo adicional si es necesario
      // Re-throw error for additional handling if needed
      throw err;
    } finally {
      // Desactivar estado de carga / Deactivate loading state
      setLoading(false);
    }
  };

  /**
   * =============================================================================
   * FUNCIÓN: resetError
   * =============================================================================
   * 
   * Limpia el estado de error.
   * Clears the error state.
   * 
   * Útil para limpiar errores antes de un retry o después de mostrar un mensaje.
   * Useful to clear errors before a retry or after showing a message.
   * =============================================================================
   */
  const resetError = () => setError(null);

  /**
   * =============================================================================
   * FUNCIÓN: reset
   * =============================================================================
   * 
   * Reinicia todo el estado del hook a sus valores iniciales.
   * Resets all hook state to initial values.
   * 
   * Útil cuando se cambia de componente o se quiere limpiar todo el estado.
   * Useful when changing components or wanting to clear all state.
   * =============================================================================
   */
  const reset = () => {
    setError(null);
    setData(null);
    setLoading(false);
  };

  // Devolver el estado y las funciones / Return state and functions
  return { 
    loading, 
    error, 
    data, 
    execute, 
    resetError, 
    reset 
  };
};