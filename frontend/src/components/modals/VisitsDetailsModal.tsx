/**
 * =============================================================================
 * COMPONENTE: VisitsDetailsModal
 * =============================================================================
 *
 * Modal de "solo vista" para mostrar los detalles de una visita específica.
 * - Muestra Avatar/info del usuario y Logo/info del gimnasio.
 * - Muestra la fecha exacta de la visita.
 * - Cierre con ESC o click fuera del modal.
 *
 * View-only modal to display details of a specific visit.
 * - Shows User Avatar/info and Gym Logo/info.
 * - Shows the exact date of the visit.
 * - Close with ESC or click outside modal.
 *
 * =============================================================================
 */

import { useEffect, useCallback } from "react";
import type { VisitWithDetails } from "../../interfaces/visit-interfaces";
import type { Gym } from "../../interfaces/gym-interfaces";
import { Avatar } from "../Avatar";
import { CloseButton } from "../ui/CloseButton"; // Importar el nuevo componente

/* =============================================================================
   INTERFACES
   ============================================================================= */

interface VisitsDetailsModalProps {
  // Visibilidad del modal
  // Modal visibility
  isOpen: boolean;

  // Función al cerrar el modal
  // Function on close
  onClose: () => void;

  // Datos de la visita a mostrar
  // Visit data to display
  visit: VisitWithDetails | null;

  // Gimnasio de respaldo para vistas de manager/usuario.
  // Se utiliza cuando la información del gimnasio (nombre, ciudad, logo) no está
  // directamente disponible en el objeto 'visit' (por ejemplo, en la vista de manager,
  // donde las visitas son siempre del mismo gimnasio y la API no lo repite en cada visita).
  //
  // Fallback gym for manager/user views.
  // Used when gym information (name, city, logo) is not directly available
  // in the 'visit' object (e.g., in the manager's view, where visits are always
  // from the same gym and the API does not repeat it for each visit).
  fallbackGym?: Gym | null;

  // Modo de vista para adaptar el contenido
  // View mode to adapt content
  viewMode?: "user" | "admin";
}

/* =============================================================================
   ESTILOS (similares a ManagerDetailsModal)
   STYLES (similar to ManagerDetailsModal)
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
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative", // Añadido para posicionar el botón de cierre
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid #dee2e6",
  },
  modalTitle: {
    fontSize: "1.5rem",
    color: "#333",
    margin: 0,
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
  },
  profileInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  profileName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  profileEmail: {
    fontSize: "1rem",
    color: "#6c757d",
    margin: 0,
  },
  infoSection: {
    marginBottom: "20px",
  },
  infoRow: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#495057",
    marginBottom: "5px",
  },
  value: {
    fontSize: "1rem",
    color: "#212529",
    padding: "8px 12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    display: "flex", // <-- Añadido para alinear avatar
    alignItems: "center", // <-- Añadido para alinear avatar
    gap: "10px", // <-- Añadido para alinear avatar
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end", // Botones a la derecha
    marginTop: "20px",
    paddingTop: "15px",
    borderTop: "1px solid #dee2e6",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  closeBtn: {
    backgroundColor: "#6c757d",
    color: "white",
  },
};

/* =============================================================================
   COMPONENTE: VisitsDetailsModal
   ============================================================================= */
export const VisitsDetailsModal = ({
  isOpen,
  onClose,
  visit,
  fallbackGym,
  viewMode = "admin", // Por defecto, modo admin
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

  const gymName = visit.gym_name || fallbackGym?.name || "N/A";
  const gymCity = visit.gym_city || fallbackGym?.city || "N/A";
  const gymLogo = visit.gym_logo_url || fallbackGym?.logo_url;

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
              {viewMode === "admin" && ` (ID: ${visit.id})`}
            </h2>
            <CloseButton
              onClick={handleClose}
              ariaLabel="Cerrar detalles de la visita"
            />
          </div>

          {/* Header con Avatar, nombre y email del USUARIO (solo en modo admin) */}
          {/* Header with Avatar, name and email of USER (admin mode only) */}
          {viewMode === "admin" && (
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
            <div style={styles.infoRow}>
              <label style={styles.label}>Gimnasio Visitado:</label>
              <div style={styles.value}>
                <Avatar
                  src={gymLogo}
                  firstName={gymName}
                  lastName=""
                  size={30}
                />
                <span>{gymName}</span>
              </div>
            </div>

            <div style={styles.infoRow}>
              <label style={styles.label}>Ciudad del Gimnasio:</label>
              <div style={styles.value}>{gymCity}</div>
            </div>

            <div style={styles.infoRow}>
              <label style={styles.label}>Fecha y Hora de la Visita:</label>
              <div style={styles.value}>{formatFullDate(visit.visit_date)}</div>
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
