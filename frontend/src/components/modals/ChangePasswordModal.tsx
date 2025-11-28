/**
 * =============================================================================
 * COMPONENTE: ChangePasswordModal
 * COMPONENT: ChangePasswordModal
 * =============================================================================
 *
 * Modal que contiene un formulario para que el usuario cambie su contraseña.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Modal that contains a form for the user to change their password.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * Props:
 * - isOpen: booleano para controlar la visibilidad del modal. / boolean to control modal visibility.
 * - onClose: función para cerrar el modal desde el padre. / function to close the modal from the parent.
 *
 * =============================================================================
 */
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

// Importar hook y servicio necesarios / Import necessary hooks and services
import { useApiCall } from "../../hooks";
import { changePassword } from "../../services";
import { useAuth } from "../../context/AuthContext";

// Importar interfaces / Import interfaces
import type { ChangePasswordData } from "../../interfaces";

// Importar manejador de errores / Import error handler
import { handleApiError } from "../../utils";
import { CloseButton } from "../ui/CloseButton"; // Importar el nuevo componente / Import the new component

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Modal, Form, Button, Alert } from "react-bootstrap";
import styles from "./ChangePasswordModal.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx
import Spinner from "../ui/Spinner";

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

  // Estados locales para los campos del formulario / Local states for form fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Hook para la llamada a la API / Hook for the API call
  const {
    loading: isChangingPassword,
    error,
    execute,
  } = useApiCall<{ message: string }>();

  // Efecto para limpiar los campos cuando el modal se cierra / Effect to clear fields when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [isOpen]);

  // Manejador del envío del formulario / Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones / Validations
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
      onClose(); // Cerrar el modal si la operación es exitosa / Close modal on success
    } catch (err) {
      // El hook useApiCall ya establece el error, aquí solo lo mostramos
      // The useApiCall hook already sets the error, here we just display it
      const msg = handleApiError(err, "No se pudo cambiar la contraseña.");
      toast.error(msg);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header className="d-flex justify-content-between align-items-center">
        <Modal.Title className={clsx(styles.modalTitle, "text-primary")}>Cambiar Contraseña</Modal.Title>
        <CloseButton onClick={onClose} ariaLabel="Cerrar modal de cambio de contraseña" color="#FFB700" className={styles.modalCloseButton} />
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className={styles.formGroup} controlId="modal-current-password">
            <Form.Label className={clsx(styles.label, "text-dark")}>Contraseña Actual</Form.Label>
            <Form.Control
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={styles.input}
              disabled={isChangingPassword}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup} controlId="modal-new-password">
            <Form.Label className={clsx(styles.label, "text-dark")}>Nueva Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              disabled={isChangingPassword}
              minLength={6}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup} controlId="modal-confirm-password">
            <Form.Label className={clsx(styles.label, "text-dark")}>Confirmar Nueva Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={styles.input}
              disabled={isChangingPassword}
              minLength={6}
              required
            />
          </Form.Group>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          <div className={styles.buttonRow}>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isChangingPassword}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? <Spinner size="sm" variant="dark" /> : "Establecer Contraseña"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
