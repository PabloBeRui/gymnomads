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
 *
 * View-only modal to display details of a specific visit.
 * - Shows User info (for admin/manager).
 * - Shows Origin and/or Destination gym in a horizontal layout.
 * - Shows the exact date of the visit.
 *
 * =============================================================================
 */

import React, { useEffect, useCallback } from "react"; // <--- React importado
import type { VisitWithDetails } from "../../interfaces/visit-interfaces";
import { Avatar } from "../Avatar";
import { CloseButton } from "../ui/CloseButton";
// --- NUEVO: Importar icono de flecha ---
// --- NEW: Import arrow icon ---
import { FaArrowRight } from "react-icons/fa";

/* =============================================================================
    INTERFACES
    ============================================================================= */

interface VisitsDetailsModalProps {
  // (Interfaz de props sin cambios)
  isOpen: boolean;
  onClose: () => void;
  visit: VisitWithDetails | null;
  viewMode?: "user" | "admin" | "manager";
  visitType?: "received" | "sent";
}

/* =============================================================================
    ESTILOS (similares a ManagerDetailsModal)
    STYLES (similar to ManagerDetailsModal)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    /* ... (sin cambios) ... */
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
    /* ... (sin cambios) ... */
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative",
  },
  modalHeader: {
    /* ... (sin cambios) ... */
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid #dee2e6",
  },
  modalTitle: {
    /* ... (sin cambios) ... */
    fontSize: "1.5rem",
    color: "#333",
    margin: 0,
  },
  profileHeader: {
    /* ... (sin cambios) ... */
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
  },
  profileInfo: {
    /* ... (sin cambios) ... */
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  profileName: {
    /* ... (sin cambios) ... */
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  profileEmail: {
    /* ... (sin cambios) ... */
    fontSize: "1rem",
    color: "#6c757d",
    margin: 0,
  },
  infoSection: {
    /* ... (sin cambios) ... */
    marginBottom: "20px",
  },
  

  // --- ESTILOS para el layout horizontal ---
  // ---  STYLES for horizontal layout ---
  journeyContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // Centrar si hay un solo bloque
    gap: "10px",
    marginBottom: "20px",
  },
  gymInfoBlock: {
    flex: 1, // Cada bloque toma espacio equitativo
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    gap: "8px", // Espacio interno
  },
  gymInfoLabel: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#495057",
  },
  gymInfoName: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#212529",
  },
  gymInfoCity: {
    fontSize: "0.9rem",
    color: "#6c757d",
  },
  journeyArrow: {
    fontSize: "1.5rem",
    color: "#6c757d",
    flexShrink: 0, // Evitar que la flecha se encoja
  },
  

  // Estilo para la fila de la fecha (reemplaza a infoRow)
  // Style for date row (replaces infoRow)
  dateRow: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
  },
  dateLabel: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#495057",
    marginBottom: "5px",
  },
  dateValue: {
    fontSize: "1rem",
    color: "#212529",
    padding: "8px 12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  // --- FIN ESTILO FECHA ---

  buttonContainer: {
    /* ... (sin cambios) ... */
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "20px",
    paddingTop: "15px",
    borderTop: "1px solid #dee2e6",
  },
  button: {
    /* ... (sin cambios) ... */
    padding: "10px 20px",
    fontSize: "1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  closeBtn: {
    /* ... (sin cambios) ... */
    backgroundColor: "#6c757d",
    color: "white",
  },
};

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
    <div style={styles.gymInfoBlock}>
      <label style={styles.gymInfoLabel}>{label}</label>
      <Avatar
        src={logoSrc}
        firstName={name || "Gimnasio"}
        lastName=""
        size={40} // Tamaño de avatar ligeramente más grande
      />
      <div>
        <span style={styles.gymInfoName}>{name || "N/A"}</span>
        <div style={styles.gymInfoCity}>{city || "N/A"}</div>
      </div>
    </div>
  )
);

/* =============================================================================
    COMPONENTE: VisitsDetailsModal
    ============================================================================= */
export const VisitsDetailsModal = ({
  isOpen,
  onClose,
  visit,
  viewMode = "user", // Por defecto, modo user
  visitType,
}: VisitsDetailsModalProps) => {
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

  // Formatear fecha para mostrar
  // Format date for display
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

  // Lógica para determinar qué gimnasio mostrar
  // Logic to determine which gym to display
  const showOriginGym =
    viewMode === "admin" || (viewMode === "manager" && visitType === "received");
  const showDestinationGym =
    viewMode === "admin" ||
    viewMode === "user" ||
    (viewMode === "manager" && visitType === "sent");

  return (
    <>
      <div
        style={styles.modalOverlay}
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title">
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          {/* Header del modal */}
          {/* Modal header */}
          <div style={styles.modalHeader}>
            <h2 id="modal-title" style={styles.modalTitle}>
              🎟️ Detalle de la Visita
              {(viewMode === "admin" || viewMode === "manager") &&
                ` (ID: ${visit.id})`}
            </h2>
            <CloseButton
              onClick={handleClose}
              ariaLabel="Cerrar detalles de la visita"
            />
          </div>

          {/* Header con Avatar, nombre y email del USUARIO (admin y manager) */}
          {/* Header with Avatar, name and email of USER (admin and manager) */}
          {(viewMode === "admin" || viewMode === "manager") && (
            <div style={styles.profileHeader}>
              <Avatar
                src={visit.user_profile_picture}
                firstName={visit.user_name || "Usuario"}
                lastName={""}
                size={100}
              />
              <div style={styles.profileInfo}>
                <h3 style={styles.profileName}>{visit.user_name || "N/A"}</h3>
                <p style={styles.profileEmail}>{visit.user_email || "N/A"}</p>
              </div>
            </div>
          )}

          {/* Contenido del modal (solo vista) */}
          {/* Modal content (view-only) */}
          <div style={styles.infoSection}>
            {/* --- INICIO DE REFACTORIZACIÓN DE LAYOUT --- */}
            {/* --- START OF LAYOUT REFACTORING --- */}

            <div style={styles.journeyContainer}>
              {/* Mostrar bloque de Origen si es necesario */}
              {/* Show Origin block if needed */}
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
                <FaArrowRight style={styles.journeyArrow} />
              )}

              {/* Mostrar bloque de Destino si es necesario */}
              {/* Show Destination block if needed */}
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
            
            {/* --- FIN DE REFACTORIZACIÓN DE LAYOUT --- */}
            {/* --- END OF LAYOUT REFACTORING --- */}

            <div style={styles.dateRow}>
              <label style={styles.dateLabel}>Fecha y Hora de la Visita:</label>
              <div style={styles.dateValue}>
                {formatFullDate(visit.visit_date)}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          {/* Action buttons */}
          <div style={styles.buttonContainer}>
            {/* Botón Cerrar */}
            {/* Close Button */}
            <button
              style={{ ...styles.button, ...styles.closeBtn }}
              onClick={handleClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};