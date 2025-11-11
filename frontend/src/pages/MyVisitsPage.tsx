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
import { getMyVisits } from "../services/visit-services"; // Asumimos que esta función existirá
import type { VisitWithDetails } from "../interfaces/visit-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { Avatar } from "../components/Avatar";

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

  const fetchVisits = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Pasamos el término de búsqueda al servicio
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
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gymSearch]);

  if (isLoading && visits.length === 0) {
    return <div style={styles.loading}>Cargando tus visitas...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mis Visitas</h1>

      {/* Estadísticas */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{visits.length}</div>
          <div style={styles.statLabel}>
            {isLoading && visits.length === 0
              ? "Cargando..."
              : "Total de Visitas"}
          </div>
        </div>
      </div>

      {/* Filtro de búsqueda */}
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
              <th style={styles.th}>Hora</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.id}>
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
                <td style={styles.td}>
                  {new Date(visit.visit_date).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
