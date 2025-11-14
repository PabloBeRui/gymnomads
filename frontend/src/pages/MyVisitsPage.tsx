import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyVisits } from "../services/visit-services";
import type { VisitWithDetails } from "../interfaces/visit-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { VisitsDetailsModal } from "../components/modals/VisitsDetailsModal";
import { Avatar } from "../components/Avatar";
import { VisitsStatsModal } from "../components/modals/VisitsStatsModal";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../components/ui/PaginationControls";

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #dee2e6",
  },
  clickableRow: {
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
  },
  filtersContainer: {
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    maxWidth: "400px",
  },
  statsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
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
};

/* =============================================================================
    COMPONENTE: MyVisitsPage
    COMPONENT: MyVisitsPage
    ============================================================================= */
export const MyVisitsPage = () => {
  // =============================================================================
  // Estados y Hooks
  // States and Hooks
  // =============================================================================

  // Obtener token de autenticación del contexto
  // Get authentication token from context
  const { token } = useAuth();

  // Estado para almacenar la lista de visitas
  // State to store the list of visits
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);

  // Estado para controlar la carga de datos
  // State to control data loading
  const [isLoading, setIsLoading] = useState(true);

  // Estado para el término de búsqueda de gimnasios
  // State for the gym search term
  const [gymSearch, setGymSearch] = useState("");

  // Hook personalizado para gestionar la lógica de paginación
  // Custom hook to manage pagination logic
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination();

  // Estado para controlar la visibilidad del modal de detalles
  // State to control the visibility of the details modal
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Estado para almacenar la visita seleccionada para el modal
  // State to store the selected visit for the modal
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(
    null
  );

  // Estado para controlar la visibilidad del modal de estadísticas
  // State to control the visibility of the statistics modal
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // =============================================================================
  // Carga de Datos
  // Data Loading
  // =============================================================================

  // Función para obtener las visitas desde el backend
  // Function to fetch visits from the backend
  const fetchVisits = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Llamar al servicio con filtros de búsqueda y paginación
      // Call the service with search and pagination filters
      const response = await getMyVisits(
        token,
        gymSearch,
        currentPage,
        itemsPerPage
      );
      // Actualizar el estado con los datos y el total de elementos
      // Update the state with the data and total number of items
      setVisits(response.data);
      setTotalItems(response.total);
    } catch (error) {
      // Manejar errores de la API y mostrar notificación
      // Handle API errors and show notification
      const msg = handleApiError(error, "Error al cargar tus visitas.");
      toast.error(msg);
    } finally {
      // Finalizar el estado de carga
      // Finalize the loading state
      setIsLoading(false);
    }
  };

  // Efecto para cargar las visitas cuando cambian los filtros o la paginación
  // Effect to load visits when filters or pagination change
  useEffect(() => {
    // Usar un debounce para evitar peticiones excesivas al escribir
    // Use a debounce to avoid excessive requests while typing
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500); // 500ms de espera / 500ms wait

    // Limpiar el timeout si el efecto se vuelve a ejecutar
    // Clear the timeout if the effect runs again
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gymSearch, currentPage, itemsPerPage]);

  // =============================================================================
  // Manejadores de Eventos
  // Event Handlers
  // =============================================================================

  // Manejar click en una fila para abrir el modal de detalles
  // Handle click on a row to open the details modal
  const handleRowClick = (visit: VisitWithDetails) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };

  // Cerrar el modal de detalles
  // Close the details modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedVisit(null);
  };

  // Manejar cambio en el input de búsqueda
  // Handle change in the search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGymSearch(e.target.value);
    goToPage(1); // Resetear a la primera página con cada nueva búsqueda
  };

  // =============================================================================
  // Renderizado Condicional
  // Conditional Rendering
  // =============================================================================

  // Mostrar estado de carga inicial
  // Show initial loading state
  if (isLoading && visits.length === 0) {
    return <div style={styles.loading}>Cargando tus visitas...</div>;
  }

  // =============================================================================
  // Renderizado Principal
  // Main Rendering
  // =============================================================================
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mis Visitas</h1>

      {/* Tarjeta de estadísticas que abre un modal */}
      {/* Statistics card that opens a modal */}
      <div style={styles.statsContainer}>
        <div
          style={styles.statCard}
          onClick={() => setIsStatsModalOpen(true)}
          title="Ver estadísticas detalladas"
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
          {/* Usar el total de items del hook de paginación */}
          {/* Use the total items from the pagination hook */}
          <div style={styles.statNumber}>{totalItems}</div>
          <div style={styles.statLabel}>
            {isLoading && visits.length === 0
              ? "Cargando..."
              : "Total de Visitas"}
          </div>
        </div>
      </div>

      {/* Filtro de búsqueda */}
      {/* Search filter */}
      <div style={styles.filtersContainer}>
        <input
          type="text"
          value={gymSearch}
          onChange={handleSearchChange}
          placeholder="🔍 Buscar por nombre de gimnasio..."
          style={styles.input}
        />
      </div>

      {/* Indicador de carga durante la búsqueda */}
      {/* Loading indicator during search */}
      {isLoading && <p style={styles.loading}>Buscando...</p>}

      {/* Estado vacío o sin resultados */}
      {/* Empty state or no results */}
      {!isLoading && visits.length === 0 ? (
        gymSearch ? (
          <p style={styles.empty}>
            No se encontraron visitas para "{gymSearch}".
          </p>
        ) : (
          <p style={styles.empty}>Aún no has visitado ningún gimnasio.</p>
        )
      ) : (
        <>
          {/* Tabla de visitas */}
          {/* Visits table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Gimnasio</th>
                <th style={styles.th}>Fecha</th>
              </tr>
            </thead>
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
                  title={`Ver detalles de la visita`}>
                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}>
                      <Avatar
                        src={visit.gym_logo_url}
                        firstName={visit.gym_name || "Gimnasio"}
                        lastName=""
                        size={35}
                      />
                      <span>{visit.gym_name || "N/A"}</span>
                    </div>
                  </td>
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

          {/* Controles de paginación */}
          {/* Pagination controls */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            onItemsPerPageChange={changeItemsPerPage}
          />
        </>
      )}

      {/* Modales */}
      {/* Modals */}
      <VisitsDetailsModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        visit={selectedVisit}
        viewMode="user"
      />
      <VisitsStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        viewMode="user"
      />
    </div>
  );
};
