/* ========================================
 *           Gym interface
 * ======================================== */

export interface Gym {
  id: number;
  name: string;
  address: string;
  city: string;
  is_suspended: number; // 0 = activo, 1 = suspendido // 0 = active, 1 = suspended
  gym_hours?: string | null; // Horario de apertura del gimnasio // Gym opening hours
  logo_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  main_image_url?: string | null;
}

/* ========================================
 * Interfaz para Respuesta de Subida de Imagen
 * Interface for Image Upload Response
 * ======================================== */
export interface ImageUploadResponse {
  message: string; // Mensaje de éxito del backend // Success message from backend
  filePath: string; // Ruta del archivo guardado en el backend // Path of the saved file in backend
}

/* ========================================
 * Respuesta al Crear Gimnasio + Manager
 * Response when Creating Gym + Manager
 * ======================================== */
export interface CreateGymManagerResponse {
  message: string;                // Mensaje de éxito / Success message
  gymId: number;                  // ID del gimnasio creado / Created gym ID
  managerId: number;              // ID del manager creado / Created manager ID
  managerEmail: string;           // Email del manager / Manager email
  newGym: Gym;                    // Datos del gimnasio / Gym data
}