/**
 * =============================================================================
 * COMPONENT: ChangePasswordModal
 * =============================================================================
 *
 * Modal que contiene un formulario para que el usuario cambie su contraseña.
 * Modal that contains a form for the user to change their password.
 *
 * Props:
 * - isOpen: booleano para controlar la visibilidad del modal.
 * - onClose: función para cerrar el modal desde el padre.
 *
 * =============================================================================
 */
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

// Importar hook y servicio necesarios
// Import necessary hooks and services
import { useApiCall } from "../hooks/useApiCall";
import { changePassword } from "../services/user-services";
import { useAuth } from "../context/AuthContext";

// Importar interfaces
// Import interfaces
import type { ChangePasswordData } from "../interfaces/user-interfaces";

// Importar manejador de errores
// Import error handler
import { handleApiError } from "../utils/error-handler";
import { CloseButton } from "./ui/CloseButton"; // Importar el nuevo componente

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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    position: "relative", // Añadido para posicionar el botón de cierre
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: 4,
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  buttonRow: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  button: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "white",
  },
  submitButton: {
    backgroundColor: "#007bff",
    color: "white",
  },
  errorText: {
    color: "red",
    marginTop: "10px",
  },
};

/* =============================================================================
    PROPS DEL COMPONENTE
    COMPONENT PROPS
    ============================================================================= */
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* =============================================================================
    COMPONENTE
    COMPONENT
    ============================================================================= */
export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { token } = useAuth();

  // Estados locales para los campos del formulario
  // Local states for form fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Hook para la llamada a la API
  // Hook for the API call
  const {
    loading: isChangingPassword,
    error,
    execute,
  } = useApiCall<{ message: string }>();

  // Efecto para limpiar los campos cuando el modal se cierra
  // Effect to clear fields when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [isOpen]);

  // Manejador del envío del formulario
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    // Validations
    if (!token) {
      toast.error("No estás autenticado.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const passwordData: ChangePasswordData = { currentPassword, newPassword };

    try {
      const response = await execute(() => changePassword(token, passwordData));
      toast.success(response.message || "Contraseña cambiada con éxito.");
      onClose(); // Cerrar el modal si la operación es exitosa // Close modal on success
    } catch (err) {
      // El hook useApiCall ya establece el error, aquí solo lo mostramos
      // The useApiCall hook already sets the error, here we just display it
      const msg = handleApiError(err, "No se pudo cambiar la contraseña.");
      toast.error(msg);
    }
  };

  // No renderizar nada si el modal no está abierto
  // Don't render anything if the modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} ariaLabel="Cerrar modal de cambio de contraseña" />
        <h3 style={styles.modalTitle}>Cambiar Contraseña</h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="modal-current-password" style={styles.label}>
              Contraseña Actual
            </label>
            <input
              id="modal-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
              disabled={isChangingPassword}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="modal-new-password" style={styles.label}>
              Nueva Contraseña
            </label>
            <input
              id="modal-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              disabled={isChangingPassword}
              minLength={6}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="modal-confirm-password" style={styles.label}>
              Confirmar Nueva Contraseña
            </label>
            <input
              id="modal-confirm-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={styles.input}
              disabled={isChangingPassword}
              minLength={6}
              required
            />
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <div style={styles.buttonRow}>
            <button
              type="button"
              style={{ ...styles.button, ...styles.cancelButton }}
              onClick={onClose}
              disabled={isChangingPassword}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ ...styles.button, ...styles.submitButton }}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Cambiando..." : "Establecer Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};