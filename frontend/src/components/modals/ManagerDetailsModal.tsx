/**
 * =============================================================================
 * COMPONENTE: ManagerDetailsModal
 * COMPONENT: ManagerDetailsModal
 * =============================================================================
 *
 * Modal para visualizar y editar la información de un manager.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * FUNCIONALIDADES:
 * - Visualizar todos los datos del manager (nombre, apellidos, email, teléfono, gimnasio)
 * - Foto de perfil con Avatar component (imagen real o iniciales con color)
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
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * FEATURES:
 * - View all manager data (name, last name, email, phone, gym)
 * - Profile picture with Avatar component (real image or initials with color)
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
import type { ManagerWithGym } from "../../interfaces/user-interfaces";
import { Avatar } from "../Avatar";
import { CloseButton } from "../ui/CloseButton"; // Importar el nuevo componente / Import the new component
import { useMediaQuery } from "../../hooks/useMediaQuery"; // Importar hook de media query / Import media query hook

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import styles from "./ManagerDetailsModal.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

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
  const isMobile = useMediaQuery("(max-width: 767.98px)"); // Detectar móvil / Detect mobile

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
  const validateFields = useCallback((): boolean => {
    const newErrors: { firstName?: string; lastName?: string } = {};

    if (firstName.trim().length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres.";
    }

    if (lastName.trim().length < 2) {
      newErrors.lastName = "Los apellidos deben tener al menos 2 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName]);

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
  // ESTA FUNCION DEBE ESTAR DEFINIDA ANTES DE USARSE EN useEffect
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
  }, [isOpen, isSaving, handleClose]);

  // No renderizar si el modal no está abierto o no hay manager
  // Don't render if modal is not open or there's no manager
  if (!isOpen || !manager) return null;

  // Render del modal / Modal render
  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title className={clsx(styles.modalTitle, "text-primary")}>
          Información del Manager
        </Modal.Title>
        <CloseButton onClick={handleClose} ariaLabel="Cerrar información del manager" color="#FFB700" />
      </Modal.Header>
      <Modal.Body>
        {/* Header con Avatar, nombre y email / Header with Avatar, name and email */}
        <div className={styles.profileHeader}>
          <Avatar
            src={manager.profile_picture}
            firstName={manager.first_name}
            lastName={manager.last_name}
            size={100}
            className={styles.avatar}
          />
          <h3 className={styles.profileName}>
            {manager.first_name} {manager.last_name}
          </h3>
          <p className={styles.profileEmail}>{manager.email}</p>
        </div>

        {/* Contenido del modal (campos editables) / Modal content (editable fields) */}
        <Form className={styles.infoSection}>
          <Row>
            {/* Nombre y Apellidos (Lógica condicional para móvil/escritorio) */}
            {/* First and Last Name (Conditional logic for mobile/desktop) */}
            {isMobile && !isEditMode ? (
              // Móvil + Vista: Un solo campo "Nombre" con nombre completo
              // Mobile + View: Single "Name" field with full name
              <Col xs={12} className={styles.infoRow}>
                <Form.Group controlId="managerFullName">
                  <Form.Label className={clsx(styles.label, "text-dark")}>Nombre:</Form.Label>
                  <div className={styles.value}>
                    {manager.first_name} {manager.last_name}
                  </div>
                </Form.Group>
              </Col>
            ) : (
              // Escritorio o Edición: Campos separados
              // Desktop or Edit: Separate fields
              <>
                {/* Nombre / First Name */}
                <Col md={6} className={styles.infoRow}>
                  <Form.Group controlId="managerFirstName">
                    <Form.Label className={clsx(styles.label, "text-dark")}>Nombre:</Form.Label>
                    {isEditMode ? (
                      <>
                        <Form.Control
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          isInvalid={!!errors.firstName}
                          placeholder="Ej: Pablo"
                          disabled={isSaving}
                          className={styles.input}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName}
                        </Form.Control.Feedback>
                      </>
                    ) : (
                      <div className={styles.value}>{manager.first_name}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* Apellidos / Last Name */}
                <Col md={6} className={styles.infoRow}>
                  <Form.Group controlId="managerLastName">
                    <Form.Label className={clsx(styles.label, "text-dark")}>Apellidos:</Form.Label>
                    {isEditMode ? (
                      <>
                        <Form.Control
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          isInvalid={!!errors.lastName}
                          placeholder="Ej: Bernabéu Ruiz"
                          disabled={isSaving}
                          className={styles.input}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName}
                        </Form.Control.Feedback>
                      </>
                    ) : (
                      <div className={styles.value}>{manager.last_name}</div>
                    )}
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>

          {/* Email (no editable) / Email (not editable) */}
          <Form.Group controlId="managerEmail" className={styles.infoRow}>
            <Form.Label className={clsx(styles.label, "text-dark")}>Email:</Form.Label>
            <div className={styles.lockedValue}>
              🔒 {manager.email}
            </div>
            <Form.Text className={styles.helperText}>
              El email está vinculado al gimnasio y no se puede modificar.
            </Form.Text>
          </Form.Group>

          {/* Teléfono / Phone */}
          <Form.Group controlId="managerPhone" className={styles.infoRow}>
            <Form.Label className={clsx(styles.label, "text-dark")}>Teléfono:</Form.Label>
            {isEditMode ? (
              <>
                <Form.Control
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +34 666 555 444"
                  disabled={isSaving}
                />
                <Form.Text className={styles.helperText}>Opcional</Form.Text>
              </>
            ) : (
              <div className={styles.value}>
                {manager.phone || "No especificado"}
              </div>
            )}
          </Form.Group>

          {/* Gimnasio (no editable) / Gym (not editable) */}
          <Form.Group controlId="managerGym" className={styles.infoRow}>
            <Form.Label className={clsx(styles.label, "text-dark")}>Gimnasio:</Form.Label>
            <div className={clsx(styles.value, "d-flex align-items-center gap-2")}>
              <Avatar
                src={manager.logo_url}
                firstName={manager.gym_name}
                lastName=""
                size={30}
              />
              <span>
                {manager.gym_name}
              </span>
            </div>
          </Form.Group>

          {/* Ciudad (no editable) / City (not editable) */}
          <Form.Group controlId="managerCity" className={styles.infoRow}>
            <Form.Label className={clsx(styles.label, "text-dark")}>Ciudad:</Form.Label>
            <div className={styles.value}>{manager.gym_city}</div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className={styles.buttonContainer}>
        {isEditMode ? (
          // Modo edición: Guardar y Cancelar / Edit mode: Save and Cancel
          <>
            <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "💾 Guardar Cambios"}
            </Button>
          </>
        ) : (
          // Modo vista: Editar / View mode: Edit
          <Button variant="primary" onClick={() => setIsEditMode(true)}>
            ✏️ Editar Información
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};