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
 * ✅ REFACTORIZADO usando:
 * - useImageUpload (para manejo de foto de perfil)
 * - ImageUploadPreview (componente de preview)
 * - useApiCall (llamadas API)
 * - handleApiError (manejo de errores)
 * =============================================================================
 */

import { useEffect, useState } from "react";
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

/**
 * =============================================================================
 * ESTILOS
 * =============================================================================
 */

/**
 * Estilos para campos "deshabilitados" visualmente durante la edición
 * Styles for visually "disabled" fields during editing
 */
const disabledStyle: React.CSSProperties = {
  color: "grey",
  fontStyle: "italic",
  backgroundColor: "#f8f8f8",
  padding: "2px 4px",
  borderRadius: "3px",
  display: "inline-block",
  margin: "0",
};

/**
 * =============================================================================
 * COMPONENTE: ProfilePage
 * =============================================================================
 */
export const ProfilePage = () => {
  // --- Hooks de Contexto / Context Hooks ---
  const { user, token, setUser } = useAuth();

  // --- Estados de Datos / Data States ---
  const [gymName, setGymName] = useState<string | null>(null);
  const [gymFetchError, setGymFetchError] = useState<string | null>(null);

  // --- Estados de Modo Edición / Edit Mode States ---
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // --- Hook de API / API Hook ---
  const {
    loading: isSaving,
    error: editError,
    execute,
  } = useApiCall("Error al guardar el perfil.");

  // --- ✅ REFACTORIZADO: Hook de Imagen / Image Hook ---
  const profileImageUpload = useImageUpload({
    maxSizeMB: 5,
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    errorMessages: {
      invalidType: "La foto de perfil debe ser PNG, JPG, JPEG o WEBP",
      maxSize: "La foto de perfil no debe superar los 5MB",
    },
  });

  // --- Efectos / Effects ---

  /**
   * =============================================================================
   * EFECTO: Sincronizar campos editables cuando el usuario se carga
   * EFFECT: Synchronize editable fields when user loads
   * =============================================================================
   */
  useEffect(() => {
    if (user) {
      setEditFirstName(user.first_name || "");
      setEditLastName(user.last_name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  /**
   * =============================================================================
   * EFECTO: Obtener el nombre del gimnasio cuando 'user' esté disponible
   * EFFECT: Fetch the gym name when 'user' is available
   * =============================================================================
   */
  useEffect(() => {
    const fetchGymName = async () => {
      if (user?.home_gym_id) {
        try {
          setGymFetchError(null);
          const gymData = await getGymById(user.home_gym_id);
          setGymName(gymData.name);
        } catch (err) {
          const errorMessage = handleApiError(
            err,
            "No se pudo cargar el nombre del gimnasio."
          );
          setGymFetchError(errorMessage);
          setGymName(null);
        }
      }
    };

    fetchGymName();
  }, [user?.home_gym_id]);

  /**
   * =============================================================================
   * EFECTO: Establecer preview de la imagen actual del usuario
   * EFFECT: Set preview of user's current image
   * =============================================================================
   */
  useEffect(() => {
    if (user?.profile_picture) {
      profileImageUpload.setPreviewUrl(user.profile_picture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.profile_picture]);

  // --- Manejadores / Handlers ---

  /**
   * =============================================================================
   * FUNCIÓN: handleEditClick
   * =============================================================================
   * 
   * Entrar en modo edición.
   * Enter edit mode.
   * =============================================================================
   */
  const handleEditClick = () => {
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
    setIsEditing(true);
    
    // ✅ REFACTORIZADO: Limpiar imagen usando el hook
    profileImageUpload.clearImage();
    
    // Restaurar preview de la imagen actual
    if (user?.profile_picture) {
      profileImageUpload.setPreviewUrl(user.profile_picture);
    }
  };

  /**
   * =============================================================================
   * FUNCIÓN: handleCancelClick
   * =============================================================================
   * 
   * Cancelar la edición.
   * Cancel editing.
   * =============================================================================
   */
  const handleCancelClick = () => {
    setIsEditing(false);
    
    // ✅ REFACTORIZADO: Limpiar imagen usando el hook
    profileImageUpload.clearImage();
    
    // Restaurar preview de la imagen actual
    if (user?.profile_picture) {
      profileImageUpload.setPreviewUrl(user.profile_picture);
    }
  };

  /**
   * =============================================================================
   * FUNCIÓN: handleSaveClick
   * =============================================================================
   * 
   * Guardar los cambios del perfil.
   * Save profile changes.
   * =============================================================================
   */
  const handleSaveClick = async () => {
    // Validar campos de texto obligatorios / Validate required text fields
    if (!editFirstName || !editLastName) {
      toast.error("El nombre y los apellidos son obligatorios.");
      return;
    }

    // Inicializar variable para nueva URL de imagen / Initialize variable for new image URL
    let newImageUrl = user?.profile_picture || null;

    try {
      // Verificar que el token existe / Verify that token exists
      if (!token) throw new Error("No autenticado.");

      // --- 1. Subir Nueva Imagen (si hay una seleccionada) / Upload New Image (if one is selected) ---
      // ✅ REFACTORIZADO: Usar selectedFile del hook
      if (profileImageUpload.selectedFile) {
        console.log("Guardando nueva foto de perfil...");

        // Ejecutar llamada API para subir imagen / Execute API call to upload image
        const uploadResponse = await execute<UploadProfilePictureResponse>(
          () => uploadProfilePicture(token, profileImageUpload.selectedFile!),
          "Error al subir la imagen"
        );

        // Construir la URL completa desde el filePath devuelto por el backend
        // Build the full URL from the filePath returned by the backend
        const imagePath = uploadResponse.filePath.replace(/\\/g, "/");
        newImageUrl = `${import.meta.env.VITE_BACKEND_BASE_URL}/${imagePath}`;

        // Mostrar notificación de éxito / Show success notification
        toast.success(uploadResponse.message || "Foto actualizada.");
        console.log("Nueva URL de imagen:", newImageUrl);
      }

      // --- 2. Actualizar Datos de Texto / Update Text Data ---
      const updatedData: UpdateUserData = {
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
      };

      // Ejecutar llamada API para actualizar perfil / Execute API call to update profile
      const updateResponse = await execute<UpdateProfileResponse>(
        () => updateUserProfile(token, updatedData),
        "Error al actualizar el perfil"
      );

      // Mostrar notificación solo si no se cambió la imagen
      // Show notification only if image wasn't changed
      if (!profileImageUpload.selectedFile) {
        toast.success(updateResponse.message || "Perfil actualizado con éxito.");
      }

      // --- 3. Actualizar el Contexto / Update the Context ---
      const updatedUser: User = {
        ...user!,
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
        profile_picture: newImageUrl,
      };

      setUser(updatedUser);

      // --- 4. Limpiar / Clean up ---
      setIsEditing(false);
      
      // ✅ REFACTORIZADO: Limpiar imagen usando el hook
      profileImageUpload.clearImage();
      
      // Establecer el nuevo preview
      if (newImageUrl) {
        profileImageUpload.setPreviewUrl(newImageUrl);
      }
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar el perfil.");
      toast.error(errorMessage);
    }
  };

  // --- Renderizado / Rendering ---

  /**
   * Verificar que el usuario existe
   * Verify that user exists
   */
  if (!user) {
    return <div>Error: No se pudieron cargar los datos del usuario.</div>;
  }

  /**
   * Determinar qué URL de imagen mostrar
   * Determine which image URL to show
   */
  const displayImageUrl =
    profileImageUpload.previewUrl || "/images/profile/default_avatar.png";

  return (
    <div>
      {/* Título / Title */}
      <h2>Mi Perfil</h2>

      {/* ====================================================================
       * SECCIÓN: IMAGEN DE PERFIL
       * SECTION: PROFILE IMAGE
       * ==================================================================== */}
      <div>
        {/* ✅ REFACTORIZADO: Usar componente ImageUploadPreview */}
        {/* ✅ REFACTORED: Use ImageUploadPreview component */}
        
        {/* Input de archivo oculto / Hidden file input */}
        <input
          type="file"
          ref={profileImageUpload.fileInputRef}
          onChange={profileImageUpload.handleFileChange}
          style={{ display: "none" }}
          accept="image/png, image/jpeg, image/webp, image/jpg"
        />

        <ImageUploadPreview
          previewUrl={displayImageUrl}
          defaultImage="/images/profile/default_avatar.png"
          onClick={isEditing ? profileImageUpload.handleImageClick : undefined}
          altText={`${user.first_name} ${user.last_name}`}
          shape="circle"
          size={100}
          showHelpText={isEditing}
          helpText="Haz clic para cambiar la foto"
          style={{
            cursor: isEditing ? "pointer" : "default",
            marginBottom: "1rem",
          }}
        />
      </div>

      {/* ====================================================================
       * SECCIÓN: CAMPOS NO EDITABLES
       * SECTION: NON-EDITABLE FIELDS
       * ==================================================================== */}
      <p>
        <strong>Email:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>{user.email}</span>
      </p>
      <p>
        <strong>Rol:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>{user.role}</span>
      </p>

      {/* ====================================================================
       * SECCIÓN: CAMPOS EDITABLES
       * SECTION: EDITABLE FIELDS
       * ==================================================================== */}
      {!isEditing ? (
        // --- Modo Visualización / View Mode ---
        <>
          <p>
            <strong>Nombre:</strong> {user.first_name}
          </p>
          <p>
            <strong>Apellidos:</strong> {user.last_name}
          </p>
          <p>
            <strong>Teléfono:</strong> {user.phone || "No especificado"}
          </p>
        </>
      ) : (
        // --- Modo Edición / Edit Mode ---
        <>
          <p>
            <label htmlFor="edit-first-name">
              <strong>Nombre:</strong>
            </label>
            <input
              id="edit-first-name"
              type="text"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            />
          </p>
          <p>
            <label htmlFor="edit-last-name">
              <strong>Apellidos:</strong>
            </label>
            <input
              id="edit-last-name"
              type="text"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            />
          </p>
          <p>
            <label htmlFor="edit-phone">
              <strong>Teléfono:</strong>
            </label>
            <input
              id="edit-phone"
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            />
          </p>
        </>
      )}

      {/* ====================================================================
       * SECCIÓN: GIMNASIO ASOCIADO
       * SECTION: ASSOCIATED GYM
       * ==================================================================== */}
      <p>
        <strong>Gimnasio:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>
          {gymFetchError ? (
            <span style={{ color: "red" }}>{gymFetchError}</span>
          ) : gymName ? (
            gymName
          ) : (
            "Cargando..."
          )}
        </span>
      </p>

      {/* ====================================================================
       * SECCIÓN: BOTONES DE ACCIÓN
       * SECTION: ACTION BUTTONS
       * ==================================================================== */}
      {!isEditing ? (
        // Botón para entrar en modo edición / Button to enter edit mode
        <button onClick={handleEditClick}>Editar Perfil</button>
      ) : (
        // Botones para guardar o cancelar edición / Buttons to save or cancel editing
        <>
          <button onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button onClick={handleCancelClick} disabled={isSaving}>
            Cancelar
          </button>
        </>
      )}

      {/* ====================================================================
       * SECCIÓN: MENSAJES DE ERROR Y ESTADO
       * SECTION: ERROR MESSAGES AND STATUS
       * ==================================================================== */}

      {/* Mostrar errores de edición si existen / Show edit errors if they exist */}
      {isEditing && editError && (
        <p style={{ color: "red", marginTop: "1rem" }}>{editError}</p>
      )}

      {/* Indicador de carga durante guardado / Loading indicator during save */}
      {isSaving && <p>Guardando cambios...</p>}
    </div>
  );
};