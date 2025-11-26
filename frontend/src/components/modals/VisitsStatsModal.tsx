/**
 * =============================================================================
 * COMPONENTE: VisitsStatsModal
 * COMPONENT: VisitsStatsModal
 * =============================================================================
 *
 * Modal para mostrar estadísticas de visitas (Hoy, Mes, Total).
 * Carga los datos desde el backend al abrirse.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Modal to display visit statistics (Today, Month, Total).
 * Loads data from the backend when opened.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getVisitsStats } from "../../services/visit-services"; // <-- Usamos tu servicio / We use your service
import type { VisitStats } from "../../interfaces/visit-interfaces"; // <-- Usamos tu interfaz / We use your interface
import { CloseButton } from "../ui/CloseButton"; // Importar el nuevo componente / Import the new component

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Modal, Button, Alert, ButtonGroup } from "react-bootstrap";
import styles from "./VisitsStatsModal.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx
import Spinner from "../ui/Spinner";

/* =============================================================================
    PROPS
    ============================================================================= */
interface VisitsStatsModalProps {
  // Visibilidad del modal / Modal visibility
  isOpen: boolean;
  // Función al cerrar el modal / Function on close
  onClose: () => void;
  // Rol del usuario que mira (para adaptar el título) / Role of the viewing user (to adapt the title)
  viewMode: "user" | "manager" | "admin";
}

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

  // Manejar cierre del modal / Handle modal close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Manejar tecla ESC para cerrar / Handle ESC key to close
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

  // Cargar estadísticas cuando se abre el modal / Load stats when the modal opens
  useEffect(() => {
    // Solo cargar si el modal está abierto y tenemos token / Only load if the modal is open and we have a token
    if (isOpen && token) {
      const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Llamar al servicio que ya creamos / Call the service we already created
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
  }, [isOpen, token]); // Se ejecuta cada vez que 'isOpen' cambia a 'true' / Runs every time 'isOpen' changes to 'true'

  // Definir el título basado en el rol / Define the title based on the role
  const getTitle = () => {
    switch (viewMode) {
      case "admin":
        return "Estadísticas Globales";
      case "manager":
        return "Estadísticas de Visitas (Mi Gimnasio)";
      case "user":
      default:
        return "Tus Estadísticas de Visita";
    }
  };

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title className={clsx(styles.modalTitle, "text-primary")}>
          {getTitle()}
        </Modal.Title>
        <CloseButton onClick={handleClose} ariaLabel="Cerrar estadísticas de visitas" color="#FFB700" className={styles.modalCloseButton} />
      </Modal.Header>
      <Modal.Body>
        {viewMode === "manager" && (
          <ButtonGroup className={clsx(styles.buttonGroup, "mb-4 w-100")}>
            <Button
              variant={statsViewMode === "received" ? "primary" : "secondary"}
              onClick={() => setStatsViewMode("received")}
            >
              Estadísticas Recibidas
            </Button>
            <Button
              variant={statsViewMode === "sent" ? "primary" : "secondary"}
              onClick={() => setStatsViewMode("sent")}
            >
              Estadísticas Enviadas
            </Button>
          </ButtonGroup>
        )}

        {/* Mostrar estado de Carga / Show Loading state */}
        {isLoading && (
          <div className="text-center p-5">
            <Spinner center size="lg" />
          </div>
        )}

        {/* Mostrar estado de Error / Show Error state */}
        {error && <Alert variant="danger" className="text-center">{error}</Alert>}

        {/* Mostrar estadísticas (si no hay carga y no hay error) */}
        {/* Show stats (if not loading and no error) */}
        {!isLoading && !error && stats && (
          <>
            {/* --- Vista para Manager --- / --- Manager View --- */}
            {viewMode === "manager" ? (
              statsViewMode === "received" ? (
                <>
                  <h3 className="text-center mb-3 text-primary">
                    Visitas Recibidas
                  </h3>
                  <div className={styles.statsContainer}>
                    <div className={styles.statBox}>
                      <p className={clsx(styles.statNumber, "text-primary")}>{stats.todayReceived ?? 0}</p>
                      <p className={styles.statLabel}>Hoy</p>
                    </div>
                    <div className={styles.statBox}>
                      <p className={clsx(styles.statNumber, "text-primary")}>{stats.thisMonthReceived ?? 0}</p>
                      <p className={styles.statLabel}>Este Mes</p>
                    </div>
                    <div className={styles.statBox}>
                      <p className={clsx(styles.statNumber, "text-primary")}>{stats.totalReceived ?? 0}</p>
                      <p className={styles.statLabel}>Totales</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-center mb-3 text-primary">
                    Visitas Enviadas
                  </h3>
                  <div className={styles.statsContainer}>
                    <div className={styles.statBox}>
                      <p className={clsx(styles.statNumber, "text-primary")}>{stats.todaySent ?? 0}</p>
                      <p className={styles.statLabel}>Hoy</p>
                    </div>
                    <div className={styles.statBox}>
                      <p className={clsx(styles.statNumber, "text-primary")}>{stats.thisMonthSent ?? 0}</p>
                      <p className={styles.statLabel}>Este Mes</p>
                    </div>
                    <div className={styles.statBox}>
                      <p className={clsx(styles.statNumber, "text-primary")}>{stats.totalSent ?? 0}</p>
                      <p className={styles.statLabel}>Totales</p>
                    </div>
                  </div>
                </>
              )
            ) : (
              /* --- Vista para Usuario y Admin (Estadísticas generales) --- */
              /* --- User and Admin View (General Statistics) --- */
              <div className={styles.statsContainer}>
                <div className={styles.statBox}>
                  <p className={clsx(styles.statNumber, "text-primary")}>{stats.today ?? 0}</p>
                  <p className={styles.statLabel}>Visitas Hoy</p>
                </div>
                <div className={styles.statBox}>
                  <p className={clsx(styles.statNumber, { [styles.statNumberError]: (stats.thisMonth ?? 0) >= 10 }, "text-primary")}>{stats.thisMonth ?? 0}</p>
                  <p className={styles.statLabel}>Visitas este Mes</p>
                  {(stats.thisMonth ?? 0) >= 10 && viewMode === 'user' && (
                    <p className={clsx(styles.limitMessage, "text-danger")}>Máximo de visitas mensuales completado</p>
                  )}
                </div>
                <div className={styles.statBox}>
                  <p className={clsx(styles.statNumber, "text-primary")}>{stats.total ?? 0}</p>
                  <p className={styles.statLabel}>Visitas Totales</p>
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};