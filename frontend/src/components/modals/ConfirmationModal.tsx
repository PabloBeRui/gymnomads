/**
 * =============================================================================
 * COMPONENTE: ConfirmationModal
 * COMPONENT: ConfirmationModal
 * =============================================================================
 *
 * Modal reutilizable para confirmación de acciones críticas (eliminar, etc.).
 * - Permite cerrar haciendo click fuera del modal (en el overlay)
 * - Permite cerrar presionando la tecla ESC
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Reusable modal for confirming critical actions (delete, etc.).
 * - Allows closing by clicking outside the modal (on the overlay)
 * - Allows closing by pressing the ESC key
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import { useEffect } from "react";
import { Modal, Button } from "react-bootstrap"; // Importar componentes de React-Bootstrap / Import React-Bootstrap components
import styles from "./ConfirmationModal.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx
import { CloseButton } from "../ui/CloseButton"; // Importar el componente CloseButton // Import the CloseButton component

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

  // Determinar la variante de color del botón de confirmación / Determine the color variant of the confirmation button
  let confirmButtonVariant: string;
  switch (variant) {
    case "danger":
      confirmButtonVariant = "danger";
      break;
    case "warning":
      confirmButtonVariant = "warning";
      break;
    case "info":
      confirmButtonVariant = "info";
      break;
    default:
      confirmButtonVariant = "danger";
  }

  return (
    <Modal show={isOpen} onHide={onCancel} centered>
      <Modal.Header className="d-flex justify-content-between align-items-center">
        <Modal.Title className={clsx(styles.modalTitle, "text-dark")}>{title}</Modal.Title>
        <CloseButton onClick={onCancel} ariaLabel="Cerrar modal de confirmación" colorVariant="primary" />
      </Modal.Header>
      <Modal.Body>
        <p className={styles.modalText}>{message}</p>

        {warningMessage && (
          <p className={clsx(styles.warningText, `text-${variant}`)}>
            {warningMessage}
          </p>
        )}

        {note && <p className={styles.noteText}>{note}</p>}
      </Modal.Body>
      <Modal.Footer className={styles.modalButtons}>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={confirmButtonVariant} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Procesando..." : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};