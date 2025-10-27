// Importar hooks de React / Import React hooks
import { useEffect, useState } from "react";
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
import { updateUserProfile } from "../services/user-services"; 

//Sonner notifications
import { toast } from "sonner"; // <-- Importar toast

// Estilos para campos "deshabilitados" visualmente durante la edición
// Styles for visually "disabled" fields during editing
const disabledStyle = {
  color: 'grey',
  fontStyle: 'italic',
  backgroundColor: '#f8f8f8', 
  padding: '2px 4px',       
  borderRadius: '3px',      
  display: 'inline-block', 
  margin: '0',             
};

export const ProfilePage = () => {
  // Obtener el objeto 'user' y token/login del contexto de autenticación.
  // Get the 'user' object and token/login from the authentication context.
  const { user, token, setUser } = useAuth(); // <-- Obtener token y login

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
  // useState for loading state when saving.
  const [isSaving, setIsSaving] = useState(false);

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
  };

  // Definir función para cancelar la edición.
  // Define function to cancel editing.
  const handleCancelClick = () => {
    setIsEditing(false); // Desactivar modo edición / Deactivate edit mode
    setEditError(null); // Limpiar errores / Clear errors
  };

  // Definir función para guardar los cambios.
  // Define function to save changes.
  const handleSaveClick = async () => {
    // Validar campos (básico) / Basic field validation
    if (!editFirstName || !editLastName) {
      setEditError("El nombre y los apellidos son obligatorios.");
      return;
    }
    setEditError(null);
    setIsSaving(true); // Indicar inicio de guardado / Indicate start of saving

    // Construir objeto con los datos actualizados.
    // Build object with updated data.
    const updatedData: UpdateUserData = {
      first_name: editFirstName,
      last_name: editLastName,
      phone: editPhone || null, // Enviar null si está vacío / Send null if empty
    };
    
    try {
      // Comprobar si hay token (necesario para la llamada API).
      // Check if token exists (needed for API call).
      if (!token) {
        throw new Error("No autenticado.");
      }
      // Llamar al servicio para actualizar el perfil.
      // Call the service to update the profile.
      const response = await updateUserProfile(token, updatedData);
      toast.success(response.message || "Perfil actualizado con éxito.");

      // --- Actualizar el contexto ---Update the context ---
      // Crear nuevo objeto 'user' con los datos actualizados.
      // Create new 'user' object with updated data.
      const updatedUser: User = {
        ...user!, // Copiar datos existentes (asegura que user no es null aquí) / Copy existing data (ensure user is not null here)
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
      };
      // Llamar a 'login' del contexto para actualizar 'user' globalmente (reutilizamos login para actualizar)
      // Call 'login' from context to update 'user' globally (we reuse login for updating)
      setUser( updatedUser); 
      // --- Fin Actualización Contexto ---

      setIsEditing(false); // Salir del modo edición / Exit edit mode
    } catch (err) {
      // Usar manejador de errores / Use error handler
      const errorMessage = handleApiError(err, "Error al guardar el perfil.");
      setEditError(errorMessage); // Mostrar error en el formulario / Show error in the form
      toast.error(errorMessage); // Mostrar notificación de error / Show error notification
    } finally {
      setIsSaving(false); // Finalizar estado de guardado / End saving state
    }
  };

  // Comprobar si los datos del usuario están disponibles (aunque ProtectedRoute ya lo asegura).
  // Check if user data is available (although ProtectedRoute already ensures this).
  if (!user) {
    return <div>Error: No se pudieron cargar los datos del usuario.</div>;
  }

  // Renderizar la información del perfil del usuario.
  // Render the user's profile information.
  return (
        <div>
            <h2>Mi Perfil</h2>
            {/* --- Imagen (Siempre visible) --- */}
            <div>
                <img
                    src={user.profile_picture ? user.profile_picture : "/images/profile/default_avatar.png"}
                    alt={`${user.first_name} ${user.last_name}`}
                    style={{ /* ... estilos imagen ... */ 
                        width: "100px", height: "100px", borderRadius: "50%", 
                        objectFit: "cover", marginBottom: "1rem" 
                    }}
                />
                 {/* //TODO Botón para cambiar foto (al clickar sobre la imagen se abre explorador para elegir otra?) */}
            </div>

            {/* --- Campos Editables / Texto --- */}
            <div>
                <strong>Nombre:</strong>{' '}
                {/* Mostrar input o texto según modo edición / Show input or text based on edit mode */}
                {isEditing ? (
                    <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
                ) : (
                    <span>{user.first_name}</span>
                )}
            </div>
            <div>
                <strong>Apellidos:</strong>{' '}
                {/* Mostrar input o texto según modo edición / Show input or text based on edit mode */}
                {isEditing ? (
                    <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required />
                ) : (
                    <span>{user.last_name}</span>
                )}
            </div>
             <div>
                <strong>Teléfono:</strong>{' '}
                {/* Mostrar input o texto según modo edición / Show input or text based on edit mode */}
                {isEditing ? (
                     <input type="tel" value={editPhone || ''} onChange={(e) => setEditPhone(e.target.value)} />
                 ) : (
                     <span>{user.phone || "No especificado"}</span>
                 )}
            </div>

            {/* --- Campos No Editables (con estilo condicional) --- */}
            <p>
                <strong>Email:</strong>{' '}
                {/* Aplicar estilo condicional / Apply conditional style */}
                <span style={isEditing ? disabledStyle : {}}>{user.email}</span>
                 {isEditing && ' (No editable)'} {/* Añadir texto si está editando / Add text if editing */}
            </p>
             <p>
                 <strong>Gimnasio Asociado:</strong>{' '}
                 {/* Aplicar estilo condicional / Apply conditional style */}
                 <span style={isEditing ? disabledStyle : {}}>
                     {gymName ? gymName : gymFetchError ? `(${gymFetchError})` : '(Cargando...)'}
                     {' '} (ID: {user.home_gym_id})
                 </span>
                 {isEditing && ' (No editable)'}
             </p>
            <p>
                <strong>Rol:</strong>{' '}
                {/* Aplicar estilo condicional / Apply conditional style */}
                <span style={isEditing ? disabledStyle : {}}>{user.role}</span>
                 {isEditing && ' (No editable)'}
            </p>
            <p>
                <strong>Registrado desde:</strong>{' '}
                {/* Aplicar estilo condicional / Apply conditional style */}
                <span style={isEditing ? disabledStyle : {}}>{new Date(user.registered_at).toLocaleDateString()}</span>
                 {isEditing && ' (No editable)'}
            </p>

             {/* Mostrar error de edición solo en modo edición */}
             {/* Show edit error only in edit mode */}
            {isEditing && editError && <p style={{ color: 'red' }}>{editError}</p>}

            {/* --- Botones Condicionales --- */}
            <div>
                {isEditing ? (
                    <>
                        <button onClick={handleSaveClick} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button onClick={handleCancelClick} disabled={isSaving} style={{marginLeft: '10px'}}>
                            Cancelar
                        </button>
                         {/* //TODO Botón/Enlace para cambiar contraseña (quizás aquí?) */}
                    </>
                ) : (
                    <button onClick={handleEditClick}>Editar Perfil</button>
                )}
            </div>
        </div>
    );
};