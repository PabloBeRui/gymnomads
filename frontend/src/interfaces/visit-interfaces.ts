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
  user_name?: string; // Nombre completo del usuario / User full name
  user_email?: string; // Email del usuario / User email
  user_profile_picture?: string | null;
  gym_name?: string; // Nombre del gimnasio / Gym name
  gym_city?: string; // Ciudad del gimnasio / Gym city
  gym_logo_url?: string | null;
  is_gym_deleted: boolean;
  origin_gym_name?: string; // Nombre del gimnasio de origen / Origin gym name
  origin_gym_city?: string; // Ciudad del gimnasio de origen / Origin gym city
  origin_gym_logo_url?: string | null; // URL del logo del gimnasio de origen / Origin gym logo URL
  destination_gym_name?: string; // Nombre del gimnasio de destino (para visitas salientes) / Destination gym name (for outgoing visits)
  destination_gym_city?: string; // Ciudad del gimnasio de destino (para visitas salientes) / Destination gym city
  destination_gym_logo_url?: string | null; // URL del logo del gimnasio de destino (para visitas salientes) / Destination gym logo URL
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
  gym_id?: number; // Filtro por gimnasio (solo admin) / Filter by gym (admin only)
  user_search?: string; // Búsqueda por nombre/email de usuario / Search by user name/email
  start_date?: string; // Fecha inicio (opcional) / Start date (optional)
  end_date?: string; // Fecha fin (opcional) / End date (optional)
  gym_status?: "active" | "deleted";
  page?: number;
  limit?: number;
}

/* ========================================
 * Interfaz para Estadísticas de Visitas
 * Interface for Visit Statistics
 * ======================================== */
export interface VisitStats {
  total?: number; // Total general (admin, user) / Overall total (admin, user)
  thisMonth?: number; // Total del mes (admin, user) / Monthly total (admin, user)
  today?: number; // Total de hoy (admin, user) / Daily total (admin, user)
  totalReceived?: number; // Total de visitas recibidas (manager) / Total received visits (manager)
  thisMonthReceived?: number; // Total de visitas recibidas este mes (manager) / Monthly received visits (manager)
  todayReceived?: number; // Total de visitas recibidas hoy (manager) / Daily received visits (manager)
  totalSent?: number; // Total de visitas enviadas (manager) / Total sent visits (manager)
  thisMonthSent?: number; // Total de visitas enviadas este mes (manager) / Monthly sent visits (manager)
  todaySent?: number; // Total de visitas enviadas hoy (manager) / Daily sent visits (manager)
}