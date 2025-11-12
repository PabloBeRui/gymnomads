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
 *
 * View-only modal to display user details.
 * - Shows Avatar, name, email, phone, and home gym.
 * - Includes a "Delete User" button (for Admin/Manager).
 * - Hides "Home Gym" for "manager" role (it's redundant).
 *
 * =============================================================================
 */

import { useState, useEffect, useCallback } from "react";
// Asumimos que la interfaz UserWithGym tiene todos los datos necesarios
// We assume UserWithGym interface has all necessary data
import type { UserWithGym } from "../interfaces/user-interfaces";
import { Avatar } from "./Avatar";
import { ConfirmationModal } from "./ConfirmationModal"; // Reutilizamos el modal de confirmación
import { useAuth } from "../context/AuthContext";

/* =============================================================================
    INTERFACES
    ============================================================================= */

interface UserDetailModalProps {
  // Visibilidad del modal
  // Modal visibility
  isOpen: boolean;

  // Función al cerrar el modal
  // Function on close
  onClose: () => void;

  // Datos del usuario a mostrar
  // User data to display
  user: UserWithGym | null;

  // Función al eliminar (pasa el ID del usuario)
  // Function on delete (passes the user ID)
  onDelete: (userId: number) => void;

  // Estado de carga de la eliminación
  // Deletion loading state
  isDeleting: boolean;
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
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#6c757d",
    padding: "5px 10px",
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
  deleteButton: {
    backgroundColor: "#dc3545",
    color: "white",
    marginRight: "auto", // <-- Empuja este botón a la izquierda
  },
  closeBtn: {
    backgroundColor: "#6c757d",
    color: "white",
  },
};

/* =============================================================================
    COMPONENTE: UserDetailModal
    ============================================================================= */
export const UserDetailModal = ({
  isOpen,
  onClose,
  user,
  onDelete,
  isDeleting,
}: UserDetailModalProps) => {
  // --- Estados del componente ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user: authUser } = useAuth(); // El admin/manager autenticado

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

  // --- Lógica de Eliminación ---

  // Abrir modal de confirmación
  // Open confirmation modal
  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  // Cancelar eliminación
  // Cancel deletion
  const handleDeleteCancel = () => {
    setShowConfirmModal(false);
  };

  // Confirmar eliminación
  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (!user) return;
    await onDelete(user.id); // Llama a la función pasada por props
    setShowConfirmModal(false); // Cierra modal de confirmación
    onClose(); // Cierra modal de detalles
  };

  // --- Lógica de Permisos ---

  // ¿Puede el usuario actual eliminar a este usuario?
  // Can the current user delete this user?
  const canDelete =
    authUser?.role === "admin" || // Admin puede eliminar a cualquiera
    (authUser?.role === "manager" && // Manager puede eliminar usuarios de su gym
      authUser.home_gym_id === user?.home_gym_id);

  // --- Render ---

  if (!isOpen || !user) return null;

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
              👤 Detalles del Usuario
            </h2>
            <button
              style={styles.closeButton}
              onClick={handleClose}
              aria-label="Cerrar modal">
              ✕
            </button>
          </div>

          {/* Header con Avatar, nombre y email */}
          {/* Header with Avatar, name and email */}
          <div style={styles.profileHeader}>
            <Avatar
              src={user.profile_picture}
              firstName={user.first_name}
              lastName={user.last_name}
              size={100}
            />
            <div style={styles.profileInfo}>
              <h3 style={styles.profileName}>
                {user.first_name} {user.last_name}
              </h3>
              <p style={styles.profileEmail}>{user.email}</p>
            </div>
          </div>

          {/* Contenido del modal (solo vista) */}
          {/* Modal content (view-only) */}
          <div style={styles.infoSection}>
            <div style={styles.infoRow}>
              <label style={styles.label}>Teléfono:</label>
              <div style={styles.value}>{user.phone || "No especificado"}</div>
            </div>

            {/* --- INICIO MODIFICACIÓN: Ocultar si es Manager --- */}
            {/* --- START MODIFICATION: Hide if Manager --- */}
            {authUser?.role === "admin" && (
              // El Admin SÍ ve el gimnasio de origen
              // Admin DOES see the home gym
              <div style={styles.infoRow}>
                <label style={styles.label}>Gimnasio de Origen:</label>
                <div
                  style={{
                    ...styles.value,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                  <Avatar
                    src={user.logo_url}
                    firstName={user.gym_name}
                    lastName="" // Usar solo nombre del gym para iniciales
                    size={30} // Tamaño pequeño
                  />
                  <span>{user.gym_name}</span>
                </div>
              </div>
            )}
            {/* El Manager NO ve este bloque (es redundante) */}
            {/* Manager DOES NOT see this block (it's redundant) */}
            {/* --- FIN MODIFICACIÓN --- */}

            <div style={styles.infoRow}>
              <label style={styles.label}>Miembro desde:</label>
              <div style={styles.value}>
                {new Date(user.registered_at).toLocaleDateString("es-ES")}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          {/* Action buttons */}
          <div style={styles.buttonContainer}>
            {/* Botón Eliminar (condicional) */}
            {/* Delete Button (conditional) */}
            {canDelete && (
              <button
                style={{ ...styles.button, ...styles.deleteButton }}
                onClick={handleDeleteClick}
                disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "🗑️ Eliminar Usuario"}
              </button>
            )}

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

      {/* Modal de Confirmación para Eliminar */}
      {/* Confirmation Modal for Deletion */}
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
