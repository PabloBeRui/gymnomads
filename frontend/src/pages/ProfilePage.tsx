// Importar el hook de autenticación para acceder a los datos del usuario.
// Import the authentication hook to access user data.
import { useAuth } from "../context/AuthContext";

export const ProfilePage = () => {
  // Obtener el objeto 'user' del contexto de autenticación.
  // Get the 'user' object from the authentication context.
  const { user } = useAuth();

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
        {user.profile_picture && (
          <img
            src={user.profile_picture}
            alt={`${user.first_name} ${user.last_name}`}
            style={{
              width: "100px", 
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "1rem",
            }}
          />
        )}
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
        <strong>Gimnasio Asociado (ID):</strong> {user.home_gym_id}
        {/* //TODO: Obtener y mostrar el nombre del gimnasio en lugar del ID */}
        {/* //TODO: Fetch and display gym name instead of ID */}
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
