/**
 * =============================================================================
 * COMPONENTE: ConfirmationModal
 * =============================================================================
 *
 * Modal reutilizable para confirmación de acciones críticas (eliminar, etc.).
 * - Permite cerrar haciendo click fuera del modal (en el overlay)
 * - Permite cerrar presionando la tecla ESC
 *  *  *
 * Reusable modal for confirming critical actions (delete, etc.).
 * - Allows closing by clicking outside the modal (on the overlay)
 * - Allows closing by pressing the ESC key
 *  *  *
 * =============================================================================
 */

import { useEffect } from "react";

/* =============================================================================
   INTERFACES
   ============================================================================= */

interface ConfirmationModalProps {
  // Visibilidad del modal / Modal visibility
  isOpen: boolean;

  // Función al cerrar/cancelar / Function on close/cancel
  onCancel: () => void;

  // Función al confirmar / Function on confirm
  onConfirm: () => void;

  // Título del modal / Modal title
  title: string;

  // Mensaje principal / Main message
  message: string;

  // Mensaje de advertencia (opcional) / Warning message (optional)
  warningMessage?: string;

  // Nota adicional (opcional) / Additional note (optional)
  note?: string;

  // Texto del botón confirmar / Confirm button text
  confirmText?: string;

  // Texto del botón cancelar / Cancel button text
  cancelText?: string;

  // Variante de color (danger, warning, info) / Color variant
  variant?: "danger" | "warning" | "info";

  // Deshabilitar botones mientras se procesa / Disable buttons while processing
  isLoading?: boolean;
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
    animation: "fadeIn 0.2s ease-in-out",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    animation: "slideIn 0.2s ease-in-out",
  },
  modalTitle: {
    fontSize: "1.5rem",
    marginBottom: "15px",
    color: "#333",
  },
  modalText: {
    fontSize: "1rem",
    marginBottom: "20px",
    color: "#666",
    lineHeight: "1.5",
  },
  warningText: {
    fontSize: "1rem",
    marginBottom: "15px",
    fontWeight: "bold",
    lineHeight: "1.5",
  },
  noteText: {
    fontSize: "0.9rem",
    marginBottom: "20px",
    color: "#666",
    fontStyle: "italic",
  },
  modalButtons: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  modalButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "white",
  },
};

/* =============================================================================
   VARIANTES DE COLOR
   COLOR VARIANTS
   ============================================================================= */

const variantColors = {
  danger: {
    text: "#dc3545",
    button: "#dc3545",
    buttonHover: "#c82333",
  },
  warning: {
    text: "#fd7e14",
    button: "#fd7e14",
    buttonHover: "#e66a00",
  },
  info: {
    text: "#0dcaf0",
    button: "#0dcaf0",
    buttonHover: "#0ab0d1",
  },
};

/* =============================================================================
   COMPONENTE: ConfirmationModal
   COMPONENT: ConfirmationModal
   ============================================================================= */

export const ConfirmationModal = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  warningMessage,
  note,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) => {
  // Obtener colores según la variante / Get colors based on variant
  const colors = variantColors[variant];

  // Manejar tecla ESC para cerrar el modal / Handle ESC key to close modal
  useEffect(() => {
    // Función para detectar tecla ESC / Function to detect ESC key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    // Añadir event listener / Add event listener
    document.addEventListener("keydown", handleEscKey);

    // Limpiar event listener al desmontar / Clean up event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onCancel]);

  // No renderizar si el modal no está abierto / Don't render if modal is not open
  if (!isOpen) return null;

  // Render del modal / Modal render
  return (
    <div
      style={styles.modalOverlay}
      onClick={onCancel} // Click en overlay cierra el modal / Click on overlay closes modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title">
      <div
        style={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // Evitar que el click cierre el modal / Prevent click from closing modal
      >
        {/* Título del modal / Modal title */}
        <h2 id="modal-title" style={styles.modalTitle}>
          {title}
        </h2>

        {/* Mensaje principal / Main message */}
        <p style={styles.modalText}>{message}</p>

        {/* Mensaje de advertencia (opcional) / Warning message (optional) */}
        {warningMessage && (
          <p
            style={{
              ...styles.warningText,
              color: colors.text,
            }}>
            {warningMessage}
          </p>
        )}

        {/* Nota adicional (opcional) / Additional note (optional) */}
        {note && <p style={styles.noteText}>{note}</p>}

        {/* Botones de acción / Action buttons */}
        <div style={styles.modalButtons}>
          {/* Botón cancelar / Cancel button */}
          <button
            style={styles.modalButton}
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cancelar acción">
            {cancelText}
          </button>

          {/* Botón confirmar / Confirm button */}
          <button
            style={{
              ...styles.modalButton,
              backgroundColor: colors.button,
              color: "white",
            }}
            onClick={onConfirm}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = colors.buttonHover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.button;
            }}
            aria-label="Confirmar acción">
            {isLoading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
