/**
 * =============================================================================
 * PÁGINA: ProfilePage
 * =============================================================================
 *
 * Página de perfil del usuario con modo visualización/edición.
 * User profile page with view/edit mode.
 *
 * Funcionalidades / Features:
 * - Ver datos del perfil (nombre, email, rol, teléfono, gimnasio) / View profile data (name, email, role, phone, gym)
 * - Editar nombre, apellidos y teléfono / Edit first name, last name, and phone
 * - Cambiar foto de perfil / Change profile picture
 * - Modo edición con validación / Edit mode with validation
 * - Permite cambiar la contraseña (excepto para 'admin') / Allows password change (except for 'admin')
 *
 *  Usando / USING:
 * - useImageUpload (para manejo de foto de perfil / for profile picture handling)
 * - Avatar (componente de visualización de imagen / image display component)
 * - useApiCall (llamadas API / API calls)
 * - handleApiError (manejador de errores de API / API error handler)
 * - useAuth (para obtener datos y rol del usuario / to get user data and role)
 * =============================================================================
 */

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// Importar contexto / Import context
import { useAuth } from "../context/AuthContext";

// Importar hooks personalizados / Import custom hooks
import { useApiCall } from "../hooks/useApiCall";
import { useImageUpload } from "../hooks/useImageUpload";

import { Avatar } from "../components/Avatar";
import { ChangePasswordModal } from "../components/ChangePasswordModal";

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

/* =============================================================================
    ESTILOS (inline) / STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: 20, maxWidth: 720, margin: "20px auto" },
  header: { marginBottom: 16 },
  previewWrapper: { marginBottom: 16 },
  infoRow: { marginBottom: 8 },
  label: { fontWeight: 600, marginRight: 8 },
  input: {
    padding: "6px 8px",
    borderRadius: 4,
    border: "1px solid #ccc",
    boxSizing: "border-box",
    width: "100%", // Asegurar ancho completo // Ensure full width
  },
  buttonRow: { marginTop: 12, display: "flex", gap: 8 },
  button: {
    padding: "8px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  cancelButton: {
    padding: "8px 12px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  passwordButton: {
    padding: "8px 12px",
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  errorText: { color: "red", marginTop: 8, fontSize: "0.9em" },
  successText: { color: "green", marginTop: 8, fontSize: "0.9em" }, // Estilo para éxito // Success style
  disabledText: {
    color: "grey",
    fontStyle: "italic",
    backgroundColor: "#f8f8f8",
    padding: "6px 8px", // Coincidir con input // Match input
    borderRadius: 4,
    display: "block", // 'block' para que 'width' 100% funcione // 'block' for 100% width to work
    margin: 0,
    width: "100%",
    boxSizing: "border-box",
  },
  smallHelp: { fontSize: "0.9rem", color: "#666", marginTop: 6 },
  adminNotice: {
    padding: "12px 16px",
    borderRadius: 4,
    backgroundColor: "#e6f7ff", // Un 'info' azul claro // A light 'info' blue
    border: "1px solid #b3e0ff",
    color: "#0056b3", // Texto azul oscuro // Dark blue text
  },
  adminNoticeLink: {
    color: "#004085", // Más oscuro para el link // Darker for the link
    fontWeight: "bold",
    textDecoration: "underline",
    marginLeft: "4px",
  },
  passwordSection: {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
  },
  passwordTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  formGroup: {
    marginBottom: "15px",
  },
};

/* =============================================================================
    COMPONENTE: ProfilePage / COMPONENT: ProfilePage
    ============================================================================= */
export const ProfilePage: React.FC = () => {
  // --- Context / Auth ---
  const { user, token, setUser } = useAuth(); // Mantenemos tu 'setUser' original // Keep original 'setUser'

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

  // Hook useImageUpload (versión Objeto, como en tu original)
  // useImageUpload hook (Object version, as in your original)
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
      Sincronizar campos editables cuando cambian los datos del usuario
      Sync editable fields when user data changes
      =========================================================================== */
  useEffect(() => {
    if (user) {
      setEditFirstName(user.first_name || "");
      setEditLastName(user.last_name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  /* ===========================================================================
      Obtener el nombre del gimnasio si el usuario tiene home_gym_id
      Fetch gym name if user has a home_gym_id
      =========================================================================== */
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

  /* ===========================================================================
      Inicializar preview desde user.profile_picture (si está disponible)
      Initialize preview from user.profile_picture (if available)
      =========================================================================== */
  useEffect(() => {
    if (!user?.profile_picture) return;

    // Si profile_picture es una ruta relativa, añado backendBaseUrl al principio
    // If profile_picture is a relative path, prefix backendBaseUrl
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
    // clear any previous selected file and ensure preview shows current image
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
    // validación básica / basic validation
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
      // 1) subir imagen si se seleccionó
      // 1) upload image if selected
      if (profileImageUpload.selectedFile) {
        const uploadResp = await execute<UploadProfilePictureResponse>(() =>
          // uploadProfilePicture espera (token, file)
          // uploadProfilePicture expects (token, file)
          uploadProfilePicture(token, profileImageUpload.selectedFile!)
        );

        // Normalizar filePath y construir URL absoluta
        // Normalize filePath and build absolute URL
        const path = (uploadResp.filePath || "")
          .replace(/\\/g, "/")
          .replace(/^\/+/, "");
        newImageUrl = `${backendBaseUrl}/${path}`;

        toast.success(uploadResp.message || "Foto de perfil actualizada.");
      }

      // 2) actualizar campos de texto
      // 2) update text fields
      const payload: UpdateUserData = {
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
      };

      // 'updateUserProfile' original / original 'updateUserProfile'
      const updateResp = await execute<UpdateProfileResponse>(() =>
        updateUserProfile(token, payload)
      );

      // mostrar success si solo se cambiaron textos (la subida de imagen ya mostró su toast)
      // show success when only text changed (image upload already showed its toast)
      if (!profileImageUpload.selectedFile) {
        toast.success(updateResp.message || "Perfil actualizado con éxito.");
      }

      // 3) actualizar el usuario en el contexto
      // 3) update the user in the context
      const updatedUser: User = {
        ...user!,
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
        profile_picture: newImageUrl || null,
      };
      setUser(updatedUser); // Mantenemos tu 'setUser' original // Keep original 'setUser'

      // 4) limpieza final
      // 4) cleanup
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
      <div style={styles.container}>
        <p style={styles.errorText}>
          Error: No se pudieron cargar los datos del usuario.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Mi Perfil</h2>

      {/* --- MODIFICACIÓN: Implementación de 'Avatar' ---
          --- MODIFICATION: 'Avatar' Implementation --- */}
      <div style={styles.previewWrapper}>
        <input
          id="profile-file"
          type="file"
          ref={profileImageUpload.fileInputRef}
          onChange={profileImageUpload.handleFileChange}
          accept="image/png, image/jpeg, image/webp, image/jpg"
          style={{ display: "none" }}
        />

        {/* 
          Usamos el componente Avatar.
          - 'src' es la URL del preview (si existe) o la URL del usuario.
            Si es null, 'Avatar' mostrará las iniciales.
          - 'firstName' y 'lastName' se usan para las iniciales y el 'title'.
          - 'onClick' solo se activa en modo edición.

          We use the Avatar component.
          - 'src' is the preview URL (if it exists) or the user's URL.
            If null, 'Avatar' will show initials.
          - 'firstName' and 'lastName' are used for initials and 'title'.
          - 'onClick' is only active in edit mode.
        */}
        <Avatar
          src={profileImageUpload.previewUrl}
          firstName={user.first_name || ""}
          lastName={user.last_name || ""}
          size={100}
          onClick={isEditing ? profileImageUpload.handleImageClick : undefined}
        />

        {isEditing && (
          <div style={styles.smallHelp}>
            {profileImageUpload.selectedFile
              ? `Archivo: ${profileImageUpload.selectedFile.name}`
              : "Haz clic en el avatar para cambiar la foto."}
            <br />
            (PNG/JPG/WEBP, max 5MB. Opcional)
          </div>
        )}
      </div>
      {/* --- FIN MODIFICACIÓN --- */}

      {/* CAMPOS NO EDITABLES / NON-EDITABLE FIELDS */}
      <div style={styles.formGroup}>
        <span style={styles.label}>Email:</span>
        <div style={isEditing ? styles.disabledText : styles.input}>
          {user.email}
        </div>
      </div>
      {/* Mostrar Rol solo para Admin y Manager / Show Role only for Admin and Manager */}
      {(user.role === "admin" || user.role === "manager") && (
        <div style={styles.formGroup}>
          <span style={styles.label}>Rol:</span>
          <div style={isEditing ? styles.disabledText : styles.input}>
            {user.role}
          </div>
        </div>
      )}

      {/* CAMPOS EDITABLES O MODO VISUALIZACIÓN / EDITABLE FIELDS OR VIEW MODE */}
      {user.role !== "admin" ? (
        !isEditing ? (
          <>
            <div style={styles.formGroup}>
              <span style={styles.label}>Nombre Completo:</span>
              <div style={styles.input}>
                {`${user.first_name} ${user.last_name}`}
              </div>
            </div>
            <div style={styles.formGroup}>
              <span style={styles.label}>Teléfono:</span>
              <div style={styles.input}>{user.phone || "No especificado"}</div>
            </div>
          </>
        ) : (
          <>
            <div style={styles.formGroup}>
              <label htmlFor="edit-first-name" style={styles.label}>
                Nombre:
              </label>
              <input
                id="edit-first-name"
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="edit-last-name" style={styles.label}>
                Apellidos:
              </label>
              <input
                id="edit-last-name"
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="edit-phone" style={styles.label}>
                Teléfono:
              </label>
              <input
                id="edit-phone"
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                style={styles.input}
                placeholder="Opcional"
              />
            </div>
          </>
        )
      ) : null}

      {/* GIMNASIO ASOCIADO / ASSOCIATED GYM */}
      {user.role !== "admin" && (
        <div style={styles.formGroup}>
          <span style={styles.label}>Gimnasio:</span>
          <div style={isEditing ? styles.disabledText : styles.input}>
            {gymFetchError ? (
              <span style={{ color: "red" }}>{gymFetchError}</span>
            ) : gymName ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={
                    gymLogoUrl
                      ? `${backendBaseUrl}/${gymLogoUrl.replace(/^\/+/, "")}`
                      : "/images/gym-logo/default-gym-logo.png"
                  }
                  alt={`Logo de ${gymName}`}
                  style={{
                    height: 24,
                    width: 24,
                    marginRight: 8,
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/gym-logo/default-gym-logo.png";
                  }}
                />
                {gymName}
              </div>
            ) : (
              "Cargando..."
            )}
          </div>
        </div>
      )}

      {/* Botones de Acción (Guardar / Editar) / Action Buttons (Save / Edit) */}
      <div style={styles.buttonRow}>
        {!isEditing ? (
          <>
            <button
              style={styles.button}
              onClick={handleEditClick}
              aria-label="Editar perfil">
              Editar Perfil
            </button>
            {user.role !== 'admin' && (
              <button
                style={styles.passwordButton}
                onClick={() => setIsPasswordModalOpen(true)}
                aria-label="Cambiar contraseña"
              >
                Cambiar Contraseña
              </button>
            )}
          </>
        ) : (
          <>
            <button
              style={styles.button}
              onClick={handleSaveClick}
              disabled={isSaving}
              aria-busy={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              style={styles.cancelButton}
              onClick={handleCancelClick}
              disabled={isSaving}
            >
              Cancelar
            </button>
          </>
        )}
      </div>

      {/* ERRORS / STATUS */}
      {isEditing && editError && <p style={styles.errorText}>{editError}</p>}
      {isSaving && <p style={{ marginTop: 8 }}>Guardando cambios...</p>}

      {/* Renderizar el modal / Render the modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
