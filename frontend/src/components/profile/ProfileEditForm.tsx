/**
 * =============================================================================
 * COMPONENTE: ProfileEditForm
 * COMPONENT: ProfileEditForm
 * =============================================================================
 *
 * Descripción: Formulario para editar el perfil del usuario.
 * Permite modificar nombre, apellido, teléfono y subir una nueva foto de perfil.
 *
 * Description: Form to edit user profile.
 * Allows modifying first name, last name, phone, and uploading a new profile picture.
 *
 * =============================================================================
 */

import React from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { Avatar, Spinner } from "../ui";
import type { User } from "../../interfaces";
import styles from "../../pages/ProfilePage.module.scss"; // Reutilizar estilos / Reuse styles
import clsx from "clsx";

interface ProfileEditFormProps {
  user: User;
  // Estados del formulario / Form states
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  // Estados de imagen (del hook useImageUpload) / Image states (from useImageUpload hook)
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageClick: () => void;
  selectedFile: File | null;
  // Estados de control / Control states
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  previewUrl,
  fileInputRef,
  handleFileChange,
  handleImageClick,
  selectedFile,
  isSaving,
  onSave,
  onCancel,
}) => {
  return (
    <>
      {/* --- Sección de Imagen de Perfil (Edición) --- */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="d-flex flex-column align-items-center p-4">
          <input
            id="profile-file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp, image/jpg"
            style={{ display: "none" }}
          />

          <Avatar
            src={previewUrl}
            firstName={user.first_name || ""}
            lastName={user.last_name || ""}
            size={150}
            onClick={handleImageClick}
            className={clsx("mb-3 cursor-pointer shadow-sm")}
          />

          <small className="text-center mb-3 text-dark">
            {selectedFile
              ? `Archivo: ${selectedFile.name}`
              : "Haz clic en el avatar para cambiar la foto."}
            <br />
            (PNG/JPG/WEBP, max 5MB. Opcional)
          </small>

          <Form className="w-100">
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-dark">Email:</Form.Label>
              <Form.Control
                type="text"
                value={user.email}
                disabled
                readOnly
                className={styles.disabledFormControl}
              />
            </Form.Group>
            {(user.role === "admin" || user.role === "manager") && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Rol:</Form.Label>
                <Form.Control
                  type="text"
                  value={user.role}
                  disabled
                  readOnly
                  className={styles.disabledFormControl}
                />
              </Form.Group>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* --- Sección de Información Personal (Edición) --- */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <h4 className="mb-4 fw-bold text-primary">Información Personal</h4>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="edit-first-name">
                  <Form.Label className="fw-bold text-dark">Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={styles.formControl}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="edit-last-name">
                  <Form.Label className="fw-bold text-dark">
                    Apellidos:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={styles.formControl}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="edit-phone">
              <Form.Label className="fw-bold text-dark">Teléfono:</Form.Label>
              <Form.Control
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Opcional"
                className={styles.formControl}
              />
            </Form.Group>

            {/* Botones de Acción */}
            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" variant="light" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};
