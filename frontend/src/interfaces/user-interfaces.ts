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
