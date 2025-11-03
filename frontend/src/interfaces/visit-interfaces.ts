/* ========================================
 *           Visit interface
 * ======================================== */

export interface Visit {
  id: number;
  user_id: number;
  gym_id: number;
  visit_date: string; // ISO string date
  created_at?: string;
}

/* ========================================
 * Interfaz para Crear Visita
 * Interface for Creating Visit
 * ======================================== */
export interface CreateVisitData {
  gym_id: number;
}

/* ========================================
 * Interfaz para Respuesta de Creación de Visita
 * Interface for Visit Creation Response
 * ======================================== */
export interface CreateVisitResponse {
  message: string;
  visitId: number; // backend devuelve visitId directamente / Backend returns visitId directly
}