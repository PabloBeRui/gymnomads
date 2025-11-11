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
};

/* =============================================================================
   COMPONENTE: MyVisitsPage
   COMPONENT: MyVisitsPage
   ============================================================================= */
   
export const MyVisitsPage = () => {
  const { token } = useAuth();
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      if (!token) return;
      try {
        const data = await getMyVisits(token); // Llamada a la nueva función
        setVisits(data);
      } catch (error) {
        const msg = handleApiError(error, "Error al cargar tus visitas.");
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, [token]);

  if (isLoading) {
    return <div style={styles.loading}>Cargando tus visitas...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mis Visitas</h1>
      {visits.length === 0 ? (
        <p style={styles.empty}>Aún no has visitado ningún gimnasio.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Gimnasio Visitado</th>
              <th style={styles.th}>Fecha de la Visita</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.id}>
                <td style={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                    year: "numeric",
                    month: "long",
                    day: "numeric",
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
