// frontend/src/pages/GymsPage.tsx
import { useState, useEffect } from "react";
import { getAllGyms, deleteGym } from "../services/gym-services";
import { useAuth } from "../context/AuthContext"; // Hook para obtener el usuario
import { Link } from "react-router-dom";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner"; // sonner toast
import { handleApiError } from "../utils/error-handler";

// Estilos temporales inline
// Temporary inline styles
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "20px", maxWidth: "1200px", margin: "0 auto" },
  addGymButton: {
    display: "inline-block",
    marginBottom: "20px",
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  gymList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginTop: "20px",
  },
  gymCard: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "15px",
    flex: "1 1 300px",
    boxSizing: "border-box",
  },
  gymLogo: {
    width: "100%",
    height: "150px",
    objectFit: "contain",
    marginBottom: "15px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  cardBody: { marginBottom: "10px" },
  cardFooter: {
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #eee",
    color: "#6c757d",
  },
  button: { marginRight: "10px", padding: "5px 10px", cursor: "pointer" },
};

/**
 * Página para mostrar la lista de todos los gimnasios disponibles con filtro de búsqueda.
 * Permite ver detalles básicos y, si el usuario tiene permisos (admin),
 * muestra opciones para editar o eliminar.
 *
 * Page to display the list of all available gyms with a search filter.
 * Allows viewing basic details and, if the user has permissions (admin),
 *  shows options to edit or delete.
 */

export const ListGymsPage = () => {
  // Extraer 'user' Y 'token' del hook useAuth
  // Extract 'user' AND 'token' from the useAuth hook
  const { user, token } = useAuth();

  // useState para almacenar la lista de gimnasios
  // useState to store the list of gyms
  const [gyms, setGyms] = useState<Gym[]>([]);

  // useState para manejar errores durante la carga de datos
  // useState to handle errors during data loading
  const [error, setError] = useState<string | null>(null);

  // useState para indicar si los datos están cargando
  // useState to indicate if data is loading
  const [isLoading, setIsLoading] = useState(true);

  // useState para el término de búsqueda introducido por el usuario
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Obtengo la URL base del backend desde las variables de entorno o uso un valor por defecto
  // I get the backend base URL from environment variables or use a default value
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  // useEffect para cargar los gimnasios cuando el componente se monta
  // useEffect to load gyms when the component mounts
  useEffect(() => {
    const fetchGyms = async () => {
      try {
        // Reiniciar error y poner estado de carga
        // Reset error and set loading state
        setError(null);
        setIsLoading(true);
        // Llamada a la API para obtener todos los gimnasios
        // API call to get all gyms
        const data = await getAllGyms();
        setGyms(data); // Guardar los gimnasios en el estado
      } catch (err) {
        // Manejar errores de la petición
        // Handle request errors
        console.error("Error fetching gyms:", err);
        setError(
          "Hubo un problema al cargar los gimnasios. Inténtalo de nuevo más tarde."
        );
      } finally {
        // Quitar estado de carga independientemente del resultado
        // Remove loading state regardless of the result
        setIsLoading(false);
      }
    };

    fetchGyms(); // Ejecutar la función de carga // Execute the loading function
  }, []); // El array vacío asegura que se ejecute solo una vez al montar // Empty array ensures it runs only once on mount

  // Función para manejar cambios en el input de búsqueda
  // Function to handle changes in the search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value); // Actualiza el estado searchTerm
  };

  // Filtrar gimnasios basándose en searchTerm (nombre o ciudad)
  // Filter gyms based on searchTerm (name or city)
  const filteredGyms = gyms.filter(
    (gym) =>
      gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Definir manejador para eliminar un gimnasio
  // Define handler to delete a gym
  const handleDelete = async (gymId: number): Promise<void> => {
    // Preguntar confirmación al usuario
    // Ask user for confirmation
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este gimnasio? Esta acción no se puede deshacer."
      )
    ) {
      // Verificar que tenemos el token (necesario para la petición)
      // Verify we have the token (needed for the request)
      if (!token) {
        toast.error("No estás autenticado para realizar esta acción.");
        return;
      }

      try {
        // Llamar al servicio para eliminar el gimnasio
        // Call the service to delete the gym
        await deleteGym(gymId, token);

        // Éxito: Eliminar el gimnasio del estado local para actualizar la UI
        // Success: Remove the gym from local state to update the UI
        setGyms((prevGyms) => prevGyms.filter((gym) => gym.id !== gymId));

        // Mostrar notificación de éxito
        // Show success notification
        toast.success("Gimnasio eliminado con éxito.");
      } catch (err) {
        // Error: Mostrar notificación de error usando el manejador
        // Error: Show error notification using the handler
        const processedErrorMessage = handleApiError(
          err,
          "No se pudo eliminar el gimnasio."
        );
        toast.error(processedErrorMessage);
        console.error("Error deleting gym:", err); // Mantener log para depuración // Keep log for debugging
      }
    }
  };

  // Renderizado condicional mientras carga
  // Conditional rendering while loading
  if (isLoading) {
    return (
      <div>
        <p>Cargando gimnasios...</p>
        {/* //TODO  spinner  */}
      </div>
    );
  }

  // Renderizado condicional si hay error
  // Conditional rendering if there is an error
  if (error) {
    return (
      <div>
        <div>{error}</div>
      </div>
    );
  }

  // Renderizado principal de la lista de gimnasios
  // Main rendering of the gym list
  return (
    <div style={styles.container}>
      {/* ... (Título, párrafo e input sin cambios) ... */}
      <h2>Gimnasios Asociados</h2>
      <p>Descubre los gimnasios a los que puedes acceder con GymNomads.</p>
      {/* Botón para añadir gimnasio (solo visible para admin) */}
      {/* Button to add gym (only visible for admin) */}
      {user?.role === "admin" && (
        <Link to="/gyms/add" style={styles.addGymButton}>
          {" "}
          {/* Enlace a la nueva ruta */}
          Añadir Gimnasio
        </Link>
      )}
      <input
        type="text"
        placeholder="Buscar por nombre o ciudad..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={styles.searchInput}
      />

      <div style={styles.gymList}>
        {/* Mostrar mensaje si no hay resultados */}
        {filteredGyms.length === 0 && !isLoading && (
          <p style={styles.noResultsText}>
            No se encontraron gimnasios que coincidan con tu búsqueda.
          </p> // Añadido estilo
        )}

        {/* Mapear sobre los gimnasios FILTRADOS */}
        {filteredGyms.map((gym) => {
          // <--- Añadida llave de apertura

          // Construir la URL del logo
          // build the logo URL
          const logoSrc = gym.logo_url
            ? `${backendBaseUrl}/${
                gym.logo_url.startsWith("/")
                  ? gym.logo_url.substring(1)
                  : gym.logo_url
              }` // Crea URL completa si hay logo // Build full URL if logo exists
            : "/images/gym-logo/default-gym-logo.png"; // Usar el logo por defecto si no hay // Use default logo if none

          // Se usa un 'return' aquí por llaves en el map
          // it needs to add a 'return' here because curly braces in the map
          return (
            <div key={gym.id} style={styles.gymCard}>
              {/* Mostrar la imagen del logo */}
              {/* Display the logo image */}
              <img
                src={logoSrc}
                alt={`Logo de ${gym.name}`}
                style={styles.gymLogo}
                // onError por si la imagen del backend falla, para mostrar el default
                // onError in case the backend image fails, to show the default
                onError={(e) => {
                  const target = e.target as HTMLImageElement; // Type assertion needed for TS
                  target.onerror = null; // Previene bucles si el default también falla // Prevents loops if default also fails
                  target.src = "/images/gym-logo/default-gym-logo.png"; // Fallback al default // Fallback to default
                }}
              />

              <div style={styles.cardBody}>
                <h3>{gym.name}</h3>
                <p>
                  {gym.address}
                  <br />
                  {gym.city}
                </p>
                {/* //TODO: Enlace a detalles */}
              </div>
              {/* Mostrar botones solo si es admin o manager (con condiciones) */}
              {/* Show buttons only if admin or manager (with conditions) */}
              {(user?.role === "admin" ||
                (user?.role === "manager" && user.home_gym_id === gym.id)) && (
                <div style={styles.cardFooter}>
                  {/* El botón 'Editar' se muestra si: */
                  /* The 'Edit' button is shown if: */}
                  {/* 1. El usuario es 'admin' (condición externa ya lo permite) */}
                  {/* 1. The user is 'admin' (outer condition already allows it) */}
                  {/* 2. El usuario es 'manager' Y el gym.id coincide con su home_gym_id (condición externa) */}
                  {/* 2. The user is 'manager' AND gym.id matches their home_gym_id (outer condition) */}
                  <button style={styles.button}>Editar</button>

                  {/* El botón 'Eliminar' se muestra SÓLO si es 'admin' */}
                  {/* The 'Delete' button is shown ONLY if 'admin' */}
                  {user.role === "admin" && (
                    <button
                      style={{
                        ...styles.button,
                        ...styles.deleteButton,
                      }}
                      onClick={() => handleDelete(gym.id)}>
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
