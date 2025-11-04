/**
 * =============================================================================
 * PÁGINA: ProfilePage
 * =============================================================================
 *
 * Página de perfil del usuario con modo visualización/edición.
 * User profile page with view/edit mode.
 *
 * Funcionalidades / Features:
 * - Ver datos del perfil (nombre, email, rol, teléfono, gimnasio)
 * - Editar nombre, apellidos y teléfono
 * - Cambiar foto de perfil
 * - Modo edición con validación
 *
 * ✅ Usando / USING:
 * - useImageUpload (para manejo de foto de perfil) / useImageUpload (for profile picture handling)
 * - ImageUploadPreview (componente de preview) / ImageUploadPreview (preview component)
 * - useApiCall (llamadas API) / useApiCall (API calls)
 * - handleApiError (manejo de errores) / handleApiError (error handling)
 * =============================================================================
 */

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// Importar contexto / Import context
import { useAuth } from "../context/AuthContext";

// Importar hooks personalizados / Import custom hooks
import { useApiCall } from "../hooks/useApiCall";
import { useImageUpload } from "../hooks/useImageUpload";

// Importar componente / Import component
import { ImageUploadPreview } from "../components/ImageUploadPreview";

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
  errorText: { color: "red", marginTop: 8 },
  disabledText: {
    color: "grey",
    fontStyle: "italic",
    backgroundColor: "#f8f8f8",
    padding: "2px 4px",
    borderRadius: 3,
    display: "inline-block",
    margin: 0,
  },
  smallHelp: { fontSize: "0.9rem", color: "#666", marginTop: 6 },
};

/* =============================================================================
   COMPONENTE: ProfilePage / COMPONENT: ProfilePage
   ============================================================================= */
export const ProfilePage: React.FC = () => {
  // --- Context / Auth ---
  const { user, token, setUser } = useAuth();

  // --- Local state / Estados locales ---
  const [gymName, setGymName] = useState<string | null>(null);
  const [gymFetchError, setGymFetchError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFirstName, setEditFirstName] = useState<string>("");
  const [editLastName, setEditLastName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");

  // API hook for save/update actions (handles loading + errors)
  // Hook para acciones de guardado/actualización (gestiona loading y errores)
  const {
    loading: isSaving,
    error: editError,
    execute,
  } = useApiCall("Error al guardar el perfil.");

  // useImageUpload hook (no extra typing here; hook API used below)
  // Hook useImageUpload para manejar selección/preview/subida de imagen de perfil
  const profileImageUpload = useImageUpload({
    maxSizeMB: 5,
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    errorMessages: {
      invalidType: "La foto de perfil debe ser PNG, JPG, JPEG o WEBP",
      maxSize: "La foto de perfil no debe superar los 5MB",
    },
  });

  // Backend base URL fallback (para construir URLs si la API devuelve rutas relativas)
  // Fallback de la URL base del backend (to build absolute URLs if API returns relative paths)
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  /* ===========================================================================
     Sync editable fields when user data changes
     Sincronizar campos editables cuando cambian los datos del usuario
     ===========================================================================
  */
  useEffect(() => {
    if (user) {
      setEditFirstName(user.first_name || "");
      setEditLastName(user.last_name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  /* ===========================================================================
     Fetch gym name if user has a home_gym_id
     Obtener el nombre del gimnasio si el usuario tiene home_gym_id
     ===========================================================================
  */
  useEffect(() => {
    const fetchGym = async () => {
      if (!user?.home_gym_id) return;
      try {
        setGymFetchError(null);
        const g = await getGymById(user.home_gym_id);
        setGymName(g.name || null);
      } catch (err) {
        const msg = handleApiError(
          err,
          "No se pudo cargar el nombre del gimnasio."
        );
        setGymFetchError(msg);
        setGymName(null);
      }
    };
    fetchGym();
  }, [user?.home_gym_id]);

  /* ===========================================================================
     Initialize preview from user.profile_picture (if available)
     Inicializar preview desde user.profile_picture si está disponible
     ===========================================================================
  */
  useEffect(() => {
    if (!user?.profile_picture) return;

    // If the stored profile_picture is a relative path, prefix backendBaseUrl
    // Si profile_picture es una ruta relativa, añado backendBaseUrl al principio
    const pic = user.profile_picture;
    const normalized =
      typeof pic === "string" && !/^https?:\/\//i.test(pic)
        ? `${backendBaseUrl}/${pic.replace(/^\/+/, "")}`
        : pic;

    profileImageUpload.setPreviewUrl(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.profile_picture]);

  /* ===========================================================================
     Handlers: edit, cancel, save
     Manejadores: editar, cancelar, guardar
     ===========================================================================
  */
  const handleEditClick = () => {
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
    setIsEditing(true);

    // clear any previous selected file and ensure preview shows current image
    // Limpiar archivo seleccionado anteriormente y asegurar que el preview muestre la imagen actual
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
    // restore preview and clear selected file
    // Restaurar preview y limpiar archivo seleccionado
    profileImageUpload.clearImage();
    if (user?.profile_picture) {
      const pic = user.profile_picture;
      const normalized =
        typeof pic === "string" && !/^https?:\/\//i.test(pic)
          ? `${backendBaseUrl}/${pic.replace(/^\/+/, "")}`
          : pic;
      profileImageUpload.setPreviewUrl(normalized);
    }
    // reset fields to current user values
    // Restaurar campos a los valores actuales del usuario
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
  };

  const handleSaveClick = async () => {
    // basic validation / validación básica
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
      // 1) upload image if selected
      // 1) subir imagen si se seleccionó
      if (profileImageUpload.selectedFile) {
        const uploadResp = await execute<UploadProfilePictureResponse>(() =>
          // uploadProfilePicture expects (token, file)
          // uploadProfilePicture espera (token, file)
          uploadProfilePicture(token, profileImageUpload.selectedFile!)
        );

        // Normalize filePath and build absolute URL
        // Normalizar filePath y construir URL absoluta
        const path = (uploadResp.filePath || "")
          .replace(/\\/g, "/")
          .replace(/^\/+/, "");
        newImageUrl = `${backendBaseUrl}/${path}`;

        toast.success(uploadResp.message || "Foto de perfil actualizada.");
      }

      // 2) update text fields
      // 2) actualizar campos de texto
      const payload: UpdateUserData = {
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
      };

      const updateResp = await execute<UpdateProfileResponse>(() =>
        updateUserProfile(token, payload)
      );

      // show success when only text changed (image upload already showed its toast)
      // mostrar success si solo se cambiaron textos (la subida de imagen ya mostró su toast)
      if (!profileImageUpload.selectedFile) {
        toast.success(updateResp.message || "Perfil actualizado con éxito.");
      }

      // 3) update context user
      // 3) actualizar el usuario en el contexto
      const updatedUser: User = {
        ...user!,
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
        profile_picture: newImageUrl || null,
      };

      setUser(updatedUser);

      // 4) cleanup
      // 4) limpieza final
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
     ===========================================================================
  */
  if (!user) {
    return (
      <div style={styles.container}>
        <p style={styles.errorText}>
          Error: No se pudieron cargar los datos del usuario.
        </p>
      </div>
    );
  }

  // Determine display image URL: prefer hook previewUrl (already normalized), fallback to default
  // Determinar URL de imagen a mostrar: preferir previewUrl del hook, si no fallback al default
  const displayImageUrl =
    profileImageUpload.previewUrl || "/images/profile/default-avatar.png";

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Mi Perfil</h2>

      {/* PROFILE IMAGE / IMAGEN DE PERFIL */}
      <div style={styles.previewWrapper}>
        <input
          id="profile-file"
          type="file"
          ref={profileImageUpload.fileInputRef}
          onChange={profileImageUpload.handleFileChange}
          accept="image/png, image/jpeg, image/webp, image/jpg"
          style={{ display: "none" }}
        />

        <ImageUploadPreview
          previewUrl={displayImageUrl}
          defaultImage="/images/profile/default-avatar.png"
          onClick={isEditing ? profileImageUpload.handleImageClick : undefined}
          altText={`${user.first_name || ""} ${user.last_name || ""}`}
          shape="circle"
          size={100}
          showHelpText={isEditing}
          helpText="Haz clic para cambiar la foto"
          style={{ cursor: isEditing ? "pointer" : "default" }}
        />

        {isEditing && (
          <div style={styles.smallHelp}>
            Selecciona una imagen PNG/JPG/WEBP hasta 5MB. (Opcional)
          </div>
        )}
      </div>

      {/* NON-EDITABLE FIELDS / CAMPOS NO EDITABLES */}
      <div style={styles.infoRow}>
        <span style={styles.label}>Email:</span>
        <span style={isEditing ? styles.disabledText : undefined}>
          {user.email}
        </span>
      </div>

      <div style={styles.infoRow}>
        <span style={styles.label}>Rol:</span>
        <span style={isEditing ? styles.disabledText : undefined}>
          {user.role}
        </span>
      </div>

      {/* EDITABLE FIELDS OR VIEW MODE / CAMPOS EDITABLES O MODO VISUALIZACIÓN */}
      {!isEditing ? (
        <>
          <div style={styles.infoRow}>
            <span style={styles.label}>Nombre:</span>
            <span>{user.first_name}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Apellidos:</span>
            <span>{user.last_name}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Teléfono:</span>
            <span>{user.phone || "No especificado"}</span>
          </div>
        </>
      ) : (
        <>
          <div style={styles.infoRow}>
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

          <div style={styles.infoRow}>
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

          <div style={styles.infoRow}>
            <label htmlFor="edit-phone" style={styles.label}>
              Teléfono:
            </label>
            <input
              id="edit-phone"
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              style={styles.input}
            />
          </div>
        </>
      )}

      {/* ASSOCIATED GYM / GIMNASIO ASOCIADO */}
      <div style={styles.infoRow}>
        <span style={styles.label}>Gimnasio:</span>
        <span style={isEditing ? styles.disabledText : undefined}>
          {gymFetchError ? (
            <span style={{ color: "red" }}>{gymFetchError}</span>
          ) : (
            gymName || "Cargando..."
          )}
        </span>
      </div>

      {/* ACTION BUTTONS / BOTONES DE ACCION */}
      <div style={styles.buttonRow}>
        {!isEditing ? (
          <button
            style={styles.button}
            onClick={handleEditClick}
            aria-label="Editar perfil">
            Editar Perfil
          </button>
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
              disabled={isSaving}>
              Cancelar
            </button>
          </>
        )}
      </div>

      {/* ERRORS / STATUS */}
      {isEditing && editError && <p style={styles.errorText}>{editError}</p>}
      {isSaving && <p style={{ marginTop: 8 }}>Guardando cambios...</p>}
    </div>
  );
};
