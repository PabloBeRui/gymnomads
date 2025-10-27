// Importar hooks de React / Import React hooks
import { useEffect, useState, useRef } from "react";
// Importar el hook de autenticación para acceder a los datos del usuario.
// Import the authentication hook to access user data.
import { useAuth } from "../context/AuthContext";

// Importar la función del servicio para obtener datos del gimnasio.
// Import the service function to get gym data.
import { getGymById } from "../services/gym-services";

// importar el manejador centralizado de errores.
// import the error centralized handler.
import { handleApiError } from "../utils/error-handler";
//interfaz / interface
import type { UpdateUserData, User } from "../interfaces/user-interfaces"; 
//Servicios / services
import {
  updateUserProfile,
  uploadProfilePicture,
} from "../services/user-services"; 

//Sonner notifications
import { toast } from "sonner";  

// Estilos para campos "deshabilitados" visualmente durante la edición
// Styles for visually "disabled" fields during editing
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
  // Obtener el objeto 'user' y token/setUser del contexto de autenticación.
  // Get the 'user' object and token/setUser from the authentication context.
  const { user, token, setUser } = useAuth(); 

  // Crear useState para almacenar el nombre del gimnasio asociado.
  // Create useState to store the associated gym name.
  const [gymName, setGymName] = useState<string | null>(null);

  // Crear useState para manejar errores específicos de la carga del gimnasio.
  // Create useState to handle specific errors loading the gym.
  const [gymFetchError, setGymFetchError] = useState<string | null>(null);

  // --- UseStates para Modo Edición ---
  // --- useStates for Edit Mode ---
  // useState para saber si estamos en modo edición.
  // useState to know if we are in edit mode.
  const [isEditing, setIsEditing] = useState(false);
  // useStates para los campos editables del formulario. Inicializar con datos del usuario.
  // useStates for editable form fields. Initialize with user data.
  const [editFirstName, setEditFirstName] = useState(user?.first_name || "");
  const [editLastName, setEditLastName] = useState(user?.last_name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  // useState para errores específicos del formulario de edición.
  // useState for specific edit form errors.
  const [editError, setEditError] = useState<string | null>(null);
  // useState para estado de carga al guardar.
  //useState for loading state when saving.
  const [isSaving, setIsSaving] = useState(false);

  // ----UseStates para Subida de Imagen ---
  // ----useStates for Image Upload ---
  // Crear useState para el archivo de imagen seleccionado (tipo File).
  // Create useState for the selected image file (File type).
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Crear useState para la URL de vista previa de la imagen seleccionada.
  // Create useState for the preview URL of the selected image.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Crear useRef para el input de archivo oculto.
  // Create useRef for the hidden file input.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ejecutar useEffect para obtener el nombre del gimnasio cuando 'user' esté disponible.
  // Run useEffect to fetch the gym name when 'user' is available.
  useEffect(() => {
    // Definir función asíncrona para cargar el nombre del gimnasio.
    // Define an async function to load the gym name.
    const fetchGymName = async () => {
      // Asegurarse de que 'user' y 'home_gym_id' existen.
      // Make sure 'user' and 'home_gym_id' exist.
      if (user?.home_gym_id) {
        try {
          setGymFetchError(null); // Limpiar error previo / Clear previous error
          // Llamar al servicio para obtener los datos del gimnasio por ID.
          // Call the service to get gym data by ID.
          const gymData = await getGymById(user.home_gym_id);
          // Actualizar estado con el nombre del gimnasio.
          // Update state with the gym name.
          setGymName(gymData.name);
        } catch (err) {
          // Usar el manejador centralizado para obtener el mensaje.
          // Use the centralized handler to get the error message.
          const errorMessage = handleApiError(
            err,
            "No se pudo cargar el nombre del gimnasio."
          );
          // Actualizar el estado de error específico de esta carga.
          // Update the specific error state for this load.
          setGymFetchError(errorMessage);
          setGymName(null); // Asegurar que gymName quede null si falla. / Ensure gymName is null on failure.
        }
      }
    };

    fetchGymName();
    // Ejecutar este efecto si 'user' (específicamente su ID de gimnasio) cambia.
    // Run this effect if 'user' (specifically their gym ID) changes.
  }, [user?.home_gym_id]);

  // --- Manejadores para Modo Edición ---
  // --- Handlers for Edit Mode ---

  // Definir función para entrar en modo edición.
  // Define function to enter edit mode.
  const handleEditClick = () => {
    // Reiniciar estados de edición con valores actuales del usuario
    // Reset edit states with current user values
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
    setEditError(null); // Limpiar errores previos / Clear previous errors
    setIsEditing(true); // Activar modo edición / Activate edit mode
    // Limpiar vista previa de imagen al entrar en modo edición
    // Clear image preview when entering edit mode
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Definir función para cancelar la edición.
  // Define function to cancel editing.
  const handleCancelClick = () => {
    setIsEditing(false); // Desactivar modo edición / Deactivate edit mode
    setEditError(null); // Limpiar errores / Clear errors
    // Limpiar selección de archivo y vista previa
    // Clear file selection and preview
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // --- Manejadores para Subida de Imagen ---
  // --- Handlers for Image Upload ---

  // Definir función para manejar clic en la imagen (solo en modo edición).
  // Define function to handle image click (edit mode only).
  const handleImageClick = () => {
    if (isEditing) {
      // Activar el input de archivo oculto / Trigger the hidden file input
      fileInputRef.current?.click();
    }
  };

  // Definir función para manejar la selección de archivo.
  // Define function to handle file selection.
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Obtener el primer archivo / Get the first file
    if (file) {
      // Guardar el archivo en el estado.
      // Save the file in the state.
      setSelectedFile(file);
      // Crear y guardar una URL de vista previa para mostrar la imagen seleccionada.
      // Create and save a preview URL to display the selected image.
      setPreviewUrl(URL.createObjectURL(file));
      setEditError(null); // Limpiar errores (si había de "Guardar")
    }
  };

  // Definir función para guardar los cambios.
  // Define function to save changes.
  const handleSaveClick = async () => {
    // Validar campos de texto (igual)
    // Validate text fields (same)
    if (!editFirstName || !editLastName) {
      setEditError("El nombre y los apellidos son obligatorios.");
      return;
    }
    setEditError(null);
    setIsSaving(true);

    let newImageUrl = user?.profile_picture || null; // Empezar con la URL actual / Start with current URL

    try {
      if (!token) throw new Error("No autenticado.");

      // --- 1. Subir Nueva Imagen (si hay una seleccionada) ---
      // --- 1. Upload New Image (if one is selected) ---
      if (selectedFile) {
        console.log("Guardando nueva foto de perfil...");
        // Llamar al servicio de subida de imagen.
        // Call the image upload service.
        const uploadResponse = await uploadProfilePicture(token, selectedFile);

        // Construir la URL completa desde el filePath devuelto por el backend.
        // Build the full URL from the filePath returned by the backend.
        const imagePath = uploadResponse.filePath.replace(/\\/g, "/");
        newImageUrl = `${import.meta.env.VITE_BACKEND_BASE_URL}/${imagePath}`;

        toast.success(uploadResponse.message || "Foto actualizada.");
        console.log("Nueva URL de imagen:", newImageUrl);
      }

      // --- 2. Actualizar Datos de Texto ---
      // --- 2. Update Text Data ---
      const updatedData: UpdateUserData = {
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
      };
      // Llamar al servicio para actualizar el perfil.
      // Call the service to update the profile.
      const updateResponse = await updateUserProfile(token, updatedData);

      // Mostrar solo un toast de éxito general si la imagen no cambió
      // Show only one general success toast if image didn't change
      if (!selectedFile) {
        toast.success(
          updateResponse.message || "Perfil actualizado con éxito."
        );
      }

      // --- 3. Actualizar el Contexto  ---
      // --- 3. Update the Context  ---
      const updatedUser: User = {
        ...user!, // Copiar datos existentes
        first_name: editFirstName, // Dato de texto actualizado
        last_name: editLastName, // Dato de texto actualizado
        phone: editPhone || null, // Dato de texto actualizado
        profile_picture: newImageUrl, // URL de imagen (nueva o la antigua si no se cambió)
      };
      // Llamar a 'setUser' del contexto para actualizar 'user' globalmente.
      // Call 'setUser' from context to update 'user' globally.
      setUser(updatedUser);

      // --- 4. Limpiar ---
      // --- 4. Clean up ---
      setIsEditing(false); // Salir del modo edición
      setSelectedFile(null); // Limpiar archivo seleccionado
      setPreviewUrl(null); // Limpiar vista previa
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar el perfil.");
      setEditError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false); // Finalizar estado de guardado
    }
  };

  // Comprobar si los datos del usuario están disponibles (aunque ProtectedRoute ya lo asegura).
  // Check if user data is available (although ProtectedRoute already ensures this).
  if (!user) {
    return <div>Error: No se pudieron cargar los datos del usuario.</div>;
  }

  // Determinar qué URL de imagen mostrar
  // Determine which image URL to show
  const displayImageUrl = previewUrl
    ? previewUrl // 1. Mostrar la vista previa si existe / Show preview if it exists
    : user.profile_picture
    ? user.profile_picture // 2. Si no, mostrar la imagen actual / If not, show current user image
    : "/images/profile/default_avatar.png"; // 3. Si no, mostrar el avatar por defecto / If not, show default avatar

  // Renderizar la información del perfil del usuario.
  // Render the user's profile information.
  return (
    <div>
      <h2>Mi Perfil</h2>
      {/* --- Imagen (Siempre visible) --- */}
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
            cursor: isEditing ? "pointer" : "default", // Cambiar cursor si es editable / Change cursor if editable
          }}
          onClick={handleImageClick} // Manejador de clic / Click handler
          title={isEditing ? "Haz clic para cambiar la foto" : "Foto de perfil"} // Título de ayuda / Help title
        />
        {/* Input de archivo oculto / Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }} // Ocultar input / Hide input
          accept="image/png, image/jpeg, image/webp, image/jpg" // Aceptar solo imágenes / Accept only images
        />
        {/* Mostrar texto de ayuda solo en modo edición / Show help text only in edit mode */}
        {isEditing && (
          <p style={{ fontSize: "0.8rem", color: "grey" }}>
            (Haz clic en la imagen para cambiarla)
          </p>
        )}
      </div>

      {/* --- Campos Editables / Texto --- */}
      <div>
        <strong>Nombre:</strong>{" "}
        {isEditing ? (
          <input
            type="text"
            value={editFirstName}
            onChange={(e) => setEditFirstName(e.target.value)}
            required
          />
        ) : (
          <span>{user.first_name}</span>
        )}
      </div>
      <div>
        <strong>Apellidos:</strong>{" "}
        {isEditing ? (
          <input
            type="text"
            value={editLastName}
            onChange={(e) => setEditLastName(e.target.value)}
            required
          />
        ) : (
          <span>{user.last_name}</span>
        )}
      </div>
      <div>
        <strong>Teléfono:</strong>{" "}
        {isEditing ? (
          <input
            type="tel"
            value={editPhone || ""}
            onChange={(e) => setEditPhone(e.target.value)}
          />
        ) : (
          <span>{user.phone || "No especificado"}</span>
        )}
      </div>

      {/* --- Campos No Editables (con estilo condicional) --- */}
      <p>
        <strong>Email:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>{user.email}</span>
      </p>
      <p>
        <strong>Gimnasio Asociado:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>
          {gymName
            ? gymName
            : gymFetchError
            ? `(${gymFetchError})`
            : "(Cargando...)"}{" "}
          (ID: {user.home_gym_id})
        </span>
      </p>
      <p>
        <strong>Rol:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>{user.role}</span>
      </p>
      <p>
        <strong>Registrado desde:</strong>{" "}
        <span style={isEditing ? disabledStyle : {}}>
          {new Date(user.registered_at).toLocaleDateString()}
        </span>
      </p>

      {/* Mostrar error de edición solo en modo edición */}
      {/* Show edit error only in edit mode */}
      {isEditing && editError && <p style={{ color: "red" }}>{editError}</p>}

      {/* --- Botones Condicionales --- */}
      <div>
        {isEditing ? (
          <>
            <button onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              onClick={handleCancelClick}
              disabled={isSaving}
              style={{ marginLeft: "10px" }}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={handleEditClick}>Editar Perfil</button>
        )}
      </div>
    </div>
  );
};
