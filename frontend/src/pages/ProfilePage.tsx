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
 * -  Permite cambiar la contraseña
 *
 * ✅ Usando / USING:
 * - useImageUpload (para manejo de foto de perfil)
 * - ImageUploadPreview (componente de preview)
 * - useApiCall (llamadas API)
 *-handleAPiError
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
// --- MODIFICADO: Añadir 'changePassword' / MODIFIED: Add 'changePassword' ---
import { getGymById } from "../services/gym-services";
import {
  updateUserProfile, // <--- Mantenemos tu nombre original
  uploadProfilePicture,
  changePassword, // <-- AÑADIDO
} from "../services/user-services";
// --- FIN MODIFICACIÓN ---

// Importar interfaces / Import interfaces
import type {
  UpdateUserData,
  User,
  UploadProfilePictureResponse,
  UpdateProfileResponse,
  ChangePasswordData, // <-- AÑADIDO
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
    width: "100%", // Asegurar ancho completo
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
  errorText: { color: "red", marginTop: 8, fontSize: "0.9em" },
  successText: { color: "green", marginTop: 8, fontSize: "0.9em" }, // Estilo para éxito
  disabledText: {
    color: "grey",
    fontStyle: "italic",
    backgroundColor: "#f8f8f8",
    padding: "6px 8px", // Coincidir con input
    borderRadius: 4,
    display: "block", // 'block' para que 'width' 100% funcione
    margin: 0,
    width: "100%",
    boxSizing: "border-box",
  },
  smallHelp: { fontSize: "0.9rem", color: "#666", marginTop: 6 },
  // --- NUEVO: Estilos para sección de contraseña ---
  // --- NEW: Styles for password section ---
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
  const { user, token, setUser } = useAuth(); // Mantenemos tu 'setUser' original

  // --- Local state / Estados locales ---
  const [gymName, setGymName] = useState<string | null>(null);
  const [gymFetchError, setGymFetchError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFirstName, setEditFirstName] = useState<string>("");
  const [editLastName, setEditLastName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");

  // --- NUEVO: Estados de Contraseña / NEW: Password States ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Hook para acciones de guardado/actualización (gestiona loading y errores)
  // Hook for save/update actions (handles loading + errors)
  const {
    loading: isSaving,
    error: editError,
    execute,
  } = useApiCall("Error al guardar el perfil.");

  // --- NUEVO: Hook de API para contraseña / NEW: API Hook for password ---
  const { loading: isChangingPassword, execute: executePasswordChange } =
    useApiCall<{ message: string }>();

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

    // --- NUEVO: Limpiar campos de contraseña / NEW: Clear password fields ---
    setPasswordError(null);
    setPasswordSuccess(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
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

      // --- Mantenemos tu 'updateUserProfile' original / --- Keep your original 'updateUserProfile'
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
      setUser(updatedUser); // <-- Mantenemos tu 'setUser' original

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

  // --- NUEVO: Manejar cambio de contraseña / NEW: Handle password change ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // 1. Validar token / 1. Validate token
    if (!token) {
      setPasswordError("No estás autenticado.");
      return;
    }
    // 2. Validar que no falten campos / 2. Validate fields are not empty
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Todos los campos de contraseña son obligatorios.");
      return;
    }
    // 3. Validar que las contraseñas coincidan / 3. Validate passwords match
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      return;
    }
    // 4. Validar longitud de contraseña / 4. Validate password length
    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    // 5. Preparar datos y llamar a la API / 5. Prepare data and call API
    const passwordData: ChangePasswordData = {
      currentPassword,
      newPassword,
    };
    try {
      const response = await executePasswordChange(() =>
        changePassword(token, passwordData)
      );
      setPasswordSuccess(response.message || "Contraseña cambiada con éxito.");
      toast.success("Contraseña cambiada con éxito.");
      // Limpiar campos / Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setPasswordError(
        (error as Error).message || "Error al cambiar la contraseña."
      );
    }
  };

  /* ===========================================================================
     Render
     Renderizado
     =========================================================================== */
  if (!user) {
    // Tu lógica original no usa 'authLoading' aquí
    return (
      <div style={styles.container}>
        <p style={styles.errorText}>
          Error: No se pudieron cargar los datos del usuario.
        </p>
      </div>
    );
  }

  // Determinar URL de imagen a mostrar
  // Determine display image URL
  const displayImageUrl =
    profileImageUpload.previewUrl || "/images/profile/default-avatar.png";

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Mi Perfil</h2>

      {/* IMAGEN DE PERFIL / PROFILE IMAGE */}
      <div style={styles.previewWrapper}>
        <input
          id="profile-file"
          type="file"
          ref={profileImageUpload.fileInputRef}
          onChange={profileImageUpload.handleFileChange}
          accept="image/png, image/jpeg, image/webp, image/jpg"
          style={{ display: "none" }}
        />

        {/* Lógica de 'ImageUploadPreview' original (usando onClick) */}
        {/* Original 'ImageUploadPreview' logic (using onClick) */}
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

      {/* CAMPOS NO EDITABLES / NON-EDITABLE FIELDS */}
      <div style={styles.formGroup}>
        <span style={styles.label}>Email:</span>
        <div style={isEditing ? styles.disabledText : styles.input}>
          {user.email}
        </div>
      </div>

      <div style={styles.formGroup}>
        <span style={styles.label}>Rol:</span>
        <div style={isEditing ? styles.disabledText : styles.input}>
          {user.role}
        </div>
      </div>

      {/* CAMPOS EDITABLES O MODO VISUALIZACIÓN / EDITABLE FIELDS OR VIEW MODE */}
      {!isEditing ? (
        <>
          <div style={styles.formGroup}>
            <span style={styles.label}>Nombre:</span>
            <div style={styles.input}>{user.first_name}</div>
          </div>
          <div style={styles.formGroup}>
            <span style={styles.label}>Apellidos:</span>
            <div style={styles.input}>{user.last_name}</div>
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
      )}

      {/* GIMNASIO ASOCIADO / ASSOCIATED GYM */}
      <div style={styles.formGroup}>
        <span style={styles.label}>Gimnasio:</span>
        <div style={isEditing ? styles.disabledText : styles.input}>
          {gymFetchError ? (
            <span style={{ color: "red" }}>{gymFetchError}</span>
          ) : (
            gymName || "Cargando..."
          )}
        </div>
      </div>

      {/* --- NUEVO: Sección de Contraseña (Solo en modo edición) --- */}
      {/* --- NEW: Password Section (Edit mode only) --- */}
      {isEditing && (
        <div style={styles.passwordSection}>
          <h4 style={styles.passwordTitle}>Cambiar Contraseña</h4>

          {/* Formulario de Contraseña / Password Form */}
          <form onSubmit={handlePasswordChange}>
            {/* Campo: Contraseña Actual / Field: Current Password */}
            <div style={styles.formGroup}>
              <label htmlFor="currentPassword" style={styles.label}>
                Contraseña Actual: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={styles.input}
                disabled={isChangingPassword}
                required
              />
            </div>

            {/* Campo: Nueva Contraseña / Field: New Password */}
            <div style={styles.formGroup}>
              <label htmlFor="newPassword" style={styles.label}>
                Nueva Contraseña: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                disabled={isChangingPassword}
                minLength={6}
                required
              />
            </div>

            {/* Campo: Confirmar Nueva Contraseña / Field: Confirm New Password */}
            <div style={styles.formGroup}>
              <label htmlFor="confirmNewPassword" style={styles.label}>
                Confirmar Nueva Contraseña:{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={styles.input}
                disabled={isChangingPassword}
                minLength={6}
                required
              />
              {/* Indicador de coincidencia / Match indicator */}
              {newPassword &&
                confirmNewPassword &&
                (newPassword === confirmNewPassword ? (
                  <small style={styles.successText}>
                    ✓ Las contraseñas coinciden
                  </small>
                ) : (
                  <small style={styles.errorText}>
                    ✗ Las contraseñas no coinciden
                  </small>
                ))}
            </div>

            {/* Botón para cambiar contraseña / Button to change password */}
            <button
              type="submit" // 'submit' para este formulario anidado
              style={{ ...styles.button, ...styles.editButton }} // Azul
              disabled={isChangingPassword}>
              {isChangingPassword
                ? "Cambiando..."
                : "Establecer Nueva Contraseña"}
            </button>

            {/* Mensajes de feedback de contraseña / Password feedback messages */}
            {passwordError && <p style={styles.errorText}>{passwordError}</p>}
            {passwordSuccess && (
              <p style={styles.successText}>{passwordSuccess}</p>
            )}
          </form>
        </div>
      )}

      {/* Botones de Acción (Guardar / Editar) / Action Buttons (Save / Edit) */}
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
              style={{ ...styles.button, ...styles.saveButton }} // Verde
              onClick={handleSaveClick}
              disabled={isSaving || isChangingPassword} // Deshabilitar si CUALQUIERA está guardando
              aria-busy={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              style={styles.cancelButton} // Gris
              onClick={handleCancelClick}
              disabled={isSaving || isChangingPassword} // Deshabilitar si CUALQUIERA está guardando
            >
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
