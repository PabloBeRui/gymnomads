// frontend/src/pages/GymsPage.tsx
import { useState, useEffect } from "react";
import { getAllGyms } from "../services/gym-services"; // Servicio para obtener gimnasios
import { useAuth } from "../context/AuthContext"; // Hook para obtener el usuario
// import { Link } from 'react-router-dom'; // Para futuros enlaces
import type { Gym } from "../interfaces/gym-interfaces";

// Estilos temporales inline
// Temporary inline styles
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "20px", maxWidth: "1200px", margin: "0 auto" },

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

export const GymsPage = () => {
  // Hook de autenticación para obtener el usuario actual y su rol
  // Auth hook to get the current user and their role
  const { user } = useAuth();

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
      <h2>Gimnasios Asociados</h2>
      <p>Descubre los gimnasios a los que puedes acceder con GymNomads.</p>

      {/* Input de búsqueda */}
      {/* Search input */}
      <input
        type="text"
        placeholder="Buscar por nombre o ciudad..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={styles.searchInput}
      />

      {/* Lista de gimnasios filtrados */}
      {/* Filtered gym list */}
      <div style={styles.gymList}>
        {/* Mostrar mensaje si no hay resultados */}
        {filteredGyms.length === 0 && !isLoading && (
          <p>No se encontraron gimnasios que coincidan con tu búsqueda.</p>
        )}

        {/* Mapear sobre los gimnasios FILTRADOS */}
        {/* Map over the FILTERED gyms */}
        {filteredGyms.map((gym) => (
          <div key={gym.id} style={styles.gymCard}>
            {/* //TODO: Imagen del gimnasio */}
            <div style={styles.cardBody}>
              <h3>{gym.name}</h3>
              <p>
                {gym.address}
                <br />
                {gym.city}
              </p>
              {/* //TODO: Enlace a detalles */}
              {/* <Link to={`/gyms/${gym.id}`}>Ver detalles</Link> */}
            </div>
            {/* Mostrar botones solo si es admin */}
            {user?.role === "admin" && (
              <div style={styles.cardFooter}>
                {/* //TODO: Enlazar botones */}
                <button style={styles.button}>Editar</button>
                <button
                  style={{
                    ...styles.button,
                    color: "red",
                    borderColor: "red",
                  }}>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
