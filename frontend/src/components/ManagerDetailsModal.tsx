/**
 * =============================================================================
 * COMPONENTE: ManagerDetailsModal
 * =============================================================================
 *
 * Modal para visualizar y editar la información de un manager.
 *
 * FUNCIONALIDADES:
 * - Visualizar todos los datos del manager (nombre, apellidos, email, teléfono, gimnasio)
 * - Editar nombre, apellidos y teléfono
 * - Email NO editable (vinculado al gimnasio)
 * - Dos modos: Vista (lectura) y Edición
 * - Validaciones en tiempo real
 * - Cierre con ESC o click fuera del modal
 *
 * IMPORTANTE: El manager NO se puede eliminar desde este modal.
 * Solo se elimina al eliminar el gimnasio asociado (acción en CASCADE).
 *
 * Modal to view and edit manager information.
 *
 * FEATURES:
 * - View all manager data (name, last name, email, phone, gym)
 * - Edit name, last name and phone
 * - Email NOT editable (linked to gym)
 * - Two modes: View (read) and Edit
 * - Real-time validations
 * - Close with ESC or click outside modal
 *
 * IMPORTANT: The manager CANNOT be deleted from this modal.
 * It's only deleted when the associated gym is deleted (CASCADE action).
 *
 * =============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import type { ManagerWithGym } from "../interfaces/user-interfaces";

/* =============================================================================
   INTERFACES
   ============================================================================= */

interface ManagerDetailsModalProps {
  // Visibilidad del modal / Modal visibility
  isOpen: boolean;

  // Función al cerrar el modal / Function on close
  onClose: () => void;

  // Datos del manager a mostrar / Manager data to display
  manager: ManagerWithGym | null;

  // Función al guardar cambios / Function on save changes
  onSave: (managerId: number, updatedData: UpdateManagerData) => Promise<void>;
}

// Datos que se pueden actualizar del manager / Manager updatable data
export interface UpdateManagerData {
  first_name: string;
  last_name: string;
  phone?: string;
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
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    animation: "slideIn 0.2s ease-in-out",
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
  input: {
    fontSize: "1rem",
    padding: "8px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
  },
  lockedValue: {
    fontSize: "1rem",
    color: "#6c757d",
    padding: "8px 12px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  helperText: {
    fontSize: "0.85rem",
    color: "#6c757d",
    marginTop: "5px",
  },
  errorText: {
    fontSize: "0.85rem",
    color: "#dc3545",
    marginTop: "5px",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
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
    transition: "background-color 0.2s",
  },
  editButton: {
    backgroundColor: "#007bff",
    color: "white",
  },
  saveButton: {
    backgroundColor: "#28a745",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "white",
  },
};

/* =============================================================================
   COMPONENTE: ManagerDetailsModal
   COMPONENT: ManagerDetailsModal
   ============================================================================= */

export const ManagerDetailsModal = ({
  isOpen,
  onClose,
  manager,
  onSave,
}: ManagerDetailsModalProps) => {
  // --- Estados del componente / Component states ---
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Estados de campos editables / Editable fields states
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Estados de validación / Validation states
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  // Validar campos / Validate fields
  const validateFields = (): boolean => {
    const newErrors: { firstName?: string; lastName?: string } = {};

    if (firstName.trim().length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres.";
    }

    if (lastName.trim().length < 2) {
      newErrors.lastName = "Los apellidos deben tener al menos 2 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar guardado / Handle save
  const handleSave = async () => {
    if (!manager) return;

    // Validar campos
    if (!validateFields()) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedData: UpdateManagerData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
      };

      await onSave(manager.id, updatedData);

      // Salir del modo edición
      setIsEditMode(false);

      // Cerrar el modal tras guardar exitosamente
      // Close modal after successful save
      onClose();
    } catch (error) {
      // El error ya se maneja en el componente padre en toast
      // Error is already handled in parent component in toast

      if (import.meta.env.DEV) {
        console.error("Error al guardar cambios del manager:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar cancelación de edición / Handle edit cancellation
  const handleCancelEdit = useCallback(() => {
    // Restaurar valores originales
    if (manager) {
      setFirstName(manager.first_name || "");
      setLastName(manager.last_name || "");
      setPhone(manager.phone || "");
    }
    setErrors({});
    setIsEditMode(false);
  }, [manager]);

  // Manejar cierre del modal / Handle modal close
  const handleClose = useCallback(() => {
    if (isEditMode) {
      handleCancelEdit();
    }
    onClose();
  }, [isEditMode, handleCancelEdit, onClose]);

  // Inicializar campos cuando se abre el modal o cambia el manager
  // Initialize fields when modal opens or manager changes
  useEffect(() => {
    if (manager) {
      setFirstName(manager.first_name || "");
      setLastName(manager.last_name || "");
      setPhone(manager.phone || "");
      setErrors({});
      setIsEditMode(false);
    }
  }, [manager]);

  // Manejar tecla ESC para cerrar el modal / Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isSaving) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, isSaving, handleClose]); //  handleClose

  // No renderizar si el modal no está abierto o no hay manager
  // Don't render if modal is not open or there's no manager
  if (!isOpen || !manager) return null;

  // Render del modal / Modal render
  return (
    <div
      style={styles.modalOverlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title">
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header del modal / Modal header */}
        <div style={styles.modalHeader}>
          <h2 id="modal-title" style={styles.modalTitle}>
            👤 Información del Manager
          </h2>
          <button
            style={styles.closeButton}
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        {/* Contenido del modal / Modal content */}
        <div style={styles.infoSection}>
          {/* Nombre / First Name */}
          <div style={styles.infoRow}>
            <label style={styles.label}>Nombre:</label>
            {isEditMode ? (
              <>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    ...styles.input,
                    borderColor: errors.firstName ? "#dc3545" : "#ced4da",
                  }}
                  placeholder="Ej: Pablo"
                  disabled={isSaving}
                />
                {errors.firstName && (
                  <span style={styles.errorText}>{errors.firstName}</span>
                )}
              </>
            ) : (
              <div style={styles.value}>{manager.first_name}</div>
            )}
          </div>

          {/* Apellidos / Last Name */}
          <div style={styles.infoRow}>
            <label style={styles.label}>Apellidos:</label>
            {isEditMode ? (
              <>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    ...styles.input,
                    borderColor: errors.lastName ? "#dc3545" : "#ced4da",
                  }}
                  placeholder="Ej: Bernabéu Ruiz"
                  disabled={isSaving}
                />
                {errors.lastName && (
                  <span style={styles.errorText}>{errors.lastName}</span>
                )}
              </>
            ) : (
              <div style={styles.value}>{manager.last_name}</div>
            )}
          </div>

          {/* Email (no editable) */}
          <div style={styles.infoRow}>
            <label style={styles.label}>Email:</label>
            <div style={styles.lockedValue}>🔒 {manager.email}</div>
            <span style={styles.helperText}>
              El email está vinculado al gimnasio y no se puede modificar.
            </span>
          </div>

          {/* Teléfono / Phone */}
          <div style={styles.infoRow}>
            <label style={styles.label}>Teléfono:</label>
            {isEditMode ? (
              <>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.input}
                  placeholder="Ej: +34 666 555 444"
                  disabled={isSaving}
                />
                <span style={styles.helperText}>Opcional</span>
              </>
            ) : (
              <div style={styles.value}>
                {manager.phone || "No especificado"}
              </div>
            )}
          </div>

          {/* Gimnasio (no editable) */}
          <div style={styles.infoRow}>
            <label style={styles.label}>Gimnasio:</label>
            <div style={styles.value}>{manager.gym_name}</div>
          </div>

          {/* Ciudad (no editable) */}
          <div style={styles.infoRow}>
            <label style={styles.label}>Ciudad:</label>
            <div style={styles.value}>{manager.gym_city}</div>
          </div>
        </div>

        {/* Botones de acción / Action buttons */}
        <div style={styles.buttonContainer}>
          {isEditMode ? (
            // Modo edición: Guardar y Cancelar / Edit mode: Save and Cancel
            <>
              <button
                style={{ ...styles.button, ...styles.cancelButton }}
                onClick={handleCancelEdit}
                disabled={isSaving}>
                Cancelar
              </button>
              <button
                style={{ ...styles.button, ...styles.saveButton }}
                onClick={handleSave}
                disabled={isSaving}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = "#218838";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#28a745";
                }}>
                {isSaving ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </>
          ) : (
            // Modo vista: Editar y Cerrar / View mode: Edit and Close
            <>
              <button
                style={{ ...styles.button, ...styles.cancelButton }}
                onClick={handleClose}>
                Cerrar
              </button>
              <button
                style={{ ...styles.button, ...styles.editButton }}
                onClick={() => setIsEditMode(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0056b3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#007bff";
                }}>
                ✏️ Editar Información
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
