import { Navigate, Outlet } from "react-router-dom";
// Importar el hook de autenticación / Import the authentication hook
import { useAuth } from "../context/AuthContext";

// Definir las props  / Define props
interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  // Obtener el estado de autenticación del contexto.
  // Get the authentication state from the context.
  const { token, isLoading, user } = useAuth();

  // Mostrar estado de carga mientras se verifica el token inicial.
  // Show loading state while the initial token check is in progress.
  if (isLoading) {
    // esperar a que termine la carga inicial antes de decidir.
    //  wait for the initial load to finish before deciding.
    return <div>Verificando autenticación...</div>; // TODO Spinner
  }

  // Comprobar si hay token después de la carga inicial.
  // Check if there is a token after the initial load.

  if (!token) {
    // Si no hay token, redirigir al usuario a la página de login.
    // If there is no token, redirect the user to the login page.

    // 'replace' evita que la ruta protegida quede en el historial del navegador.
    // 'replace' prevents the protected route from being added to the browser history.
    return <Navigate to="/login" replace />;
  }

  // Añadir comprobación de roles  'allowedRoles'
  //  Add role checking 'allowedRoles'

  // Proteger includes de undefined y user null
  if (allowedRoles?.length) {
    const role = user?.role ?? null;
    if (!role || !allowedRoles.includes(role)) {
      console.warn(
        `Acceso denegado: Usuario con rol '${
          role ?? "desconocido"
        }' intentó acceder a ruta para '${allowedRoles.join(", ")}'`
      );
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Si hay token (y pasa la comprobación de roles, si la hubiera), renderizar el contenido anidado.
  // If there is a token (and role check passes, if any), render the nested content.
  // <Outlet /> renderiza el componente hijo definido en la configuración de rutas (en App.tsx).
  // <Outlet /> renders the child component defined in the route configuration (in App.tsx).
  return <Outlet />;
};
