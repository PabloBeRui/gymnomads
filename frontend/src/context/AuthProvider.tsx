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

// Definir las props que recibirá el componente Provider (los componentes hijos).
// Define the props for the Provider component (children components).
interface AuthProviderProps {
  children: ReactNode;
}

//  AuthProvider component.

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Obtener función para navegar / Get function to navigate
  const navigate = useNavigate();

  // --- Estados Internos del Provider ---

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

  // --- Efecto Inicial para Comprobar Token ---

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
          handleApiError(error); // Procesar error (limpia token si es 401/403)
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

  // --- Funciones de Autenticación (Proporcionadas por el Contexto) ---

  // Definir función asíncrona para manejar el login.
  // Define async function to handle login.
  const login = async (newToken: string): Promise<void> => {
    // Guardar token en localStorage.
    // Save token in localStorage.
    localStorage.setItem("authToken", newToken);
    // Actualizar useState del token.
    // Update token useState.
    setToken(newToken);
    // Limpiar estado user previo (para evitar mostrar datos incorrectos brevemente).
    // Clear previous user state (to avoid briefly showing incorrect data).
    setUser(null);

    try {
      // Esperar a obtener los datos del perfil del usuario usando el nuevo token.
      // Wait to get user profile data using the new token.
      const userData = await getUserProfile(newToken);
      // Actualizar useState user con los datos reales obtenidos.
      // Update user useState with the actual fetched data.
      setUser(userData);
      // log éxito y datos cargados en consola para depuración.
      // Log success and loaded data in console for debugging.
      console.log("AuthProvider: Usuario logueado, token guardado.", userData);
    } catch (error) {
      // Si falla la carga del perfil justo después del login, log error
      // If loading the profile right after login fails, log error
      console.error("AuthProvider: Error al obtener perfil tras login:", error);

      // Procesar error (puede limpiar token si es 401/403).
      // Process error (may clear token if 401/403).
      handleApiError(error);
      // Forzar logout si no se pudieron cargar los datos esenciales del usuario al comprobar si handleApiError limpió el token
      // Force logout if essential user data couldn't be loaded? It's an option to Check if handleApiError cleared the token
      if (!localStorage.getItem("authToken")) {
        setToken(null);
      }
      // Asegurar que user quede null si falla la carga.
      // Ensure user remains null if loading fails.
      setUser(null);
      // Mostrar notificación de error al usuario.
      // Show error notification to the user.
      toast.error("Error al cargar los datos del usuario después del login.");
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
  };

  // --- Renderizado del Provider ---

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
          <div>Cargando sesión...</div>
        ) /* //TODO futuro Spinner */
      }
    </AuthContext.Provider>
  );
};
