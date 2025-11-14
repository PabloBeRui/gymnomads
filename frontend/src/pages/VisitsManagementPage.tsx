import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllVisits, getManagerGymVisits } from "../services/visit-services";
import { getAllGyms } from "../services/gym-services";
import type {
  VisitWithDetails,
  VisitsFilters,
} from "../interfaces/visit-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { Avatar } from "../components/Avatar";
import { VisitsDetailsModal } from "../components/modals/VisitsDetailsModal";
import { VisitsStatsModal } from "../components/modals/VisitsStatsModal";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../components/ui/PaginationControls";
import {
  SortableTable,
  type ColumnDefinition,
} from "../components/ui/SortableTable";

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
    cursor: "pointer",
    transition: "box-shadow 0.2s",
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

  // States del componente / Component states
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hook de paginación / Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination();

  // States de filtros / Filter states
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [gymSearchTerm, setGymSearchTerm] = useState<string>("");

  // States para el modal de detalles
  // States for details modal
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(
    null
  );

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Cargar gimnasios (solo para admin) / Load gyms (admin only)
  useEffect(() => {
    if (!isAdmin || !token) return;

    const fetchGyms = async () => {
      try {
        const gymsData = await getAllGyms(token, { limit: 1000 });
        const validGyms = Array.isArray(gymsData.data) ? gymsData.data : [];
        setGyms(validGyms);
      } catch (err) {
        const msg = handleApiError(err, "Error al cargar gimnasios.");
        toast.error("No se pudieron cargar los gimnasios.");
        setGyms([]);
        if (import.meta.env.DEV) {
          console.error("Error al cargar gimnasios:", msg);
        }
      }
    };

    fetchGyms();
  }, [isAdmin, token]);

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
      let response;
      const baseFilters: VisitsFilters = {
        page: currentPage,
        limit: itemsPerPage,
        user_search: userSearch.trim() || undefined,
      };

      if (isAdmin) {
        const gymIdAsNumber = Number(selectedGymId);
        const adminFilters: VisitsFilters = { ...baseFilters };

        if (selectedGymId === "deleted") {
          adminFilters.gym_status = "deleted";
        } else if (gymIdAsNumber > 0) {
          adminFilters.gym_id = gymIdAsNumber;
          adminFilters.gym_status = "active";
        }
        response = await getAllVisits(token, adminFilters);
      } else if (isManager) {
        response = await getManagerGymVisits(token, baseFilters);
      } else {
        throw new Error("No tienes permisos para ver esta página.");
      }

      const validVisits = Array.isArray(response.data) ? response.data : [];
      setVisits(validVisits);
      setTotalItems(response.total || 0);
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar las visitas.");
      setError(msg);
      toast.error("No se pudieron cargar las visitas.");
      setVisits([]);
      if (import.meta.env.DEV) {
        console.error("Error al cargar visitas:", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGymId, userSearch, currentPage, itemsPerPage]);

  const handleClearFilters = () => {
    setSelectedGymId("");
    setUserSearch("");
    setGymSearchTerm("");
    goToPage(1);
  };

  const handleRowClick = (visit: VisitWithDetails) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedVisit(null);
  };

  // --- Definición de columnas para la tabla ---
  // --- Column definitions for the table ---
  const visitColumns: ColumnDefinition<VisitWithDetails>[] = [
    {
      key: "user_name",
      header: "Usuario",
      render: (visit) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar
            src={visit.user_profile_picture}
            firstName={visit.user_name || "Usuario"}
            lastName={""}
            size={35}
          />
          <span>{visit.user_name || "N/A"}</span>
        </div>
      ),
    },
    // Añadir columna de gimnasio solo para admin
    // Add gym column only for admin
    ...(isAdmin
      ? [
          {
            key: "gym_name" as keyof VisitWithDetails,
            header: "Gimnasio Visitado",
            render: (visit: VisitWithDetails) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                <Avatar
                  src={visit.gym_logo_url}
                  firstName={visit.gym_name || "Gimnasio"}
                  lastName={""}
                  size={35}
                />
                <span>
                  {visit.gym_name || "N/A"}
                  {visit.is_gym_deleted && " (Eliminado)"}
                </span>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "visit_date",
      header: "Fecha de Visita",
      render: (visit) =>
        new Date(visit.visit_date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }),
    },
  ];

  if (isLoading && visits.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <p>Cargando visitas...</p>
      </div>
    );
  }

  if (error && visits.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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

      <div style={styles.statsContainer}>
        <div
          style={styles.statCard}
          onClick={() => setIsStatsModalOpen(true)}
          title="Ver estadísticas detalladas"
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
          <div style={styles.statNumber}>{totalItems}</div>
          <div style={styles.statLabel}>
            {isLoading ? "Cargando..." : "Total de Visitas"}
          </div>
        </div>
      </div>

      <div style={styles.filtersContainer}>
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
              <option value="">A Todos los Gimnasios</option>
              <option
                value="deleted"
                style={{ backgroundColor: "#ffebee", color: "#c62828" }}>
                A Gimnasios Eliminados
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

        <div style={styles.filterGroup}>
          <label htmlFor="userFilter" style={styles.label}>
            Buscar por Usuario
          </label>
          <input
            id="userFilter"
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Nombre o email..."
            style={styles.input}
          />
        </div>

        <button
          onClick={handleClearFilters}
          style={styles.clearButton}
          disabled={isLoading}>
          Limpiar
        </button>
      </div>

      {visits.length === 0 ? (
        <div style={styles.emptyState}>
          {userSearch || selectedGymId ? (
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
            <p>📭 Aún no hay visitas registradas.</p>
          )}
        </div>
      ) : (
        <>
          <SortableTable
            data={visits}
            columns={visitColumns}
            initialSortConfig={{ key: "visit_date", direction: "descending" }}
            onRowClick={handleRowClick}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            onItemsPerPageChange={changeItemsPerPage}
          />
        </>
      )}

      <VisitsDetailsModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        visit={selectedVisit}
      />

      <VisitsStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        viewMode={isAdmin ? "admin" : "manager"}
      />
    </div>
  );
};
