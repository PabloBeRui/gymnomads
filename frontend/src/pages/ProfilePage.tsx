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

export const ProfilePage = () => {
  // Obtener el objeto 'user' del contexto de autenticación.
  // Get the 'user' object from the authentication context.
  const { user } = useAuth();

  // Crear useState para almacenar el nombre del gimnasio asociado.
  // Create useState to store the associated gym name.
  const [gymName, setGymName] = useState<string | null>(null);

  // Crear useState para manejar errores específicos de la carga del gimnasio.
  // Create useState to handle specific errors loading the gym.
  const [gymFetchError, setGymFetchError] = useState<string | null>(null); //

  // Ejecutar useEffect para obtener el nombre del gimnasio cuando 'user' esté disponible.
  // Run useEffect to fetch the gym name when 'user' is available.
  useEffect(() => {
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
      <div>
        {/* Mostrar foto de perfil si existe */}
        {/* Show profile picture if exists */}

        <img
          src={
            user.profile_picture
              ? user.profile_picture
              : "/images/profile/default_avatar.png"
          }
          alt={`${user.first_name} ${user.last_name}`}
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "1rem",
          }}
        />
      </div>
      <p>
        <strong>Nombre:</strong> {user.first_name} {user.last_name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Teléfono:</strong> {user.phone || ""}
      </p>
      <p>
        <strong>Gimnasio Asociado:</strong>{" "}
        {gymName ? (
          gymName // Mostrar nombre si se cargó / show name if loads
        ) : gymFetchError ? (
          <span style={{ color: "red" }}>({gymFetchError})</span> // Mostrar error  / show error
        ) : (
          "(Cargando nombre...)" // Mostrar mensaje de carga / show loading message
        )}
      </p>
      <p>
        <strong>Rol:</strong> {user.role}
      </p>
      <p>
        {/* Fecha formateada para hacerla más legible al usuario */}
        {/*  Date formatted to make it more readable */}
        <strong>Registrado desde:</strong>{" "}
        {new Date(user.registered_at).toLocaleDateString()}
      </p>

      {/* TODO: Añadir botones/funcionalidad para editar perfil, cambiar contraseña, subir foto */}
      {/* TODO: Add buttons/functionality to edit profile, change password, upload picture */}
    </div>
  );
};
