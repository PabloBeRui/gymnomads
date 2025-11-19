/**
 * =============================================================================
 * PÁGINA: ProfilePage
 * PAGE:     ProfilePage
 * =============================================================================
 *
 * Página de perfil del usuario con modo visualización/edición.
 * Permite ver datos, editar información básica, cambiar foto de perfil y contraseña.
 *
 * User profile page with view/edit mode.
 * Allows viewing data, editing basic info, changing profile picture, and password.
 *
 * =============================================================================
 */

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";

// Importar componentes de Bootstrap
// Import Bootstrap components
import { Container, Form, Button, Spinner,Row,Col,Card } from "react-bootstrap";

// Importar contexto / Import context
import { useAuth } from "../context/AuthContext";

// Importar hooks personalizados / Import custom hooks
import { useApiCall } from "../hooks/useApiCall";
import { useImageUpload } from "../hooks/useImageUpload";

// Importar componentes
// Import components
import { Avatar } from "../components/Avatar";
import { ChangePasswordModal } from "../components/modals/ChangePasswordModal";

// Importar servicios / Import services
import { getGymById } from "../services/gym-services";
import {
  updateUserProfile,
  uploadProfilePicture,
} from "../services/user-services";

// Importar interfaces / Import interfaces
import type {
  UpdateUserData,
  User,
  UploadProfilePictureResponse,
  UpdateProfileResponse,
} from "../interfaces/user-interfaces";

// Importar utilidades / Import utilities
import { handleApiError } from "../utils/error-handler";

// Importar estilos
// Import styles
import styles from "./ProfilePage.module.scss";

/* =============================================================================
   COMPONENTE: ProfilePage
   COMPONENT:  ProfilePage
   ============================================================================= */
export const ProfilePage: React.FC = () => {
  // --- Context / Auth ---
  const { user, token, setUser } = useAuth();

  // --- Local state / Estados locales ---
  const [gymName, setGymName] = useState<string | null>(null);
  const [gymLogoUrl, setGymLogoUrl] = useState<string | null>(null);
  const [gymFetchError, setGymFetchError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFirstName, setEditFirstName] = useState<string>("");
  const [editLastName, setEditLastName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");

  // --- Estado para el modal de contraseña / State for the password modal ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  // Hook para acciones de guardado/actualización (gestiona loading y errores)
  // Hook for save/update actions (handles loading + errors)
  const {
    loading: isSaving,
    error: editError,
    execute,
  } = useApiCall("Error al guardar el perfil.");

  // Hook useImageUpload
  const profileImageUpload = useImageUpload({
    maxSizeMB: 5,
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    errorMessages: {
      invalidType: "La foto de perfil debe ser PNG, JPG, JPEG o WEBP",
      maxSize: "La foto de perfil no debe superar los 5MB",
    },
  });

  // Fallback de la URL base del backend
  // Fallback for the backend base URL
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  /* ===========================================================================
     Efectos (Sincronización de datos)
     Effects (Data synchronization)
     =========================================================================== */

  // Sincronizar campos editables cuando cambian los datos del usuario
  // Sync editable fields when user data changes
  useEffect(() => {
    if (user) {
      setEditFirstName(user.first_name || "");
      setEditLastName(user.last_name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  // Obtener el nombre del gimnasio si el usuario tiene home_gym_id
  // Fetch gym name if user has a home_gym_id
  useEffect(() => {
    const fetchGym = async () => {
      if (!user?.home_gym_id) return;
      try {
        setGymFetchError(null);
        const g = await getGymById(user.home_gym_id);
        setGymName(g.name || null);
        setGymLogoUrl(g.logo_url || null);
      } catch (err) {
        const msg = handleApiError(
          err,
          "No se pudo cargar el nombre del gimnasio."
        );
        setGymFetchError(msg);
        setGymName(null);
        setGymLogoUrl(null);
      }
    };
    fetchGym();
  }, [user?.home_gym_id]);

  // Inicializar preview desde user.profile_picture (si está disponible)
  // Initialize preview from user.profile_picture (if available)
  useEffect(() => {
    if (!user?.profile_picture) return;

    const pic = user.profile_picture;
    const normalized =
      typeof pic === "string" && !/^https?:\/\//i.test(pic)
        ? `${backendBaseUrl}/${pic.replace(/^\/+/, "")}`
        : pic;

    profileImageUpload.setPreviewUrl(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.profile_picture]);

  /* ===========================================================================
     Manejadores: editar, cancelar, guardar
     Handlers: edit, cancel, save
     =========================================================================== */
  const handleEditClick = () => {
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
    setIsEditing(true);

    // Limpiar archivo seleccionado anteriormente y asegurar que el preview muestre la imagen actual
    // Clear any previous selected file and ensure preview shows current image
    profileImageUpload.clearImage();
    if (user?.profile_picture) {
      const pic = user.profile_picture;
      const normalized =
        typeof pic === "string" && !/^https?:\/\//i.test(pic)
          ? `${backendBaseUrl}/${pic.replace(/^\/+/, "")}`
          : pic;
      profileImageUpload.setPreviewUrl(normalized);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Restaurar preview y limpiar archivo seleccionado
    // Restore preview and clear selected file
    profileImageUpload.clearImage();
    if (user?.profile_picture) {
      const pic = user.profile_picture;
      const normalized =
        typeof pic === "string" && !/^https?:\/\//i.test(pic)
          ? `${backendBaseUrl}/${pic.replace(/^\/+/, "")}`
          : pic;
      profileImageUpload.setPreviewUrl(normalized);
    }
    // Restaurar campos a los valores actuales del usuario
    // Reset fields to current user values
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
  };

  const handleSaveClick = async () => {
    // Validación básica / Basic validation
    if (!editFirstName || !editLastName) {
      toast.error("El nombre y los apellidos son obligatorios.");
      return;
    }

    if (!token) {
      toast.error("No autenticado.");
      return;
    }

    let newImageUrl: string | null = user?.profile_picture || null;

    try {
      // 1) Subir imagen si se seleccionó
      // 1) Upload image if selected
      if (profileImageUpload.selectedFile) {
        const uploadResp = await execute<UploadProfilePictureResponse>(() =>
          uploadProfilePicture(token, profileImageUpload.selectedFile!)
        );

        const path = (uploadResp.filePath || "")
          .replace(/\\/g, "/")
          .replace(/^\/+/, "");
        newImageUrl = `${backendBaseUrl}/${path}`;

        toast.success(uploadResp.message || "Foto de perfil actualizada.");
      }

      // 2) Actualizar campos de texto
      // 2) Update text fields
      const payload: UpdateUserData = {
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
      };

      const updateResp = await execute<UpdateProfileResponse>(() =>
        updateUserProfile(token, payload)
      );

      // Mostrar success si solo se cambiaron textos
      // Show success when only text changed
      if (!profileImageUpload.selectedFile) {
        toast.success(updateResp.message || "Perfil actualizado con éxito.");
      }

      // 3) Actualizar el usuario en el contexto
      // 3) Update the user in the context
      const updatedUser: User = {
        ...user!,
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
        profile_picture: newImageUrl || null,
      };
      setUser(updatedUser);

      // 4) Limpieza final
      // 4) Cleanup
      setIsEditing(false);
      profileImageUpload.clearImage();

      if (newImageUrl) profileImageUpload.setPreviewUrl(newImageUrl);
    } catch (err) {
      const msg = handleApiError(err, "Error al guardar el perfil.");
      toast.error(msg);
      if (import.meta.env.DEV) console.error("Error saving profile:", err);
    }
  };

  /* ===========================================================================
     Render
     Renderizado
     =========================================================================== */
  if (!user) {
    return (
      <Container className="page-container-narrow">
        <p className={clsx(styles.errorText, "text-danger")}>
          Error: No se pudieron cargar los datos del usuario.
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8} xl={7}>
          <h2 className="text-center mb-5 fw-bold text-primary">Mi Perfil</h2>

          {/* --- Sección de Imagen de Perfil y Datos Principales ---
           * --- Profile Image and Main Data Section ---
           */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body className="d-flex flex-column align-items-center p-4">
              {/* Controles para la subida de imagen de perfil */}
              {/* Controls for profile picture upload */}
              <input
                id="profile-file"
                type="file"
                ref={profileImageUpload.fileInputRef}
                onChange={profileImageUpload.handleFileChange}
                accept="image/png, image/jpeg, image/webp, image/jpg"
                style={{ display: "none" }}
              />

              {/* Componente Avatar */}
              {/* Avatar Component */}
              <Avatar
                src={profileImageUpload.previewUrl}
                firstName={user.first_name || ""}
                lastName={user.last_name || ""}
                size={150} // Tamaño un poco más grande
                onClick={isEditing ? profileImageUpload.handleImageClick : undefined}
                className={clsx("mb-3", { "cursor-pointer shadow-sm": isEditing })}
              />

              {isEditing && (
                <small className="text-center mb-3 text-dark">
                  {profileImageUpload.selectedFile
                    ? `Archivo: ${profileImageUpload.selectedFile.name}`
                    : "Haz clic en el avatar para cambiar la foto."}
                  <br />
                  (PNG/JPG/WEBP, max 5MB. Opcional)
                </small>
              )}

              <Form className="w-100">
                {/* CAMPOS NO EDITABLES / NON-EDITABLE FIELDS */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-dark">Email:</Form.Label>
                  <Form.Control type="text" value={user.email} disabled readOnly className={styles.disabledFormControl} />
                </Form.Group>

                {/* Mostrar Rol solo para Admin y Manager */}
                {/* Show Role only for Admin and Manager */}
                {(user.role === "admin" || user.role === "manager") && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">Rol:</Form.Label>
                    <Form.Control type="text" value={user.role} disabled readOnly className={styles.disabledFormControl} />
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
                                        src={gymLogoUrl ? `${backendBaseUrl}/${gymLogoUrl.replace(/^\/+/, "")}` : "/images/gym-logo/default-gym-logo.png"}
                                        alt={`Logo de ${gymName}`}
                                        className={styles.gymLogo}
                                    />
                                    <span>{gymName}</span>
                                </>
                            ) : (
                                <span className="text-dark">Cargando...</span>
                            )}
                        </div>
                    </Form.Group>
                )}
              </Form>
            </Card.Body>
          </Card>

          {/* --- Sección de Información Personal y Edición ---
           * --- Personal Information and Edit Section ---
           */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body className="p-4">
              <h4 className="mb-4 fw-bold text-primary">Información Personal</h4>
              <Form>
                {user.role !== "admin" ? (
                  !isEditing ? (
                    // --- Modo Visualización / View Mode ---
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-dark">Nombre Completo:</Form.Label>
                        <Form.Control type="text" value={`${user.first_name} ${user.last_name}`} disabled readOnly className={styles.disabledFormControl} />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-dark">Teléfono:</Form.Label>
                        <Form.Control type="text" value={user.phone || "No especificado"} disabled readOnly className={styles.disabledFormControl} />
                      </Form.Group>
                    </>
                  ) : (
                    // --- Modo Edición / Edit Mode ---
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="edit-first-name">
                            <Form.Label className="fw-bold text-dark">Nombre:</Form.Label>
                            <Form.Control
                              type="text"
                              value={editFirstName}
                              onChange={(e) => setEditFirstName(e.target.value)}
                              className={styles.formControl}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="edit-last-name">
                            <Form.Label className="fw-bold text-dark">Apellidos:</Form.Label>
                            <Form.Control
                              type="text"
                              value={editLastName}
                              onChange={(e) => setEditLastName(e.target.value)}
                              className={styles.formControl}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3" controlId="edit-phone">
                        <Form.Label className="fw-bold text-dark">Teléfono:</Form.Label>
                        <Form.Control
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Opcional"
                          className={styles.formControl}
                        />
                      </Form.Group>
                    </>
                  )
                ) : null}

                {/* Botones de Acción */}
                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-3 mt-4">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="primary"
                        onClick={handleEditClick}
                        aria-label="Editar perfil"
                      >
                        <i className="bi bi-pencil-fill me-2 text-dark"></i>Editar Perfil
                      </Button>
                      {user.role !== 'admin' && (
                        <Button
                          variant="outline-primary" // Usar outline para el cambio de contraseña
                          onClick={() => setIsPasswordModalOpen(true)}
                          aria-label="Cambiar contraseña"
                        >
                          <i className="bi bi-key-fill me-2 text-primary"></i>Cambiar Contraseña
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        onClick={handleCancelClick}
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSaveClick}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" variant="light" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar Cambios"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MENSAJES DE ESTADO / STATUS MESSAGES */}
      {isEditing && editError && (
        <div className="alert alert-danger mt-3" role="alert">
          {editError}
        </div>
      )}

      {/* Modal de Contraseña */}
      {/* Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </Container>
  );

};
