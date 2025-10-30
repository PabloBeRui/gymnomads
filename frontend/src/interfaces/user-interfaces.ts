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
  token: string;
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
}

/* ========================================
 * Interfaz para el objeto Usuario
 * Interface for the User object
 * ======================================== */
// Exportar interfaz para representar un usuario autenticado.
// Export interface to represent an authenticated user.
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  profile_picture?: string | null; // Asumimos URL de la imagen / Assume image URL
  home_gym_id: number;
  registered_at: string; // O Date / Or Date
  role: string;
}

/* ========================================
 * Interfaz para Datos de Actualización de Perfil
 * Interface for Profile Update Data
 * ======================================== */
// Exportar interfaz para los datos enviados al actualizar el perfil.
// Export interface for the data sent when updating the profile.
export interface UpdateUserData {
  first_name: string;
  last_name: string;
  phone?: string | null; // Opcional / Optional
}

/* ========================================
 * Interfaz para la respuesta de subida de imagen
 * Interface for image upload response
 * ======================================== */
//  /
export interface UploadProfilePictureResponse {
  message: string;
  filePath: string;
}

/* ========================================
 * Interfaz para la respuesta de actualización de perfil
 * Interface for profile update response
 * ======================================== */

export interface UpdateProfileResponse {
  message: string;
  user?: User;
}
