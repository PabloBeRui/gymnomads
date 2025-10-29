/* ========================================
 *           Gym interface
 * ======================================== */

export interface Gym {
  id: number;
  name: string;
  address: string;
  city: string;
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