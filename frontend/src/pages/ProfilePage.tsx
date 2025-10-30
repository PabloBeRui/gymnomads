// Importar hooks de React / Import React hooks
import { useEffect, useState, useRef } from "react";
// Importar el hook de autenticación para acceder a los datos del usuario / Import the authentication hook to access user data
import { useAuth } from "../context/AuthContext";
// Importar el hook personalizado para manejar llamadas API / Import the custom hook to handle API calls
import { useApiCall } from "../hooks/useApiCall";

// Importar la función del servicio para obtener datos del gimnasio / Import the service function to get gym data
import { getGymById } from "../services/gym-services";

// Importar el manejador centralizado de errores / Import the centralized error handler
import { handleApiError } from "../utils/error-handler";

// Interfaz / Interface
import type {
  UpdateUserData,
  User,
  UploadProfilePictureResponse,
  UpdateProfileResponse,
} from "../interfaces/user-interfaces";

// Servicios / Services
import {
  updateUserProfile,
  uploadProfilePicture,
} from "../services/user-services";

// Sonner notifications
import { toast } from "sonner";

// Estilos para campos "deshabilitados" visualmente durante la edición / Styles for visually "disabled" fields during editing
const disabledStyle = {
  color: "grey",
  fontStyle: "italic",
  backgroundColor: "#f8f8f8",
  padding: "2px 4px",
  borderRadius: "3px",
  display: "inline-block",
  margin: "0",
};

export const ProfilePage = () => {
  // Obtener el objeto 'user', token y setUser del contexto de autenticación / Get the 'user' object, token and setUser from the authentication context
  const { user, token, setUser } = useAuth();

  // Crear useState para almacenar el nombre del gimnasio asociado / Create useState to store the associated gym name
  const [gymName, setGymName] = useState<string | null>(null);

  // Crear useState para manejar errores específicos de la carga del gimnasio / Create useState to handle specific errors loading the gym
  const [gymFetchError, setGymFetchError] = useState<string | null>(null);

  // --- UseStates para Modo Edición / useStates for Edit Mode ---
  // Crear useState para saber si estamos en modo edición / Create useState to know if we are in edit mode
  const [isEditing, setIsEditing] = useState(false);
  // Crear useStates para los campos editables del formulario / Create useStates for editable form fields
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Usar el hook personalizado para manejar llamadas API / Use the custom hook to handle API calls
  const {
    loading: isSaving,
    error: editError,
    execute,
  } = useApiCall("Error al guardar el perfil.");

  // --- UseStates para Subida de Imagen / useStates for Image Upload ---
  // Crear useState para el archivo de imagen seleccionado (tipo File) / Create useState for the selected image file (File type)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Crear useState para la URL de vista previa de la imagen seleccionada / Create useState for the preview URL of the selected image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Crear useRef para el input de archivo oculto / Create useRef for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar campos editables cuando el usuario se carga / Synchronize editable fields when user loads
  useEffect(() => {
    if (user) {
      setEditFirstName(user.first_name || "");
      setEditLastName(user.last_name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  // Ejecutar useEffect para obtener el nombre del gimnasio cuando 'user' esté disponible / Run useEffect to fetch the gym name when 'user' is available
  useEffect(() => {
    // Definir función asíncrona para cargar el nombre del gimnasio / Define an async function to load the gym name
    const fetchGymName = async () => {
      // Asegurarse de que 'user' y 'home_gym_id' existen / Make sure 'user' and 'home_gym_id' exist
      if (user?.home_gym_id) {
        try {
          setGymFetchError(null); // Limpiar error previo / Clear previous error
          // Llamar al servicio para obtener los datos del gimnasio por ID / Call the service to get gym data by ID
          const gymData = await getGymById(user.home_gym_id);
          // Actualizar estado con el nombre del gimnasio / Update state with the gym name
          setGymName(gymData.name);
        } catch (err) {
          // Usar el manejador centralizado para obtener el mensaje / Use the centralized handler to get the error message
          const errorMessage = handleApiError(
            err,
            "No se pudo cargar el nombre del gimnasio."
          );
          // Actualizar el estado de error específico de esta carga / Update the specific error state for this load
          setGymFetchError(errorMessage);
          setGymName(null); // Asegurar que gymName quede null si falla / Ensure gymName is null on failure
        }
      }
    };

    fetchGymName();
    // Ejecutar este efecto si 'user' (específicamente su ID de gimnasio) cambia / Run this effect if 'user' (specifically their gym ID) changes
  }, [user?.home_gym_id]);

  // --- Manejadores para Modo Edición / Handlers for Edit Mode ---

  // Definir función para entrar en modo edición / Define function to enter edit mode
  const handleEditClick = () => {
    // Reiniciar estados de edición con valores actuales del usuario / Reset edit states with current user values
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
    // Activar modo edición / Activate edit mode
    setIsEditing(true);
    // Limpiar vista previa de imagen al entrar en modo edición / Clear image preview when entering edit mode
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Definir función para cancelar la edición / Define function to cancel editing
  const handleCancelClick = () => {
    // Desactivar modo edición / Deactivate edit mode
    setIsEditing(false);
    // Limpiar selección de archivo y vista previa / Clear file selection and preview
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // --- Manejadores para Subida de Imagen / Handlers for Image Upload ---

  // Definir función para manejar clic en la imagen (solo en modo edición) / Define function to handle image click (edit mode only)
  const handleImageClick = () => {
    if (isEditing) {
      // Activar el input de archivo oculto / Trigger the hidden file input
      fileInputRef.current?.click();
    }
  };

  // Definir función para manejar la selección de archivo / Define function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Obtener el primer archivo / Get the first file
    const file = event.target.files?.[0];
    if (file) {
      // Guardar el archivo en el estado / Save the file in the state
      setSelectedFile(file);
      // Crear y guardar una URL de vista previa para mostrar la imagen seleccionada / Create and save a preview URL to display the selected image
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Definir función para guardar los cambios / Define function to save changes
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
      if (selectedFile) {
        console.log("Guardando nueva foto de perfil...");

        // Ejecutar llamada API para subir imagen / Execute API call to upload image
        const uploadResponse = await execute<UploadProfilePictureResponse>(
          () => uploadProfilePicture(token, selectedFile),
          "Error al subir la imagen"
        );

        // Construir la URL completa desde el filePath devuelto por el backend / Build the full URL from the filePath returned by the backend
        const imagePath = uploadResponse.filePath.replace(/\\/g, "/");
        newImageUrl = `${import.meta.env.VITE_BACKEND_BASE_URL}/${imagePath}`;

        // Mostrar notificación de éxito / Show success notification
        toast.success(uploadResponse.message || "Foto actualizada.");
        console.log("Nueva URL de imagen:", newImageUrl);
      }

      // --- 2. Actualizar Datos de Texto / Update Text Data ---
      // Preparar datos actualizados / Prepare updated data
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

      // Mostrar notificación solo si no se cambió la imagen / Show notification only if image wasn't changed
      if (!selectedFile) {
        toast.success(
          updateResponse.message || "Perfil actualizado con éxito."
        );
      }

      // --- 3. Actualizar el Contexto / Update the Context ---
      // Crear nuevo objeto 'user' con los datos actualizados / Create new 'user' object with updated data
      const updatedUser: User = {
        ...user!,
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
        profile_picture: newImageUrl,
      };

      // Llamar a 'setUser' del contexto para actualizar 'user' globalmente / Call 'setUser' from context to update 'user' globally
      setUser(updatedUser);

      // --- 4. Limpiar / Clean up ---
      // Salir del modo edición / Exit edit mode
      setIsEditing(false);
      // Limpiar archivo seleccionado / Clear selected file
      setSelectedFile(null);
      // Limpiar vista previa / Clear preview
      setPreviewUrl(null);
    } catch (err) {
      // Manejar el error usando handleApiError directamente / Handle error using handleApiError directly
      const errorMessage = handleApiError(err, "Error al guardar el perfil.");
      // Mostrar notificación de error / Show error notification
      toast.error(errorMessage);
    }
  };

  // Comprobar si los datos del usuario están disponibles (aunque ProtectedRoute ya lo asegura) / Check if user data is available (although ProtectedRoute already ensures this)
  if (!user) {
    return <div>Error: No se pudieron cargar los datos del usuario.</div>;
  }

  // Determinar qué URL de imagen mostrar / Determine which image URL to show
  const displayImageUrl = previewUrl
    ? previewUrl // 1. Mostrar la vista previa si existe / Show preview if it exists
    : user.profile_picture
    ? user.profile_picture // 2. Si no, mostrar la imagen actual / If not, show current user image
    : "/images/profile/default_avatar.png"; // 3. Si no, mostrar el avatar por defecto / If not, show default avatar

  // Renderizar la información del perfil del usuario / Render the user's profile information
  return (
    <div>
      <h2>Mi Perfil</h2>
      {/* --- Imagen (Siempre visible) / Image (Always visible) --- */}
      <div>
        <img
          src={displayImageUrl} // Usar la URL determinada / Use the determined URL
          alt={`${user.first_name} ${user.last_name}`}
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "1rem",
            cursor: isEditing ? "pointer" : "default",
          }}
          onClick={handleImageClick}
          title={isEditing ? "Haz clic para cambiar la foto" : "Foto de perfil"}
        />

        {/* Input de archivo oculto / Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/png, image/jpeg, image/webp, image/jpg"
        />
      </div>

      {/* --- Campos no editables (siempre visibles) / Non-editable fields (always visible) --- */}
      <p>
        <strong>Email:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>{user.email}</span>
      </p>
      <p>
        <strong>Rol:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>{user.role}</span>
      </p>

      {/* --- Campos editables / Editable fields --- */}
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

      {/* --- Gimnasio asociado (siempre visible, no editable) / Associated gym (always visible, not editable) --- */}
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

      {/* --- Botones de Acción / Action Buttons --- */}
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

      {/* --- Mostrar errores de edición si existen / Show edit errors if they exist --- */}
      {isEditing && editError && (
        <p style={{ color: "red", marginTop: "1rem" }}>{editError}</p>
      )}

      {/* --- Indicador de carga durante guardado / Loading indicator during save --- */}
      {isSaving && <p>Guardando cambios...</p>}
    </div>
  );
};
