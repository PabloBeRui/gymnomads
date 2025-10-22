/* ========================================
 * Interfaz para datos de Registro de Usuario
 * Interface for User Registration Data
 * ======================================== */

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string | null; // Opcional / Optional
  home_gym_id: number;
  profile_picture?: File | null;
}

/* ========================================
 * Interfaz para la Respuesta del Registro
 * Interface for Registration Response
 * ======================================== */
// Exportar interfaz para la respuesta recibida al registrar un usuario con éxito.
// Export interface for the response received upon successful user registration.
export interface RegisterResponse {
  message: string;
  userId: number;
}

/* ========================================
 * Interfaz para datos de Login de Usuario
 * Interface for User Login Data
 * ======================================== */
// Exportar interfaz para los datos enviados durante el login.
// Export interface for the data sent during login.
export interface LoginData {
  email: string;
  password: string;
}

/* ========================================
 * Interfaz para la Respuesta del Login
 * Interface for Login Response
 * ======================================== */
// Exportar interfaz para la respuesta recibida al iniciar sesión con éxito.
// Export interface for the response received upon successful login.
export interface LoginResponse {
  message: string;
  token: string; // Asumimos que el backend devuelve un token JWT
  // Podría incluir también datos del usuario si el backend los devuelve
  // Could also include user data if the backend returns it
  // user?: User;
}
