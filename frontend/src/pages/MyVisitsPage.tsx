/**
 * =============================================================================
 * PÁGINA: MyVisitsPage
 * =============================================================================
 *
 * Página para que un usuario vea su historial de visitas a gimnasios.
 *
 * Page for a user to view their gym visit history.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyVisits } from "../services/visit-services";
import type { VisitWithDetails } from "../interfaces/visit-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { VisitsDetailsModal } from "../components/VisitsDetailsModal";
import { Avatar } from "../components/Avatar";
import { VisitsStatsModal } from "../components/VisitsStatsModal"; //modal de estadísticas / stats modal

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
  const { token } = useAuth();
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gymSearch, setGymSearch] = useState("");

  // States para el modal de detalles
  // States for details modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(
    null
  );

  // --- State para el modal de estadísticas ---
  // --- State for stats modal ---
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const fetchVisits = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Pasa el término de búsqueda al servicio
      // Pass the search term to the service
      const data = await getMyVisits(token, gymSearch);
      setVisits(data);
    } catch (error) {
      const msg = handleApiError(error, "Error al cargar tus visitas.");
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect con debounce para el filtro
  // useEffect with debounce for the filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gymSearch]);

  // Lógica del Modal de Detalles
  // Details Modal Logic
  const handleRowClick = (visit: VisitWithDetails) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedVisit(null);
  };

  if (isLoading && visits.length === 0) {
    return <div style={styles.loading}>Cargando tus visitas...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mis Visitas</h1>

      {/* --- Tarjeta de estadísticas clicable --- */}
      {/* ---  Clickable stats card --- */}
      <div style={styles.statsContainer}>
        <div
          style={styles.statCard}
          onClick={() => setIsStatsModalOpen(true)} // <-- AÑADIDO
          title="Ver estadísticas detalladas" // <-- AÑADIDO
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
          <div style={styles.statNumber}>{visits.length}</div>
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
          onChange={(e) => setGymSearch(e.target.value)}
          placeholder="🔍 Buscar por nombre de gimnasio..."
          style={styles.input}
        />
      </div>

      {isLoading && <p style={styles.loading}>Buscando...</p>}

      {!isLoading && visits.length === 0 ? (
        gymSearch ? (
          <p style={styles.empty}>
            No se encontraron visitas para "{gymSearch}".
          </p>
        ) : (
          <p style={styles.empty}>Aún no has visitado ningún gimnasio.</p>
        )
      ) : (
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
      )}

      {/* Modal de Detalles de Visita */}
      {/* Visit Details Modal */}
      <VisitsDetailsModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        visit={selectedVisit}
        viewMode="user"
      />

      {/* ---Modal de Estadísticas --- */}
      {/* --- Stats Modal --- */}
      <VisitsStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        viewMode="user"
      />
    </div>
  );
};
