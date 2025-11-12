/**
 * =============================================================================
 * PÁGINA: VisitsManagementPage
 * =============================================================================
 *
 * Página para gestionar y visualizar visitas a gimnasios.
 * - Admin: puede ver todas las visitas y filtrar por gimnasio y usuario.
 * - Manager: solo ve visitas de su gimnasio, puede filtrar por usuario.
 * -  Filtros automáticos con debounce 500ms. Tabla limpia.
 *
 * Page to manage and view gym visits.
 * - Admin: can see all visits and filter by gym and user.
 * - Manager: only sees visits from their gym, can filter by user.
 * - Automatic filters with 500ms debounce. Clean table.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllVisits, getManagerGymVisits } from "../services/visit-services";
import { getAllGyms } from "../services/gym-services";
import type { VisitWithDetails } from "../interfaces/visit-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { Avatar } from "../components/Avatar";
import { VisitsDetailsModal } from "../components/VisitsDetailsModal";

/* =============================================================================
   ESTILOS (inline)
   STYLES (inline)
   ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
  },
  filtersContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#495057",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "200px",
  },
  select: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "200px",
    backgroundColor: "white",
  },
  clearButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  tableContainer: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
    fontWeight: "bold",
    color: "#495057",
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #dee2e6",
  },
  clickableRow: {
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  loadingContainer: {
    padding: "40px",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    padding: "20px",
    textAlign: "center",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#6c757d",
    fontSize: "1.1rem",
  },
  statsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 200px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#007bff",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#6c757d",
    marginTop: "5px",
  },
  gymSearchInput: {
    padding: "8px",
    fontSize: "0.9rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "200px",
    marginBottom: "5px",
  },
  noResultsText: {
    color: "#dc3545",
    fontSize: "0.85rem",
    marginTop: "5px",
  },
};

/* =============================================================================
   COMPONENTE: VisitsManagementPage
   COMPONENT: VisitsManagementPage
   ============================================================================= */
export const VisitsManagementPage = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  // Estados del componente / Component states
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros / Filter states
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [gymSearchTerm, setGymSearchTerm] = useState<string>("");

  // Estados para el modal / States for modal
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(
    null
  );

  // Cargar gimnasios (solo para admin) / Load gyms (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchGyms = async () => {
      try {
        const gymsData = await getAllGyms();
        setGyms(gymsData);
      } catch (err) {
        const msg = handleApiError(err, "Error al cargar gimnasios.");
        toast.error("No se pudieron cargar los gimnasios.");
        if (import.meta.env.DEV) {
          console.error("Error al cargar gimnasios:", msg);
        }
      }
    };

    fetchGyms();
  }, [isAdmin]);

  // Filtrar gimnasios según el término de búsqueda / Filter gyms by search term
  const filteredGyms = gyms.filter(
    (gym) =>
      gym.name.toLowerCase().includes(gymSearchTerm.toLowerCase()) ||
      gym.city.toLowerCase().includes(gymSearchTerm.toLowerCase())
  );

  // Cargar visitas / Load visits
  const fetchVisits = async () => {
    if (!token) {
      setError("No estás autenticado.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      let visitsData: VisitWithDetails[];
      const filters = {
        user_search: userSearch.trim() || undefined,
      };

      if (isAdmin) {
        // Admin: obtener todas las visitas con filtros opcionales
        // Admin: get all visits with optional filters
        const adminFilters = {
          ...filters,
          gym_id: selectedGymId ? Number(selectedGymId) : undefined,
        };
        visitsData = await getAllVisits(token, adminFilters);
      } else if (isManager) {
        // Manager: obtener solo visitas de su gimnasio
        // Manager: get only visits from their gym
        visitsData = await getManagerGymVisits(token, filters);
      } else {
        throw new Error("No tienes permisos para ver esta página.");
      }

      setVisits(visitsData);
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar las visitas.");
      setError(msg);
      toast.error("No se pudieron cargar las visitas.");
      if (import.meta.env.DEV) {
        console.error("Error al cargar visitas:", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Efecto con debounce /  Effect with debounce ---
  // Cargar visitas al cambiar los filtros, con debounce
  // Load visits when filters change, with debounce
  useEffect(() => {
    // Debounce de 500ms para no saturar el backend
    // 500ms debounce to avoid overwhelming the backend
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500);

    // Limpiar timeout si los filtros cambian antes de que se ejecute
    // Clear timeout if filters change before execution
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGymId, userSearch]); // Se ejecuta cuando cambian los filtros / Runs when filters change

  // ---  Limpiar filtros /  Clear filters ---
  // Ya no llama a fetchVisits() directamente, el useEffect lo detectará
  // No longer calls fetchVisits() directly, useEffect will detect it
  const handleClearFilters = () => {
    setSelectedGymId("");
    setUserSearch("");
    setGymSearchTerm("");
  };

  // Lógica del Modal (abrir/cerrar) / Modal Logic (open/close)
  const handleRowClick = (visit: VisitWithDetails) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedVisit(null);
  };

  // Calcular estadísticas / Calculate statistics
  const totalVisits = visits.length;

  // Render loading
  if (isLoading && visits.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <p>Cargando visitas...</p>
        {/* TODO: Spinner */}
      </div>
    );
  }

  // Render error
  if (error && visits.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  // Render principal / Main render
  return (
    <div style={styles.container}>
      {/* Encabezado / Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isAdmin ? "Gestión de Visitas" : "Visitas a mi Gimnasio"}
        </h1>
        <p style={styles.subtitle}>
          {isAdmin
            ? "Visualiza y filtra todas las visitas de todos los gimnasios."
            : "Visualiza y filtra las visitas a tu gimnasio."}
        </p>
      </div>

      {/* Estadísticas (Solo total) / Statistics (Total only) */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{totalVisits}</div>
          <div style={styles.statLabel}>
            {isLoading ? "Cargando..." : "Total de Visitas"}
          </div>
        </div>
      </div>

      {/* Filtros / Filters */}
      <div style={styles.filtersContainer}>
        {/* Filtro por gimnasio (solo admin) / Gym filter (admin only) */}
        {isAdmin && (
          <div style={styles.filterGroup}>
            <label htmlFor="gymFilter" style={styles.label}>
              Filtrar por Gimnasio
            </label>

            <input
              type="text"
              placeholder="🔍 Buscar por nombre o ciudad..."
              value={gymSearchTerm}
              onChange={(e) => setGymSearchTerm(e.target.value)}
              style={styles.gymSearchInput}
            />

            <select
              id="gymFilter"
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              style={styles.select}>
              <option value="">
                Todos los gimnasios ({filteredGyms.length})
              </option>
              {filteredGyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name} - {gym.city}
                </option>
              ))}
            </select>

            {gymSearchTerm && filteredGyms.length === 0 && (
              <small style={styles.noResultsText}>
                No se encontraron gimnasios
              </small>
            )}
          </div>
        )}

        {/* Filtro por usuario (común para admin y manager) / User filter (common for admin and manager) */}
        <div style={styles.filterGroup}>
          <label htmlFor="userFilter" style={styles.label}>
            Buscar por Usuario
          </label>
          <input
            id="userFilter"
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)} // <-- Dispara el useEffect
            placeholder="Nombre o email..."
            style={styles.input}
            // onKeyPress eliminado / onKeyPress removed
          />
        </div>

        {/* Botón de limpiar filtros / Clear filters button */}
        <button
          onClick={handleClearFilters}
          style={styles.clearButton}
          disabled={isLoading}>
          Limpiar
        </button>
      </div>

      {/* Tabla de visitas / Visits table */}

      {visits.length === 0 ? (
        <div style={styles.emptyState}>
          {userSearch || selectedGymId ? (
            // Si hay filtros activos / If filters are active
            <>
              <p>🔍 No se encontraron visitas con los filtros aplicados.</p>
              <button
                onClick={handleClearFilters}
                style={{
                  ...styles.clearButton,
                  marginTop: "15px",
                  cursor: "pointer",
                }}>
                Limpiar filtros
              </button>
            </>
          ) : (
            // Si no hay filtros / If no filters
            <p>📭 Aún no hay visitas registradas.</p>
          )}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            {/* Cabecera de tabla (Usuario, Gimnasio Visitado) */}
            {/* Table header (User, Gym Visited) */}
            <thead>
              <tr>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Fecha de Visita</th>
              </tr>
            </thead>

            {/* Cuerpo de tabla (Avatar + Nombre, Logo + Nombre) */}
            {/* Table body (Avatar + Name, Logo + Name) */}
            <tbody>
              {visits.map((visit) => (
                <tr
                  key={visit.id}
                  style={styles.clickableRow}
                  onClick={() => handleRowClick(visit)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title={`Ver detalles de la visita #${visit.id}`}>
                  {/* Columna: Avatar + Nombre Usuario */}
                  {/* Column: Avatar + User Name */}
                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}>
                      <Avatar
                        src={visit.user_profile_picture}
                        firstName={visit.user_name || "Usuario"}
                        lastName={""}
                        size={35}
                      />
                      <span>{visit.user_name || "N/A"}</span>
                    </div>
                  </td>

                  {/* Columna: Fecha de Visita */}
                  {/* Column: Visit Date */}
                  <td style={styles.td}>
                    {new Date(visit.visit_date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Renderizar el modal / Render the modal */}
      <VisitsDetailsModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        visit={selectedVisit}
      />
    </div>
  );
};
