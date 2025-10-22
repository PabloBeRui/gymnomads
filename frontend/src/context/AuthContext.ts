import { createContext, useContext } from 'react';

// TODO: Importar la interfaz User cuando se defina / Import the User interface when defined
// import type { User } from '../interfaces/user-interfaces';

// Definir la forma/estructura de los datos que contendrá el contexto.
// Define the shape/structure of the data the context will hold.
export interface AuthContextType {
  token: string | null; // El token JWT o null / The JWT token or null
  user: any | null;     // TODO: Cambiar 'any' por 'User' / Change 'any' to 'User'
  isLoading: boolean;   // ¿Comprobando token inicial? / Checking initial token?
  // Función para iniciar sesión / Function to log in
  login: (token: string, userData?: any /* TODO: User */) => void; 
  // Función para cerrar sesión / Function to log out
  logout: () => void;   
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