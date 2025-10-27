import { createContext, useContext } from "react";

// Importar la interfaz User / Import the User interface
import type { User } from "../interfaces/user-interfaces"; //

// Definir la forma/estructura de los datos que contendrá el contexto.
// Define the shape/structure of the data the context will hold.
export interface AuthContextType {
  // Almacenar el token JWT si el usuario está autenticado, o null si no.
  // Store the JWT token if the user is authenticated, or null otherwise.
  token: string | null;

  // Almacenar los datos del usuario autenticado, o null si no.
  // Store the data of the authenticated user, or null otherwise.
  user: User | null;

  // Indicar si el estado de autenticación inicial aún se está determinando (al cargar la app).
  // Indicate if the initial authentication status is still being determined (on app load).
  isLoading: boolean;

  // Función para actualizar el estado tras un inicio de sesión exitoso.
  // Function to update state after a successful login.
  login: (token: string) => Promise<void>;

  // Función para limpiar el estado de autenticación al cerrar sesión.
  // Function to clear authentication state on logout.
  logout: () => void;

  // Función para actualizar el objeto 'user' en el estado
  // Function to update the 'user' object in the state
  setUser: (user: User) => void;
}

// Crear el contexto con un valor inicial nulo (será provisto por AuthProvider).
// Create the context with a null initial value (will be provided by AuthProvider).
// Usar '!' (Non-null assertion) porque el Provider siempre dará un valor real.
// Use '!' (Non-null assertion) because the Provider will always give a real value.
export const AuthContext = createContext<AuthContextType>(null!);

// Crear un custom hook para consumir el AuthContext fácilmente.
// Create a custom hook to consume the AuthContext easily.
export const useAuth = () => {
  // Usar el hook useContext para acceder al valor del contexto.
  // Use the useContext hook to access the context value.
  const context = useContext(AuthContext);
  // Lanzar error si useAuth se usa fuera de un AuthProvider.
  // Throw an error if useAuth is used outside of an AuthProvider.
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  // Devolver el valor del contexto.
  // Return the context value.
  return context;
};
