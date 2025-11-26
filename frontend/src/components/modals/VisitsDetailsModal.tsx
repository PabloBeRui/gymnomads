/**
 * =============================================================================
 * COMPONENTE: VisitsDetailsModal
 * COMPONENT:  VisitsDetailsModal
 * =============================================================================
 *
 * Modal de "solo vista" para mostrar los detalles de una visita específica.
 * - Muestra la información del usuario (para admin/manager).
 * - Muestra el gimnasio de Origen y/o Destino en un layout horizontal.
 * - Muestra la fecha exacta de la visita.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * View-only modal to display details of a specific visit.
 * - Shows User info (for admin/manager).
 * - Shows Origin and/or Destination gym in a horizontal layout.
 * - Shows the exact date of the visit.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import React, { useEffect, useCallback } from "react"; // <--- React importado
import type { VisitWithDetails } from "../../interfaces/visit-interfaces";
import { Avatar } from "../ui/Avatar";
import { CloseButton } from "../ui/CloseButton";
// --- NUEVO: Importar icono de flecha --- / --- NEW: Import arrow icon ---
import { FaArrowRight } from "react-icons/fa";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Modal } from "react-bootstrap";
import styles from "./VisitsDetailsModal.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
    INTERFACES
    ============================================================================= */

interface VisitsDetailsModalProps {
  // (Interfaz de props sin cambios) / (Props interface unchanged)
  isOpen: boolean;
  onClose: () => void;
  visit: VisitWithDetails | null;
  viewMode?: "user" | "admin" | "manager";
  visitType?: "received" | "sent";
}

// =============================================================================
//    SUB-COMPONENTE INTERNO: GymInfoBlock
//    INTERNAL SUB-COMPONENT: GymInfoBlock
// =============================================================================
// (Usamos React.memo para optimización, aunque no es crítico aquí)
// (We use React.memo for optimization, though not critical here)
const GymInfoBlock = React.memo(
  ({
    label,
    logoSrc,
    name,
    city,
  }: {
    label: string;
    logoSrc?: string | null;
    name?: string | null;
    city?: string | null;
  }) => (
    <div className={styles.gymInfoBlock}>
      <label className={clsx(styles.gymInfoLabel, "text-dark")}>{label}</label>
      <Avatar
        src={logoSrc}
        firstName={name || "Gimnasio"}
        lastName=""
        size={40} // Tamaño de avatar ligeramente más grande / Slightly larger avatar size
      />
      <div>
        <span className={styles.gymInfoName}>{name || "N/A"}</span>
        <div className={styles.gymInfoCity}>{city || "N/A"}</div>
      </div>
    </div>
  )
);

/* =============================================================================
    COMPONENTE: VisitsDetailsModal
    COMPONENT: VisitsDetailsModal
    ============================================================================= */
export const VisitsDetailsModal = ({
  isOpen,
  onClose,
  visit,
  viewMode = "user", // Por defecto, modo user / Default to user mode
  visitType,
}: VisitsDetailsModalProps) => {
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

  // Formatear fecha para mostrar / Format date for display
  const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Render ---

  if (!isOpen || !visit) return null;

  // Lógica para determinar qué gimnasio mostrar / Logic to determine which gym to display
  const showOriginGym =
    viewMode === "admin" || (viewMode === "manager" && visitType === "received");
  const showDestinationGym =
    viewMode === "admin" ||
    viewMode === "user" ||
    (viewMode === "manager" && visitType === "sent");

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title className={clsx(styles.modalTitle, "text-primary")}>
          Detalle de la Visita
          {(viewMode === "admin" || viewMode === "manager") && (
            <span className="text-secondary" style={{ fontSize: '0.8em' }}>{` (id: ${visit.id})`}</span>
          )}
        </Modal.Title>
        <CloseButton
          onClick={handleClose}
          ariaLabel="Cerrar detalles de la visita"
          className={styles.modalCloseButton}
        />
      </Modal.Header>
      <Modal.Body>
        {/* Header con Avatar, nombre y email del USUARIO (admin y manager) */}
        {/* Header with Avatar, name and email of USER (admin and manager) */}
        {(viewMode === "admin" || viewMode === "manager") && (
          <div className={styles.profileHeader}>
            <Avatar
              src={visit.user_profile_picture}
              firstName={visit.user_name || "Usuario"}
              lastName={""}
              size={100}
              className={styles.avatar}
            />
            <h3 className={styles.profileName}>{visit.user_name || "N/A"}</h3>
            <p className={styles.profileEmail}>{visit.user_email || "N/A"}</p>
          </div>
        )}

        {/* Contenido del modal (solo vista) / Modal content (view-only) */}
        <div className={styles.infoSection}>
          <div className={styles.journeyContainer}>
            {/* Mostrar bloque de Origen si es necesario / Show Origin block if needed */}
            {showOriginGym && (
              <GymInfoBlock
                label="GIMNASIO DE ORIGEN"
                logoSrc={visit.origin_gym_logo_url}
                name={visit.origin_gym_name}
                city={visit.origin_gym_city}
              />
            )}

            {/* Mostrar flecha solo si AMBOS bloques se muestran (vista Admin) */}
            {/* Show arrow only if BOTH blocks are shown (Admin view) */}
            {showOriginGym && showDestinationGym && (
              <FaArrowRight className={styles.journeyArrow} color="var(--bs-primary)" />
            )}

            {/* Mostrar bloque de Destino si es necesario / Show Destination block if needed */}
            {showDestinationGym && (
              <GymInfoBlock
                label="GIMNASIO DE DESTINO"
                logoSrc={visit.destination_gym_logo_url || visit.gym_logo_url}
                name={
                  visit.destination_gym_name || visit.gym_name || "N/A"
                }
                city={
                  visit.destination_gym_city || visit.gym_city || "N/A"
                }
              />
            )}
          </div>

          <div className={styles.dateRow}>
            <label className={clsx(styles.dateLabel, "text-dark")}>Fecha y Hora de la Visita:</label>
            <div className={styles.dateValue}>
              {formatFullDate(visit.visit_date)}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
