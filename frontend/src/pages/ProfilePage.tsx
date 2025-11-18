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
import { Container, Form, Button, Spinner } from "react-bootstrap";

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
        <p className={styles.errorText}>
          Error: No se pudieron cargar los datos del usuario.
        </p>
      </Container>
    );
  }

  return (
    <Container className="page-container-narrow">
      <h2 className="page-title text-center">Mi Perfil</h2>

      {/* --- Avatar e Imagen de Perfil --- */}
      {/* --- Avatar and Profile Image --- */}
      <div className={styles.previewWrapper}>
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
          size={120} // Aumentado ligeramente el tamaño
          onClick={isEditing ? profileImageUpload.handleImageClick : undefined}
          // Añadir puntero si es editable
          // Add pointer if editable
          className={isEditing ? "cursor-pointer" : ""} 
        />

        {isEditing && (
          <div className={styles.smallHelp}>
            {profileImageUpload.selectedFile
              ? `Archivo: ${profileImageUpload.selectedFile.name}`
              : "Haz clic en el avatar para cambiar la foto."}
            <br />
            (PNG/JPG/WEBP, max 5MB. Opcional)
          </div>
        )}
      </div>

      <Form>
        {/* CAMPOS NO EDITABLES / NON-EDITABLE FIELDS */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Email:</Form.Label>
          <div className={styles.disabledText}>
            {user.email}
          </div>
        </Form.Group>

        {/* Mostrar Rol solo para Admin y Manager */}
        {/* Show Role only for Admin and Manager */}
        {(user.role === "admin" || user.role === "manager") && (
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Rol:</Form.Label>
            <div className={styles.disabledText}>
              {user.role}
            </div>
          </Form.Group>
        )}

        {/* CAMPOS EDITABLES O MODO VISUALIZACIÓN */}
        {/* EDITABLE FIELDS OR VIEW MODE */}
        {user.role !== "admin" ? (
          !isEditing ? (
            // --- Modo Visualización / View Mode ---
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Nombre Completo:</Form.Label>
                <div className={styles.disabledText} style={{ backgroundColor: '#fff' }}>
                  {`${user.first_name} ${user.last_name}`}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Teléfono:</Form.Label>
                <div className={styles.disabledText} style={{ backgroundColor: '#fff' }}>
                  {user.phone || "No especificado"}
                </div>
              </Form.Group>
            </>
          ) : (
            // --- Modo Edición / Edit Mode ---
            <>
              <Form.Group className="mb-3" controlId="edit-first-name">
                <Form.Label className="fw-bold">Nombre:</Form.Label>
                <Form.Control
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="edit-last-name">
                <Form.Label className="fw-bold">Apellidos:</Form.Label>
                <Form.Control
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="edit-phone">
                <Form.Label className="fw-bold">Teléfono:</Form.Label>
                <Form.Control
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Opcional"
                />
              </Form.Group>
            </>
          )
        ) : null}

        {/* GIMNASIO ASOCIADO / ASSOCIATED GYM */}
        {user.role !== "admin" && (
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Gimnasio:</Form.Label>
            <div className={clsx(styles.disabledText, styles.withImage)}>
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
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/images/gym-logo/default-gym-logo.png";
                    }}
                  />
                  {gymName}
                </>
              ) : (
                "Cargando..."
              )}
            </div>
          </Form.Group>
        )}

        {/* Botones de Acción */}
        {/* Action Buttons */}
        <div className={styles.buttonRow}>
          {!isEditing ? (
            <>
              <Button
                variant="primary"
                onClick={handleEditClick}
                aria-label="Editar perfil"
              >
                Editar Perfil
              </Button>
              {user.role !== 'admin' && (
                <Button
                  variant="info"
                  className="text-white" // Asegurar texto blanco en botón info
                  onClick={() => setIsPasswordModalOpen(true)}
                  aria-label="Cambiar contraseña"
                >
                  Cambiar Contraseña
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={handleSaveClick}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelClick}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      </Form>

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