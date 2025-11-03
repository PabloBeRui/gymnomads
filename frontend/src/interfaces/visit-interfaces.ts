/* ========================================
 *           Visit interfaces
 * ======================================== */

// Interfaz base de visita / Base visit interface
export interface Visit {
  id: number;
  user_id: number;
  gym_id: number;
  visit_date: string; // ISO string date
  created_at?: string;
}

/* ========================================
 * Interfaz para Visita con Datos Relacionados
 * Interface for Visit with Related Data
 * ======================================== */
export interface VisitWithDetails extends Visit {
  user_name?: string;        // Nombre completo del usuario / User full name
  user_email?: string;        // Email del usuario / User email
  gym_name?: string;          // Nombre del gimnasio / Gym name
  gym_city?: string;          // Ciudad del gimnasio / Gym city
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
  visitId: number; // El backend devuelve visitId directamente / Backend returns visitId directly
}

/* ========================================
 * Interfaz para Filtros de Visitas
 * Interface for Visit Filters
 * ======================================== */
export interface VisitsFilters {
  gym_id?: number;           // Filtro por gimnasio (solo admin) / Filter by gym (admin only)
  user_search?: string;      // Búsqueda por nombre/email de usuario / Search by user name/email
  start_date?: string;       // Fecha inicio (opcional) / Start date (optional)
  end_date?: string;         // Fecha fin (opcional) / End date (optional)
}