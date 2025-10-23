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

// TODO Importar la función del servicio para obtener el perfil / Import service function to get profile
// import { getUserProfile } from '../services/user-services';

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
        // TODO: Verificar token con API ('/api/users/profile') y obtener datos de usuario.
        // TODO: Verify token with API ('/api/users/profile') and get user data.
        // Por ahora, solo registrar que se encontró.
        // For now, just log that it was found.
        console.log(
          "AuthProvider: Token encontrado en localStorage al inicio."
        );
        // Si la verificación fuera exitosa, aquí llamaríamos a:
        // If verification were successful, we would call:
        // setUser(datosDelUsuarioDeLaApi);
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

  // Definir función para manejar el login.
  // Define function to handle login.
  const login = (newToken: string, userData?: User) => {
    // Guardar token en localStorage.
    // Save token in localStorage.
    localStorage.setItem("authToken", newToken);
    // Actualizar useState del token.
    // Update token useState.
    setToken(newToken);
    // Actualizar useState del usuario (si se proporcionan datos).
    // Update user useState (if data is provided).
    setUser(userData || null);
    console.log("AuthProvider: Usuario logueado, token guardado.");
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
