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
