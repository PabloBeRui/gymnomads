import { useState, useEffect } from "react";
import { getAllGyms, deleteGym } from "../services/gym-services";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { ConfirmationModal } from "../components/modals/ConfirmationModal";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../components/ui/PaginationControls";

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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
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
  noResultsText: { color: "#666", fontStyle: "italic", width: '100%', textAlign: 'center', padding: '40px 0' },
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

  // Hook de paginación / Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination();

  // Estados para modal de eliminación / States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [gymToDelete, setGymToDelete] = useState<Gym | null>(null);

  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  useEffect(() => {
    const fetchGyms = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const filters = {
          search: searchTerm.trim() || undefined,
          page: currentPage,
          limit: itemsPerPage,
        };
        // El token es ahora opcional en el servicio
        // The token is now optional in the service
        const response = await getAllGyms(token || undefined, filters);
        
        // Validar que la respuesta contiene un array de datos
        // Validate that the response contains a data array
        const validData = Array.isArray(response.data) ? response.data : [];
        setGyms(validData);
        setTotalItems(response.total || 0);
      } catch (err) {
        const msg = handleApiError(
          err,
          "Hubo un problema al cargar los gimnasios."
        );
        setError(msg);
        toast.error(msg);
        // Asegurar que gyms siempre sea un array en caso de error
        // Ensure gyms is always an array in case of an error
        setGyms([]);
        if (import.meta.env.DEV) console.error("Error fetching gyms:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchGyms, 500);
    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, searchTerm, token, setTotalItems]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    goToPage(1); // Resetear a la primera página con cada nueva búsqueda
  };

  const handleDelete = (gym: Gym): void => {
    setGymToDelete(gym);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gymToDelete || !token) return;

    try {
      await deleteGym(gymToDelete.id, token);
      // Refrescar la lista actual
      const filters = {
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage,
      };
      const response = await getAllGyms(token, filters);
      setGyms(response.data);
      setTotalItems(response.total);
      
      toast.success(`Gimnasio "${gymToDelete.name}" eliminado con éxito.`);
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

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setGymToDelete(null);
  };

  if (isLoading && gyms.length === 0) {
    return (
      <div style={styles.container}>
        <p>Cargando gimnasios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText || { color: "red" }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Gimnasios Asociados</h2>
      <p>Descubre los gimnasios a los que puedes acceder con GymNomads.</p>

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
        {gyms.length === 0 && !isLoading && (
          <p style={styles.noResultsText}>
            No se encontraron gimnasios que coincidan con tu búsqueda.
          </p>
        )}

        {gyms.map((gym) => {
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
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              aria-labelledby={`gym-${gym.id}-name`}
              onClick={() => navigate(`/gyms/${gym.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/gyms/${gym.id}`);
                }
              }}>
              <div>
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
              </div>

              {(user?.role === "admin" ||
                (user?.role === "manager" && user.home_gym_id === gym.id)) && (
                <div style={styles.cardFooter}>
                  <button
                    style={styles.button}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/gyms/edit/${gym.id}`);
                    }}
                    aria-label={`Editar gimnasio ${gym.name}`}>
                    Editar
                  </button>
                  {user?.role === "admin" && (
                    <button
                      style={styles.deleteButton}
                      onClick={(e) => {
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

      {gyms.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={changeItemsPerPage}
        />
      )}

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
