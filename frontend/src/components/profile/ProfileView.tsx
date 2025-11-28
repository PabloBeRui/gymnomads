/**
 * =============================================================================
 * COMPONENTE: ProfileView
 * COMPONENT: ProfileView
 * =============================================================================
 *
 * Descripción: Muestra la vista de solo lectura del perfil del usuario.
 * Incluye información básica (nombre, email, rol, gimnasio, teléfono) y botones
 * para iniciar la edición o cambiar la contraseña.
 *
 * Description: Displays the read-only view of the user profile.
 * Includes basic information (name, email, role, gym, phone) and buttons
 * to start editing or change the password.
 *
 * =============================================================================
 */

import React from "react";
import { Card, Form, Button } from "react-bootstrap";
import { Avatar } from "../ui";
import { Spinner } from "../ui";
import type { User } from "../../interfaces";
import styles from "../../pages/ProfilePage.module.scss"; // Reutilizar estilos existentes / Reuse existing styles

interface ProfileViewProps {
  user: User;
  gymName: string | null;
  gymLogoUrl: string | null;
  gymFetchError: string | null;
  backendBaseUrl: string;
  onEditClick: () => void;
  onChangePasswordClick: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  gymName,
  gymLogoUrl,
  gymFetchError,
  backendBaseUrl,
  onEditClick,
  onChangePasswordClick,
}) => {
  // Construir URL de la imagen de perfil / Build profile picture URL
  const profilePicUrl = user.profile_picture
    ? user.profile_picture.startsWith("http")
      ? user.profile_picture
      : `${backendBaseUrl}/${user.profile_picture.replace(/^\/+/, "")}`
    : null;

  return (
    <>
      {/* --- Sección de Imagen de Perfil y Datos Principales --- */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="d-flex flex-column align-items-center p-4">
          {/* Componente Avatar */}
          <Avatar
            src={profilePicUrl}
            firstName={user.first_name || ""}
            lastName={user.last_name || ""}
            size={150}
            className="mb-3"
          />

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
            
            {user.role !== "admin" && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Gimnasio:</Form.Label>
                <div className={`${styles.disabledFormControl} d-flex align-items-center`}>
                  {gymFetchError ? (
                    <span className="text-danger">{gymFetchError}</span>
                  ) : gymName ? (
                    <>
                      <img
                        src={
                          gymLogoUrl
                            ? `${backendBaseUrl}/${gymLogoUrl.replace(/^\/+/, "")}`
                            : "/images/gym-logo/default-gym-logo.png"
                        }
                        alt={`Logo de ${gymName}`}
                        className={styles.gymLogo}
                      />
                      <span>{gymName}</span>
                    </>
                  ) : (
                    <span className="text-dark">
                      <Spinner size="sm" />
                    </span>
                  )}
                </div>
              </Form.Group>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* --- Sección de Información Personal --- */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <h4 className="mb-4 fw-bold text-primary">Información Personal</h4>
          <Form>
             {/* Mostrar solo para no-admins, ya que admin no tiene campos editables aquí por ahora */}
            {user.role !== "admin" && (
                <>
                    <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">
                        Nombre Completo:
                    </Form.Label>
                    <Form.Control
                        type="text"
                        value={`${user.first_name} ${user.last_name}`}
                        disabled
                        readOnly
                        className={styles.disabledFormControl}
                    />
                    </Form.Group>
                    <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">Teléfono:</Form.Label>
                    <Form.Control
                        type="text"
                        value={user.phone || "No especificado"}
                        disabled
                        readOnly
                        className={styles.disabledFormControl}
                    />
                    </Form.Group>
                </>
            )}

            {/* Botones de Acción */}
            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="primary"
                onClick={onEditClick}
                aria-label="Editar perfil"
              >
                <i className="bi bi-pencil-fill me-2 text-dark"></i>
                Editar Perfil
              </Button>
              {user.role !== "admin" && (
                <Button
                  variant="outline-primary"
                  onClick={onChangePasswordClick}
                  aria-label="Cambiar contraseña"
                >
                  <i className="bi bi-key-fill me-2 text-primary"></i>
                  Cambiar Contraseña
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};
