/**
 * =============================================================================
 * PÁGINA: ListGymsPage / GymsPage
 * =============================================================================
 *
 * Página para mostrar la lista de todos los gimnasios disponibles con filtro
 * de búsqueda. Permite ver detalles básicos y, si el usuario tiene permisos
 * (admin o manager de ese gym), muestra opciones para editar o eliminar.
 *
 * Page to display the list of all available gyms with a search filter.
 * Allows viewing basic details and, if the user has permissions (admin or the
 * manager of that gym), shows options to edit or delete.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { getAllGyms, deleteGym } from "../services/gym-services";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";

/* =============================================================================
   ESTILOS (inline)
   ============================================================================= */
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
    backgroundColor: "white",
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
  deleteButton: {
    marginRight: "10px",
    padding: "5px 10px",
    cursor: "pointer",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
  },
  noResultsText: { color: "#666", fontStyle: "italic" },
};

/* =============================================================================
   COMPONENTE: ListGymsPage
   ============================================================================= */
export const ListGymsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fallback para backendBaseUrl
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  // Cargar gimnasios al montar
  useEffect(() => {
    const fetchGyms = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const data = await getAllGyms();
        setGyms(data);
      } catch (err) {
        const msg = handleApiError(
          err,
          "Hubo un problema al cargar los gimnasios."
        );
        setError(msg);
        toast.error(msg);
        if (import.meta.env.DEV) console.error("Error fetching gyms:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGyms();
  }, []);

  // Manejo de búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filtrado por nombre o ciudad
  const filteredGyms = gyms.filter((gym) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (gym.name || "").toLowerCase().includes(term) ||
      (gym.city || "").toLowerCase().includes(term)
    );
  });

  // Eliminar gimnasio (solo admin)
  const handleDelete = async (gymId: number): Promise<void> => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este gimnasio? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    if (!token) {
      toast.error("No estás autenticado para realizar esta acción.");
      return;
    }

    try {
      await deleteGym(gymId, token);
      setGyms((prev) => prev.filter((g) => g.id !== gymId));
      toast.success("Gimnasio eliminado con éxito.");
    } catch (err) {
      const processedErrorMessage = handleApiError(
        err,
        "No se pudo eliminar el gimnasio."
      );
      toast.error(processedErrorMessage);
      if (import.meta.env.DEV) console.error("Error deleting gym:", err);
    }
  };

  // Render loading
  if (isLoading) {
    return (
      <div style={styles.container}>
        <p>Cargando gimnasios...</p>
        {/* TODO: Spinner */}
      </div>
    );
  }

  // Render error
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText || { color: "red" }}>{error}</div>
      </div>
    );
  }

  // Render principal
  return (
    <div style={styles.container}>
      <h2>Gimnasios Asociados</h2>
      <p>Descubre los gimnasios a los que puedes acceder con GymNomads.</p>

      {/* Botón para añadir gimnasio (solo admin) */}
      {user?.role === "admin" && (
        <Link
          to="/gyms/add"
          style={styles.addGymButton}
          aria-label="Añadir gimnasio">
          Añadir Gimnasio
        </Link>
      )}

      <input
        type="text"
        placeholder="Buscar por nombre o ciudad..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={styles.searchInput}
        aria-label="Buscar gimnasios por nombre o ciudad"
      />

      <div style={styles.gymList}>
        {filteredGyms.length === 0 && !isLoading && (
          <p style={styles.noResultsText}>
            No se encontraron gimnasios que coincidan con tu búsqueda.
          </p>
        )}

        {filteredGyms.map((gym) => {
          const logoSrc = gym.logo_url
            ? `${backendBaseUrl}/${
                gym.logo_url.startsWith("/")
                  ? gym.logo_url.substring(1)
                  : gym.logo_url
              }`
            : "/images/gym-logo/default-gym-logo.png";

          return (
            <div
              key={gym.id}
              style={{
                ...styles.gymCard,
                cursor: "pointer", // Mostrar cursor de mano
                transition: "transform 0.2s, box-shadow 0.2s", // Animación suave / smooth animation
              }}
              aria-labelledby={`gym-${gym.id}-name`}
              onClick={() => navigate(`/gyms/${gym.id}`)} // Navegar al hacer click / navigate on click
              onMouseEnter={(e) => {
                // Efecto hover: elevar la tarjeta / hover effect
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                // Volver al estado normal / back normal state
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              role="button" // Accesibilidad / accesibility
              tabIndex={0} // Permitir navegación con teclado / allow keyboard navigation
              onKeyPress={(e) => {
                // Permitir Enter o Space para activar / enter or space to activate
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/gyms/${gym.id}`);
                }
              }}>
              <img
                src={logoSrc}
                alt={`Logo de ${gym.name}`}
                style={styles.gymLogo}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/gym-logo/default-gym-logo.png";
                }}
              />

              <div style={styles.cardBody}>
                <h3 id={`gym-${gym.id}-name`}>{gym.name}</h3>
                <p>
                  {gym.address}
                  <br />
                  {gym.city}
                </p>
              </div>

              {/* Mostrar acciones solo para admin o manager del gym */}
              {(user?.role === "admin" ||
                (user?.role === "manager" && user.home_gym_id === gym.id)) && (
                <div style={styles.cardFooter}>
                  {/* Edit: usa la ruta definida en App.tsx (ajústala si usas otra) */}
                  <button
                    style={styles.button}
                    onClick={(e) => {
                      // Evitar que el click llegue al div padre / Prevent click from reaching parent div
                      e.stopPropagation();
                      navigate(`/gyms/edit/${gym.id}`);
                    }}
                    aria-label={`Editar gimnasio ${gym.name}`}>
                    Editar
                  </button>

                  {/* Delete solo admin */}
                  {user?.role === "admin" && (
                    <button
                      style={styles.deleteButton}
                      // Evitar que el click llegue al div padre / Prevent click from reaching parent div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(gym.id);
                      }}
                      aria-label={`Eliminar gimnasio ${gym.name}`}>
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
