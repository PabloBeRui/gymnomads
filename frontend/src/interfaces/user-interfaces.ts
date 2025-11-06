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
  token: string; // Asumimos que el backend devuelve un token JWT / We assume backend returns a JWT token
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
  profile_picture?: string | null; // URL de la imagen de perfil / Profile picture URL
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
 * Interfaz para Datos de Actualización de Manager (Admin)
 * Interface for Manager Update Data (Admin)
 * ======================================== */
// Exportar interfaz para los datos enviados al actualizar un manager.
// Export interface for the data sent when updating a manager.
// NOTA: El email NO se puede actualizar (está vinculado al gimnasio)
// NOTE: Email CANNOT be updated (it's linked to the gym)
export interface UpdateManagerData {
  first_name: string;
  last_name: string;
  phone?: string | null; // Opcional / Optional
}

/* ========================================
 * Interfaz para la respuesta de subida de imagen
 * Interface for image upload response
 * ======================================== */
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

/* ========================================
 * Interfaces para Gestión de Usuarios y Managers (Admin/Manager Views)
 * Interfaces for User and Manager Management (Admin/Manager Views)
 * ======================================== */

/* ========================================
 * Interfaz para Usuario con información del Gimnasio (Admin/Manager)
 * Interface for User with Gym information (Admin/Manager)
 * ======================================== */
// Usado en UsersManagementPage para mostrar usuarios con datos del gimnasio
// Used in UsersManagementPage to display users with gym data
export interface UserWithGym {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_picture: string | null; // Foto de perfil del usuario / User's profile picture
  role: string;
  home_gym_id: number;
  registered_at: string;
  gym_name: string;
}

/* ========================================
 * Interfaz para Manager con información completa del Gimnasio (Admin)
 * Interface for Manager with complete Gym information (Admin)
 * ======================================== */
// Usado en ManagersManagementPage para mostrar managers con datos completos del gimnasio
// Used in ManagersManagementPage to display managers with complete gym data
export interface ManagerWithGym {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_picture: string | null; // Foto de perfil del manager / Manager's profile picture
  home_gym_id: number;
  registered_at: string;
  gym_name: string;
  gym_city: string;
  gym_address: string;
}

/* ========================================
 * Interfaz para Usuario básico de un Gimnasio (Manager/Admin)
 * Interface for basic Gym User (Manager/Admin)
 * ======================================== */
// Usado cuando un Manager consulta los usuarios de su gimnasio
// Used when a Manager queries users from their gym
export interface GymUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_picture: string | null; // Foto de perfil del usuario / User's profile picture
  role: string;
  registered_at: string;
}
