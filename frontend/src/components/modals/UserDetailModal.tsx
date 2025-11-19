/**
 * =============================================================================
 * COMPONENTE: UserDetailModal
 * COMPONENT: UserDetailModal
 * =============================================================================
 *
 * Modal de "solo vista" para mostrar los detalles de un usuario.
 * - Muestra Avatar, nombre, email, teléfono y gimnasio de origen.
 * - Incluye un botón "Eliminar Usuario" (para Admin/Manager).
 * - Oculta "Gimnasio de Origen" para el rol "manager" (es redundante).
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * View-only modal to display user details.
 * - Shows Avatar, name, email, phone, and home gym.
 * - Includes a "Delete User" button (for Admin/Manager).
 * - Hides "Home Gym" for "manager" role (it's redundant).
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import type { UserWithGym } from "../../interfaces/user-interfaces";
import { Avatar } from "../Avatar";
import { ConfirmationModal } from "../modals/ConfirmationModal"; // Reutilizamos el modal de confirmación / Reuse confirmation modal
import { useAuth } from "../../context/AuthContext";
import { CloseButton } from "../ui/CloseButton"; // Importar el nuevo componente / Import the new component
import { useCallback, useEffect, useState } from "react";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import styles from "./UserDetailModal.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
    INTERFACES
    ============================================================================= */

interface UserDetailModalProps {
  // Visibilidad del modal / Modal visibility
  isOpen: boolean;

  // Función al cerrar el modal / Function on close
  onClose: () => void;

  // Datos del usuario a mostrar / User data to display
  user: UserWithGym | null;

  // Función al eliminar (pasa el ID del usuario) / Function on delete (passes the user ID)
  onDelete: (userId: number) => void;

  // Estado de carga de la eliminación / Deletion loading state
  isDeleting: boolean;
}

/* =============================================================================
    COMPONENTE: UserDetailModal
    COMPONENT: UserDetailModal
    ============================================================================= */
export const UserDetailModal = ({
  isOpen,
  onClose,
  user,
  onDelete,
  isDeleting,
}: UserDetailModalProps) => {
  // --- Estados del componente --- / --- Component states ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user: authUser } = useAuth(); // El admin/manager autenticado / The authenticated admin/manager

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

  // --- Lógica de Eliminación --- / --- Deletion Logic ---

  // Abrir modal de confirmación / Open confirmation modal
  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  // Cancelar eliminación / Cancel deletion
  const handleDeleteCancel = () => {
    setShowConfirmModal(false);
  };

  // Confirmar eliminación / Confirm deletion
  const handleConfirmDelete = async () => {
    if (!user) return;
    await onDelete(user.id); // Llama a la función pasada por props / Calls the function passed by props
    setShowConfirmModal(false); // Cierra modal de confirmación / Closes confirmation modal
    onClose(); // Cierra modal de detalles / Closes details modal
  };

  // --- Lógica de Permisos --- / --- Permissions Logic ---

  // ¿Puede el usuario actual eliminar a este usuario? / Can the current user delete this user?
  const canDelete =
    authUser?.role === "admin" || // Admin puede eliminar a cualquiera / Admin can delete anyone
    (authUser?.role === "manager" && // Manager puede eliminar usuarios de su gym / Manager can delete users from their gym
      authUser.home_gym_id === user?.home_gym_id);

  // --- Render ---

  if (!isOpen || !user) return null;

  return (
    <>
      <Modal show={isOpen} onHide={handleClose} centered size="lg">
        <Modal.Header className={styles.modalHeader}>
          <Modal.Title className={clsx(styles.modalTitle, "text-primary")}>
            👤 Detalles del Usuario
          </Modal.Title>
          <CloseButton onClick={handleClose} ariaLabel="Cerrar detalles del usuario" colorVariant="primary" />
        </Modal.Header>
        <Modal.Body>
          {/* Header con Avatar, nombre y email / Header with Avatar, name and email */}
          <div className={styles.profileHeader}>
            <Avatar
              src={user.profile_picture}
              firstName={user.first_name}
              lastName={user.last_name}
              size={100}
            />
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>
                {user.first_name} {user.last_name}
              </h3>
              <p className={styles.profileEmail}>{user.email}</p>
            </div>
          </div>

          {/* Contenido del modal (solo vista) / Modal content (view-only) */}
          <Form className={styles.infoSection}>
            <Form.Group as={Row} className={styles.infoRow}>
              <Form.Label column sm={4} className={clsx(styles.label, "text-dark")}>Teléfono:</Form.Label>
              <Col sm={8}>
                <div className={styles.value}>{user.phone || "No especificado"}</div>
              </Col>
            </Form.Group>

            {/* ---  Mostrar gimnasio de origen y ciudad al Admin --- */}
            {/* ---  Show home gym and city to Admin --- */}
            {authUser?.role === "admin" && (
              // El Admin SÍ ve el gimnasio de origen y la ciudad / Admin DOES see the home gym and city
              <Form.Group as={Row} className={styles.infoRow}>
                <Form.Label column sm={4} className={clsx(styles.label, "text-dark")}>Gimnasio de Origen:</Form.Label>
                <Col sm={8}>
                  <div className={clsx(styles.value, "d-flex align-items-center gap-2")}>
                    <Avatar
                      src={user.logo_url}
                      firstName={user.gym_name}
                      lastName=""
                      size={30}
                    />
                    {/* Mostramos "Nombre (Ciudad)" / We show "Name (City)" */}
                    <span>
                      {user.gym_name} ({user.gym_city || "Ciudad desconocida"})
                    </span>
                  </div>
                </Col>
              </Form.Group>
            )}
            {/* El Manager NO ve este bloque (es redundante) / Manager DOES NOT see this block (it's redundant) */}
            
            <Form.Group as={Row} className={styles.infoRow}>
              <Form.Label column sm={4} className={clsx(styles.label, "text-dark")}>Miembro desde:</Form.Label>
              <Col sm={8}>
                <div className={styles.value}>
                  {new Date(user.registered_at).toLocaleDateString("es-ES")}
                </div>
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={styles.buttonContainer}>
          {/* Botón Eliminar (condicional) / Delete Button (conditional) */}
          {canDelete && (
            <Button
              variant="danger"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={styles.deleteButton}
            >
              {isDeleting ? "Eliminando..." : "🗑️ Eliminar Usuario"}
            </Button>
          )}

          {/* Botón Cerrar / Close Button */}
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación para Eliminar / Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onCancel={handleDeleteCancel}
        onConfirm={handleConfirmDelete}
        title="⚠️ Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar al usuario "${user.first_name} ${user.last_name}" (${user.email})?`}
        warningMessage="Esta acción eliminará al usuario y todo su historial de visitas."
        note="Esta acción NO se puede deshacer."
        confirmText="Eliminar Usuario"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
};