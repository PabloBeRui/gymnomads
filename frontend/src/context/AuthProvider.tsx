import { useState, useEffect } from "react";
import type { ReactNode } from "react";

// Importar hook de navegación / Import navigation hook
import { useNavigate } from "react-router-dom"; //

// Importar el contexto desde el archivo separado.
// Import the context from the separate file.
import { AuthContext } from "./AuthContext";
// Importar la interfaz User / Import the User interface
import type { User } from "../interfaces/user-interfaces";

// Notificaciones / Notifications
import { toast } from "sonner";

//Importar la función del servicio para obtener el profile / Import service function to get profile
import { getUserProfile } from "../services/user-services";

// Importar la utilidad centralizada para manejar errores de API.
// Import the centralized utility for handling API errors.
import { handleApiError } from "../utils/error-handler";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Spinner } from "react-bootstrap";

// Definir las props que recibirá el componente Provider (los componentes hijos).
// Define the props for the Provider component (children components).
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * =============================================================================
 * COMPONENTE: AuthProvider
 * COMPONENT: AuthProvider
 * =============================================================================
 *
 * Proveedor de contexto de autenticación para la aplicación.
 * Gestiona el estado del token de autenticación y los datos del usuario,
 * y proporciona funciones para iniciar y cerrar sesión.
 * Refactorizado para usar React-Bootstrap Spinner.
 *
 * Authentication context provider for the application.
 * Manages the authentication token state and user data,
 * and provides functions for logging in and out.
 * Refactored to use React-Bootstrap Spinner.
 *
 * =============================================================================
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Obtener función para navegar / Get function to navigate
  const navigate = useNavigate();

  // --- Estados Internos del Provider --- / --- Internal Provider States ---

  // Crear useState para el token, leyendo valor inicial de localStorage.
  // Create useState for the token, reading the initial value from localStorage.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("authToken")
  );
  // Crear useState para los datos del usuario.
  // Create useState for the user data.
  const [user, setUser] = useState<User | null>(null);
  // Crear useState para indicar si se está comprobando el token inicial.
  // Create useState to indicate if the initial token check is in progress.
  const [isLoading, setIsLoading] = useState<boolean>(true); // Empezar en true / Start as true

  // --- Efecto Inicial para Comprobar Token --- / --- Initial Effect to Check Token ---

  // Ejecutar useEffect una vez al montar para comprobar el estado inicial de autenticación.
  // Run useEffect once on mount to check the initial authentication status.
  useEffect(() => {
    // Definir función asíncrona para verificar el token.
    // Define an async function to verify the token.
    const checkAuthStatus = async () => {
      // El token ya se leyó en el useState inicial.
      // The token was already read in the initial useState.
      if (token) {
        try {
          // Llamar a la API para obtener los datos del usuario usando el token.
          // Call the API to get user data using the token.
          console.log("AuthProvider: Verificando token y obteniendo perfil...");
          const userData = await getUserProfile(token); // <--- LLAMADA REAL / ACTUAL CALL
          setUser(userData); // Guardar los datos del usuario en el estado / Save user data in state
          console.log(
            "AuthProvider: Token verificado, datos de usuario cargados:",
            userData
          );
        } catch (error) {
          // Si getUserProfile falla (ej. token expirado), handleApiError limpiará el token.
          // If getUserProfile fails (e.g., expired token), handleApiError will clear the token.
          console.error(
            "AuthProvider: Error al verificar token/obtener perfil:",
            error
          );
          handleApiError(error); // Procesar error (limpia token si es 401/403) / Process error (clears token if 401/403)
          // Asegurarse de limpiar estados locales si handleApiError limpió el token.
          // Ensure local states are cleared if handleApiError cleared the token.
          if (!localStorage.getItem("authToken")) {
            setToken(null);
            setUser(null);
          }
          // redirigir a login si falla la verificación inicial del token
          // redirect to login if the initial token verification fails
          navigate("/login");
        }
      } else {
        // Registrar que no se encontró token.
        // Log that no token was found.
        console.log(
          "AuthProvider: No se encontró token en localStorage al inicio."
        );
      }
      // Marcar la comprobación inicial como terminada.
      // Mark the initial check as finished.
      setIsLoading(false);
    };

    // Invocar la función de comprobación.
    // Invoke the check function.
    checkAuthStatus();
    // Deshabilitar regla exhaustive-deps: Este efecto solo debe ejecutarse al montar para la comprobación inicial del token no si cambia.
    // Disable exhaustive-deps rule: This effect should only run on mount for the initial token check not if change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío asegura una única ejecución al montar. / Empty array ensures single execution on mount.

  // --- Funciones de Autenticación (Proporcionadas por el Contexto) --- / --- Authentication Functions (Provided by Context) ---

  // Definir función asíncrona para manejar el login.
  // Define async function to handle login.
  const login = async (newToken: string) => {
    try {
      // PASO 1: Guardar el token en localStorage y estado / STEP 1: Save token in localStorage and state
      setToken(newToken);
      localStorage.setItem("authToken", newToken);

      // PASO 2: Obtener datos del usuario pasando el token como parámetro / STEP 2: Get user data passing token as parameter
      const userData = await getUserProfile(newToken);

      // Actualizar estado del usuario / Update user state
      setUser(userData);
    } catch (error) {
      // Registrar error en desarrollo / Log error in development
      if (import.meta.env.DEV) {
        console.error(
          "AuthProvider: Error al obtener perfil tras login:",
          error
        );
      }

      // Limpiar todo si falla la autenticación / Clear everything if authentication fails
      setUser(null);
      setToken(null);
      localStorage.removeItem("authToken");

      // Re-lanzar el error para que el componente que llama lo maneje / Re-throw error for calling component to handle
      throw error;
    }
  };

  // Definir función para manejar el logout.
  // Define function to handle logout.
  const logout = () => {
    // Eliminar token de localStorage.
    // Remove token from localStorage.
    localStorage.removeItem("authToken");
    // Limpiar useState del token.
    // Clear token useState.
    setToken(null);
    // Limpiar useState del usuario.
    // Clear user useState.
    setUser(null);
    console.log("AuthProvider: Usuario deslogueado, token eliminado.");
    // Mostrar notificación de éxito / Show success notification
    toast.success("Sesión cerrada correctamente."); //
    // Redirigir a la página de inicio. / Redirect to the home page.
    navigate("/"); //
  };

  // Crear el objeto 'value' que agrupa estado y funciones.
  // Create the 'value' object grouping state and functions.
  const contextValue = {
    token,
    user,
    isLoading,
    login,
    logout,
    setUser,
  };

  // --- Renderizado del Provider --- / --- Provider Rendering ---

  // Devolver el Provider del contexto, pasando el 'value'.
  // Return the context Provider, passing the 'value'.
  // Renderizar hijos solo cuando la carga inicial haya terminado para evitar parpadeos.
  // Render children only when initial loading is finished to avoid flickering.
  return (
    <AuthContext.Provider value={contextValue}>
      {
        !isLoading ? (
          children
        ) : (
          <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando sesión...</span>
            </Spinner>
          </div>
        )
      }
    </AuthContext.Provider>
  );
};
