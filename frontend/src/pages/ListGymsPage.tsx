/**
 * =============================================================================
 * COMPONENTE: ListGymsPage
 * COMPONENT:  ListGymsPage
 * =============================================================================
 *
 * Descripción: Muestra una lista de gimnasios con un orden inicial que depende
 * del rol del usuario. Permite la búsqueda y paginación.
 * - Admin: ve los gimnasios ordenados alfabéticamente con paginación de backend.
 * - Manager: ve su gimnasio primero, y el resto de forma aleatoria.
 * - User/Guest: ve los gimnasios en un orden aleatorio.
 *
 * Description: Displays a list of gyms with an initial order that depends on
 * the user's role. It allows searching and pagination.
 * - Admin: sees gyms sorted alphabetically with backend pagination.
 * - Manager: sees their own gym first, with the rest in random order.
 * - User/Guest: sees gyms in a random order.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { getAllGyms, deleteGym, toggleGymSuspension } from "../services/gym-services";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { ConfirmationModal } from "../components/modals/ConfirmationModal";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../components/ui/PaginationControls";
import { sortGymsByRole } from "../utils/gym-sorter";
import {
  Row,
  Col,
  FormControl,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import Spinner from "../components/ui/Spinner";
import styles from "./ListGymsPage.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx
import { CloseButton } from "../components/ui/CloseButton"; // Importar CloseButton

export const ListGymsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  // Estados del componente // Component states
  const [gyms, setGyms] = useState<Gym[]>([]); // Gimnasios para la página actual // Gyms for the current page
  const [unpaginatedGyms, setUnpaginatedGyms] = useState<Gym[]>([]); // Lista completa para no-admins // Full list for non-admins
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Hook de paginación // Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination({ initialItemsPerPage: 6 });

  // Estados para modal de eliminación y suspensión // States for delete and suspend modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [gymToDelete, setGymToDelete] = useState<Gym | null>(null);

  // URL base del backend para las imágenes // Backend base URL for images
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  // Manejadores de navegación para cerrar la página (estilo modal)
  // Navigation handlers to close the page (modal style)
  const handleBackdropClick = () => {
    navigate(-1); // Navegar hacia atrás al hacer clic en el fondo // Navigate back on backdrop click
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic en el contenido cierre la página // Prevent click inside content from closing page
  };

  // Efecto para obtener los datos de los gimnasios (ADMIN) - Paginación en servidor
  // Effect to fetch gym data (ADMIN) - Server-side pagination
  useEffect(() => {
    if (!isAdmin) return;

    const fetchAdminGyms = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const commonFilters = { search: searchTerm.trim() || undefined };
        const adminFilters = {
          ...commonFilters,
          page: currentPage,
          limit: itemsPerPage,
          orderBy: "name_asc" as const,
        };
        const response = await getAllGyms(token ?? undefined, adminFilters);
        setGyms(response.data);
        setTotalItems(response.total);
      } catch (err) {
        const msg = handleApiError(
          err,
          "Hubo un problema al cargar los gimnasios."
        );
        setError(msg);
        toast.error(msg);
        setGyms([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchAdminGyms, 500);
    return () => clearTimeout(timeoutId);
  }, [isAdmin, token, searchTerm, currentPage, itemsPerPage, setTotalItems]); // Dependencias estáticas

  // Efecto para obtener los datos de los gimnasios (USER/GUEST) - Carga todo y paginación en cliente
  // Effect to fetch gym data (USER/GUEST) - Fetch all and client-side pagination
  useEffect(() => {
    if (isAdmin) return;

    const fetchUserGyms = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const commonFilters = { search: searchTerm.trim() || undefined };
        const userFilters = { ...commonFilters, limit: 1000 }; // Límite alto / High limit
        const response = await getAllGyms(token ?? undefined, userFilters);
        const sortedGyms = sortGymsByRole(response.data, user);
        setUnpaginatedGyms(sortedGyms);
        setTotalItems(sortedGyms.length);
      } catch (err) {
        const msg = handleApiError(
          err,
          "Hubo un problema al cargar los gimnasios."
        );
        setError(msg);
        toast.error(msg);
        setGyms([]);
        setUnpaginatedGyms([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchUserGyms, 500);
    return () => clearTimeout(timeoutId);
  }, [isAdmin, token, searchTerm, user, setTotalItems]); // Dependencias estáticas

  // Efecto para manejar la paginación en el frontend para no-admins
  // Effect to handle frontend pagination for non-admins
  useEffect(() => {
    if (!isAdmin) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setGyms(unpaginatedGyms.slice(startIndex, endIndex));
    }
  }, [currentPage, itemsPerPage, unpaginatedGyms, isAdmin]);

  // Manejador de cambio en el campo de búsqueda // Search input change handler
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    goToPage(1); // Resetear a la primera página con cada nueva búsqueda // Reset to first page with each new search
  };

  // Abre el modal de confirmación para eliminar un gimnasio // Opens confirmation modal for gym deletion
  const handleDelete = (gym: Gym): void => {
    setGymToDelete(gym);
    setShowDeleteModal(true);
  };

  // Confirma la eliminación del gimnasio // Confirms gym deletion
  const handleDeleteConfirm = async () => {
    if (!gymToDelete || !token) return;

    try {
      await deleteGym(gymToDelete.id, token);
      toast.success(`Gimnasio "${gymToDelete.name}" eliminado con éxito.`);
      setShowDeleteModal(false);
      setGymToDelete(null);
      // Recargar la lista para reflejar los cambios
      // Reload the list to reflect changes
      const commonFilters = { search: searchTerm.trim() || undefined };
      let response;
      if (isAdmin) {
        const adminFilters = {
          ...commonFilters,
          page: currentPage,
          limit: itemsPerPage,
          orderBy: "name_asc" as const,
        };
        response = await getAllGyms(token ?? undefined, adminFilters);
        setGyms(response.data);
        setTotalItems(response.total);
      } else {
        const userFilters = { ...commonFilters, limit: 1000 };
        response = await getAllGyms(token ?? undefined, userFilters);
        const sortedGyms = sortGymsByRole(response.data, user);
        setUnpaginatedGyms(sortedGyms);
        setTotalItems(sortedGyms.length);
      }
    } catch (err) {
      const processedErrorMessage = handleApiError(
        err,
        "No se pudo eliminar el gimnasio."
      );
      toast.error(processedErrorMessage);
      if (import.meta.env.DEV) console.error("Error deleting gym:", err);
    }
  };

  // Cancela la eliminación del gimnasio // Cancels gym deletion
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setGymToDelete(null);
  };
  
  // Manejador para suspender/reactivar un gimnasio // Handler to suspend/reactivate a gym
  const handleToggleSuspension = async (gymId: number, currentStatus: number) => {
    if (!token) {
      toast.error("No autorizado para realizar esta acción.");
      return;
    }
    const action = currentStatus === 0 ? "suspender" : "reactivar"; // 'suspender' o 'reactivar' // 'suspend' or 'reactivate'
    try {
      const response = await toggleGymSuspension(gymId, token);
      toast.success(response.message);

      // Actualización optimista de la UI // Optimistic UI update
      setGyms((prevGyms) =>
        prevGyms.map((gym) =>
          gym.id === gymId ? { ...gym, is_suspended: response.is_suspended } : gym
        )
      );
      // Si no es admin, actualiza también la lista sin paginar // If not admin, update unpaginated list too
      if (!isAdmin) {
        setUnpaginatedGyms((prevUnpaginated) =>
          prevUnpaginated.map((gym) =>
            gym.id === gymId ? { ...gym, is_suspended: response.is_suspended } : gym
          )
        );
      }
    } catch (err) {
      const processedErrorMessage = handleApiError(
        err,
        `No se pudo ${action} el gimnasio.`
      );
      toast.error(processedErrorMessage);
      if (import.meta.env.DEV) console.error("Error toggling suspension:", err);
    }
  };


  // Renderizado del estado de carga // Loading state rendering
  if (isLoading && gyms.length === 0) {
    return (
      <div className={styles.backdrop}> {/* Usar backdrop */}
        <div className={styles.pageContainer}> {/* Usar pageContainer */}
          <div className="text-center p-5">
            <Spinner center size="lg" />
            <p className="mt-3 text-dark">Cargando gimnasios...</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado del estado de error // Error state rendering
  if (error) {
    return (
      <div className={styles.backdrop}> {/* Usar backdrop */}
        <div className={styles.pageContainer}> {/* Usar pageContainer */}
          <div className="text-center mt-5">
            <Alert variant="danger">{error}</Alert>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado principal // Main rendering
  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.pageContainer} onClick={handleContainerClick}>
        {/* Botón de cierre (visible solo en desktop) */}
        {/* Close button (visible only on desktop) */}
        <CloseButton
          onClick={handleBackdropClick}
          className={styles.closeButton}
          color="#FFB700" // Color primario para mejor visibilidad
          ariaLabel="Cerrar página"
        />

        {/* === SECCIÓN SUPERIOR (Hero: Título y Subtítulo + Imagen) === */}
        {/* === TOP SECTION (Hero: Title and Subtitle + Image) === */}
        <div className={styles.topSection}>
          {/* Columna de Información (Título y Subtítulo) */}
          {/* Information Column (Title and Subtitle) */}
          <div className={styles.infoCol}>
            <h1 className={styles.title}>Nuestros Gimnasios</h1>
            <p className={styles.subtitle}>
              Explora la red de gimnasios asociados a GymNomads.
            </p>
          </div>

          {/* Columna de Imagen */}
          {/* Image Column */}
          <div className={styles.imageCol}>
            <img
              src="/images/list-gyms-page/list-gyms-page.png"
              alt="Gimnasios GymNomads"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* === SECCIÓN DE CONTENIDO (Buscador, Tarjetas de Gimnasios y Paginación) === */}
        {/* === CONTENT SECTION (Search Bar, Gym Cards, and Pagination) === */}
        <div className={styles.contentSection}>

      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6} className="mb-3 mb-md-0 me-md-3">
          <div className={styles.searchWrapper}>
            <i
              className={clsx(
                `bi bi-search ${styles.searchIcon}`,
                "text-primary"
              )}>
            </i>
            <FormControl
              type="text"
              placeholder="Buscar por Nombre o Ciudad"
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
              aria-label="Buscar gimnasios"
            />
          </div>
        </Col>
        {isAdmin && (
          <Col xs="auto" className="d-flex align-items-center">
            <Button
              variant="primary"
              onClick={() => navigate("/gyms/add")}
              className="h-100">
              <i className="bi bi-plus-lg me-2 text-dark"></i>Añadir Gimnasio
            </Button>
          </Col>
        )}
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4 mb-4">
        {gyms.length === 0 && !isLoading ? (
          <Col className="w-100">
            <Alert
              variant="light"
              className="text-center p-5 border-0 shadow-sm">
              <h4 className="text-muted">No se encontraron resultados</h4>
              <p className="text-muted">
                Intenta ajustar los términos de tu búsqueda.
              </p>
            </Alert>
          </Col>
        ) : (
          gyms.map((gym) => {
            const gymImageSrc = gym.main_image_url
              ? `${backendBaseUrl}/${gym.main_image_url.replace(/\\/g, "/")}`
              : "/images/gym-image/default-gym-image.jpg";

            const logoSrc = gym.logo_url
              ? `${backendBaseUrl}/${gym.logo_url.replace(/\\/g, "/")}`
              : "/images/gym-logo/default-gym-logo.png";

            return (
              <Col key={gym.id}>
                <Card
                  className={clsx(
                    "h-100 shadow-sm border-0",
                    styles.gymCard,
                    { [styles.suspendedGym]: gym.is_suspended === 1 } // Clase condicional para gimnasios suspendidos
                  )}
                  onClick={() => navigate(`/gyms/${gym.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/gyms/${gym.id}`);
                    }
                  }}>
                  <div className={styles.cardImageWrapper}>
                    <Card.Img
                      variant="top"
                      src={gymImageSrc}
                      alt={`Imagen de ${gym.name}`}
                      className={styles.gymImage}
                    />
                    <div className={styles.cardOverlay}>
                      <h5 className="text-primary fw-bold">{gym.name}</h5>
                    </div>
                  </div>
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column">
                      <Card.Text className="small text-dark">
                        <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                        <strong>{gym.city}</strong>
                      </Card.Text>
                    </div>
                    <div>
                      <img
                        src={logoSrc}
                        alt={`Logo de ${gym.name}`}
                        className={styles.cardBodyLogo}
                      />
                    </div>
                  </Card.Body>
                  {(user?.role === "admin" ||
                    (user?.role === "manager" &&
                      user.home_gym_id === gym.id)) && (
                    <Card.Footer className="bg-white border-top-0">
                      <div className="d-flex justify-content-end align-items-center gap-2">
                        <Button
                          variant="outline-info"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/gyms/edit/${gym.id}`);
                          }}>
                          <i className="bi bi-pencil-fill me-2"></i>Editar
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(gym);
                              }}>
                              <i className="bi bi-trash-fill me-2"></i>Borrar
                            </Button>
                            <Button
                              variant={
                                gym.is_suspended === 1
                                  ? "outline-success" // Si está suspendido, botón verde para reactivar
                                  : "outline-warning" // Si está activo, botón amarillo para suspender
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSuspension(gym.id, gym.is_suspended);
                              }}>
                              <i
                                className={clsx("bi me-2", {
                                  "bi-play-circle-fill": gym.is_suspended === 1, // Icono de play si está suspendido
                                  "bi-pause-circle-fill": gym.is_suspended === 0, // Icono de pausa si está activo
                                })}
                              ></i>
                              {gym.is_suspended === 1 ? "Reactivar" : "Suspender"}
                            </Button>
                          </>
                        )}
                      </div>
                    </Card.Footer>
                  )}
                </Card>
              </Col>
            );
          })
        )}
      </Row>

      {/* Controles de paginación solo si hay gimnasios para mostrar */}
      {/* Pagination controls only if there are gyms to display */}
      {gyms.length > 0 && totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={changeItemsPerPage}
          />
        </div>
      )}

        </div> {/* Cierre de contentSection */}
      </div>

      {/* Modal de confirmación para eliminar gimnasio */}
      {/* Confirmation modal for deleting a gym */}
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