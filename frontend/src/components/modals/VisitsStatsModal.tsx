/**
 * =============================================================================
 * COMPONENTE: VisitsStatsModal
 * COMPONENT: VisitsStatsModal
 * =============================================================================
 *
 * Modal para mostrar estadísticas de visitas (Hoy, Mes, Total).
 * Carga los datos desde el backend al abrirse.
 *
 * Modal to display visit statistics (Today, Month, Total).
 * Loads data from the backend when opened.
 *
 * =============================================================================
 */
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getVisitsStats } from "../../services/visit-services"; // <-- Usamos tu servicio
import type { VisitStats } from "../../interfaces/visit-interfaces"; // <-- Usamos tu interfaz
import { CloseButton } from "../ui/CloseButton"; // Importar el nuevo componente

/* =============================================================================
    PROPS
    ============================================================================= */
interface VisitsStatsModalProps {
  // Visibilidad del modal
  // Modal visibility
  isOpen: boolean;
  // Función al cerrar el modal
  // Function on close
  onClose: () => void;
  // Rol del usuario que mira (para adaptar el título)
  // Role of the viewing user (to adapt the title)
  viewMode: "user" | "manager" | "admin";
}

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    maxWidth: "600px",
    width: "90%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative", // Añadido para posicionar el botón de cierre
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  modalTitle: {
    fontSize: "1.5rem",
    color: "#333",
    margin: 0,
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-around",
    gap: "15px",
    flexWrap: "wrap", // Para móviles
  },
  statBox: {
    flex: 1,
    minWidth: "120px", // Ancho mínimo para cada caja
    padding: "20px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "2.2rem",
    fontWeight: "bold",
    color: "#007bff",
    margin: "0 0 5px 0",
  },
  // Estilo para el número cuando se alcanza el límite
  // Style for the number when the limit is reached
  statNumberError: {
    color: '#dc3545', // Rojo
  },
  statLabel: {
    fontSize: "1rem",
    color: "#495057",
    margin: 0,
  },
  // Estilo para el mensaje de límite alcanzado
  // Style for the limit reached message
  limitMessage: {
    fontSize: '0.8rem',
    color: '#dc3545',
    marginTop: '5px',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: "center",
    padding: "30px",
    color: "#6c757d",
    fontSize: "1.1rem",
  },
  errorText: {
    textAlign: "center",
    padding: "30px",
    color: "#dc3545", // Color rojo para error
    fontSize: "1.1rem",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

/* =============================================================================
    COMPONENTE
    COMPONENT
    ============================================================================= */
export const VisitsStatsModal: React.FC<VisitsStatsModalProps> = ({
  isOpen,
  onClose,
  viewMode,
}) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsViewMode, setStatsViewMode] = useState<"received" | "sent">(
    "received"
  );

  // Manejar cierre del modal
  // Handle modal close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Manejar tecla ESC para cerrar
  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, handleClose]);

  // Cargar estadísticas cuando se abre el modal
  // Load stats when the modal opens
  useEffect(() => {
    // Solo cargar si el modal está abierto y tenemos token
    // Only load if the modal is open and we have a token
    if (isOpen && token) {
      const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Llamar al servicio que ya creamos
          // Call the service we already created
          const data = await getVisitsStats(token);
          setStats(data);
        } catch (err) {
          const errorMessage = (err as Error).message || "Error desconocido";
          setError(errorMessage);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStats();
    }
  }, [isOpen, token]); // Se ejecuta cada vez que 'isOpen' cambia a 'true'

  // Definir el título basado en el rol
  // Define the title based on the role
  const getTitle = () => {
    switch (viewMode) {
      case "admin":
        return "📈 Estadísticas Globales";
      case "manager":
        return "📈 Estadísticas de Visitas (Mi Gimnasio)";
      case "user":
      default:
        return "📈 Tus Estadísticas de Visita";
    }
  };

  // No renderizar nada si está cerrado
  // Don't render if closed
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={styles.modalOverlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-modal-title">
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 id="stats-modal-title" style={styles.modalTitle}>
            {getTitle()}
          </h2>
          <CloseButton onClick={handleClose} ariaLabel="Cerrar estadísticas de visitas" />
        </div>

        {viewMode === "manager" && (
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => setStatsViewMode("received")}
              style={{
                ...styles.button, // Usar un estilo de botón genérico
                backgroundColor:
                  statsViewMode === "received" ? "#007bff" : "#6c757d",
                color: "white",
              }}>
              Estadísticas Recibidas
            </button>
            <button
              onClick={() => setStatsViewMode("sent")}
              style={{
                ...styles.button, // Usar un estilo de botón genérico
                backgroundColor:
                  statsViewMode === "sent" ? "#007bff" : "#6c757d",
                color: "white",
              }}>
              Estadísticas Enviadas
            </button>
          </div>
        )}

        {/* Mostrar estado de Carga / Show Loading state */}
        {isLoading && (
          <p style={styles.loadingText}>Cargando estadísticas...</p>
        )}

        {/* Mostrar estado de Error / Show Error state */}
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Mostrar estadísticas (si no hay carga y no hay error) */}
        {/* Show stats (if not loading and no error) */}
        {!isLoading && !error && stats && (
          <>
            {/* --- Vista para Manager --- */}
            {/* --- Manager View --- */}
            {viewMode === "manager" ? (
              statsViewMode === "received" ? (
                <>
                  <h3
                    style={{
                      textAlign: "center",
                      marginBottom: "15px",
                      color: "#007bff",
                    }}>
                    Visitas Recibidas
                  </h3>
                  <div style={styles.statsContainer}>
                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{stats.todayReceived ?? 0}</p>
                      <p style={styles.statLabel}>Hoy</p>
                    </div>
                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{stats.thisMonthReceived ?? 0}</p>
                      <p style={styles.statLabel}>Este Mes</p>
                    </div>
                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{stats.totalReceived ?? 0}</p>
                      <p style={styles.statLabel}>Totales</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3
                    style={{
                      textAlign: "center",
                      marginBottom: "15px",
                      color: "#28a745",
                    }}>
                    Visitas Enviadas
                  </h3>
                  <div style={styles.statsContainer}>
                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{stats.todaySent ?? 0}</p>
                      <p style={styles.statLabel}>Hoy</p>
                    </div>
                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{stats.thisMonthSent ?? 0}</p>
                      <p style={styles.statLabel}>Este Mes</p>
                    </div>
                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{stats.totalSent ?? 0}</p>
                      <p style={styles.statLabel}>Totales</p>
                    </div>
                  </div>
                </>
              )
            ) : (
              /* --- Vista para Usuario y Admin (Estadísticas generales) --- */
              /* --- User and Admin View (General Statistics) --- */
              <div style={styles.statsContainer}>
                <div style={styles.statBox}>
                  <p style={styles.statNumber}>{stats.today ?? 0}</p>
                  <p style={styles.statLabel}>Visitas Hoy</p>
                </div>
                <div style={styles.statBox}>
                  <p style={{...styles.statNumber, ...((stats.thisMonth ?? 0) >= 10 ? styles.statNumberError : {})}}>{stats.thisMonth ?? 0}</p>
                  <p style={styles.statLabel}>Visitas este Mes</p>
                  {(stats.thisMonth ?? 0) >= 10 && (
                    <p style={styles.limitMessage}>Máximo de visitas mensuales completado</p>
                  )}
                </div>
                <div style={styles.statBox}>
                  <p style={styles.statNumber}>{stats.total ?? 0}</p>
                  <p style={styles.statLabel}>Visitas Totales</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
