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
import { ConfirmationModal } from "../components/modals/ConfirmationModal";

/* =============================================================================
   ESTILOS (inline)
   STYLES (inline)
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
   COMPONENT: ListGymsPage
   ============================================================================= */
export const ListGymsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Estados del componente / Component states
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Estados para modal de eliminación / States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [gymToDelete, setGymToDelete] = useState<Gym | null>(null);

  // Fallback para backendBaseUrl
  // Fallback for backendBaseUrl
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  // Cargar gimnasios al montar / Load gyms on mount
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

  // Manejo de búsqueda / Search handling
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filtrado por nombre o ciudad / Filter by name or city
  const filteredGyms = gyms.filter((gym) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (gym.name || "").toLowerCase().includes(term) ||
      (gym.city || "").toLowerCase().includes(term)
    );
  });

  // Abrir modal de confirmación de eliminación / Open delete confirmation modal
  const handleDelete = (gym: Gym): void => {
    setGymToDelete(gym);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación de gimnasio / Confirm gym deletion
  const handleDeleteConfirm = async () => {
    if (!gymToDelete || !token) return;

    try {
      await deleteGym(gymToDelete.id, token);
      setGyms((prev) => prev.filter((g) => g.id !== gymToDelete.id));
      toast.success(`Gimnasio "${gymToDelete.name}" eliminado con éxito.`);

      // Cerrar modal
      // Close modal
      setShowDeleteModal(false);
      setGymToDelete(null);
    } catch (err) {
      const processedErrorMessage = handleApiError(
        err,
        "No se pudo eliminar el gimnasio."
      );
      toast.error(processedErrorMessage);
      if (import.meta.env.DEV) console.error("Error deleting gym:", err);
    }
  };

  // Cancelar eliminación de gimnasio / Cancel gym deletion
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setGymToDelete(null);
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

  // Render principal / Main render
  return (
    <div style={styles.container}>
      <h2>Gimnasios Asociados</h2>
      <p>Descubre los gimnasios a los que puedes acceder con GymNomads.</p>

      {/* Botón para añadir gimnasio (solo admin) / Add gym button (admin only) */}
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
                cursor: "pointer", // Mostrar cursor de mano / Show hand cursor
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
              role="button" // Accesibilidad / accessibility
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
              {/* Show actions only for admin or gym manager */}
              {(user?.role === "admin" ||
                (user?.role === "manager" && user.home_gym_id === gym.id)) && (
                <div style={styles.cardFooter}>
                  {/* Botón Editar / Edit button */}
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

                  {/* Botón Eliminar (solo admin) / Delete button (admin only) */}
                  {user?.role === "admin" && (
                    <button
                      style={styles.deleteButton}
                      onClick={(e) => {
                        // Evitar que el click llegue al div padre / Prevent click from reaching parent div
                        e.stopPropagation();
                        handleDelete(gym);
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

      {/* Modal de confirmación de eliminación / Delete confirmation modal */}
      <ConfirmationModal
        isOpen={showDeleteModal && gymToDelete !== null}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="⚠️ Eliminar Gimnasio"
        message={
          gymToDelete
            ? `¿Estás seguro de que quieres eliminar el gimnasio "${gymToDelete.name}" ubicado en ${gymToDelete.city}?`
            : ""
        }
        warningMessage="⚠️ ATENCIÓN: Al eliminar este gimnasio se eliminará el manager asociado y todos los usuarios de este gimnasio."
        note="Esta acción NO se puede deshacer."
        confirmText="Eliminar Gimnasio"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};
