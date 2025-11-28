/**
 * =============================================================================
 * COMPONENTE: ListGymsPage
 * COMPONENT:  ListGymsPage
 * =============================================================================
 *
 * Descripción: Muestra una lista de gimnasios con un orden inicial que depende
 * del rol del usuario. Permite la búsqueda y paginación.
 *
 * Description: Displays a list of gyms with an initial order that depends on
 * the user's role. It allows searching and pagination.
 *
 * Refactorizado para usar el hook `useGymsList` y el componente `GymCard`.
 * Refactored to use the `useGymsList` hook and `GymCard` component.
 *
 * =============================================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteGym, toggleGymSuspension } from "../services"; // Importar servicios de gimnasio / Import gym services
import type { Gym } from "../interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils"; // Importar manejador de errores / Import error handler
import { ConfirmationModal } from "../components/modals/ConfirmationModal"; // Importar modal de confirmación / Import confirmation modal
import { useGymsList } from "../hooks"; // Importar el hook personalizado para la lista de gimnasios / Import custom hook for gym list
import { PaginationControls } from "../components/ui/PaginationControls"; // Importar controles de paginación / Import pagination controls
import { GymCard } from "../components/gyms/GymCard"; // Importar componente de tarjeta de gimnasio / Import gym card component
import { Row, Col, FormControl, Button, Alert } from "react-bootstrap";
import Spinner from "../components/ui/Spinner";
import styles from "./ListGymsPage.module.scss";
import clsx from "clsx";
import { CloseButton } from "../components/ui/CloseButton"; // Importar botón de cierre / Import CloseButton

export const ListGymsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  // Hook personalizado para la lógica de gestión de la lista de gimnasios / Custom hook for gym list management logic
  const {
    gyms,
    isLoading,
    error,
    searchTerm,
    handleSearchChange,
    pagination: {
      currentPage,
      itemsPerPage,
      totalPages,
      goToPage,
      changeItemsPerPage,
    },
    removeGymFromState, // Función para eliminar un gimnasio del estado / Function to remove a gym from state
    updateGymInState, // Función para actualizar un gimnasio en el estado / Function to update a gym in state
  } = useGymsList();

  // Estados de la UI (Modales) / UI States (Modals)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [gymToDelete, setGymToDelete] = useState<Gym | null>(null);

  // Manejadores de navegación (cierre tipo modal) / Navigation Handlers (modal-like close)
  const handleBackdropClick = () => {
    navigate(-1); // Navegar hacia atrás al hacer clic en el fondo / Navigate back on backdrop click
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic en el contenido cierre la página / Prevent click inside content from closing page
  };

  /**
   * =============================================================================
   * MANEJADOR: handleDelete
   * HANDLER: handleDelete
   * =============================================================================
   *
   * Establece el gimnasio a eliminar y muestra el modal de confirmación.
   * Sets the gym to be deleted and shows the confirmation modal.
   *
   * @param gym El gimnasio a eliminar. / The gym to be deleted.
   * =============================================================================
   */
  const handleDelete = (gym: Gym): void => {
    setGymToDelete(gym);
    setShowDeleteModal(true);
  };

  /**
   * =============================================================================
   * MANEJADOR: handleDeleteConfirm
   * HANDLER: handleDeleteConfirm
   * =============================================================================
   *
   * Confirma la eliminación de un gimnasio tras la aprobación del usuario.
   * Confirms gym deletion after user approval.
   *
   * Realiza la llamada a la API y actualiza el estado mediante el hook.
   * Makes the API call and updates the state via the hook.
   *
   * =============================================================================
   */
  const handleDeleteConfirm = async () => {
    if (!gymToDelete || !token) return;

    try {
      await deleteGym(gymToDelete.id, token);
      toast.success(`Gimnasio "${gymToDelete.name}" eliminado con éxito.`);
      removeGymFromState(gymToDelete.id); // Actualización del estado mediante el hook / State update via hook
    } catch (err) {
      const processedErrorMessage = handleApiError(
        err,
        "No se pudo eliminar el gimnasio."
      );
      toast.error(processedErrorMessage);
    } finally {
      setShowDeleteModal(false);
      setGymToDelete(null);
    }
  };

  /**
   * =============================================================================
   * MANEJADOR: handleDeleteCancel
   * HANDLER: handleDeleteCancel
   * =============================================================================
   *
   * Cancela la operación de eliminación y cierra el modal de confirmación.
   * Cancels the delete operation and closes the confirmation modal.
   *
   * =============================================================================
   */
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setGymToDelete(null);
  };

  /**
   * =============================================================================
   * MANEJADOR: handleToggleSuspension
   * HANDLER: handleToggleSuspension
   * =============================================================================
   *
   * Suspende o reactiva un gimnasio.
   * Suspends or reactivates a gym.
   *
   * @param gym El gimnasio a suspender/reactivar. / The gym to suspend/reactivate.
   * =============================================================================
   */
  const handleToggleSuspension = async (gym: Gym) => {
    if (!token) {
      toast.error("No autorizado para realizar esta acción.");
      return;
    }
    const action = gym.is_suspended === 0 ? "suspender" : "reactivar"; // Determina la acción / Determines the action
    try {
      const response = await toggleGymSuspension(gym.id, token);
      toast.success(response.message);
      
      // Actualiza el estado local mediante el hook / Update local state via hook
      const updatedGym = { ...gym, is_suspended: response.is_suspended };
      updateGymInState(updatedGym);

    } catch (err) {
      const processedErrorMessage = handleApiError(
        err,
        `No se pudo ${action} el gimnasio.`
      );
      toast.error(processedErrorMessage);
    }
  };

  // Renderizado del estado de carga / Loading state rendering
  if (isLoading && gyms.length === 0) {
    return (
      <div className={styles.backdrop}> {/* Usar backdrop / Use backdrop */}
        <div className={styles.pageContainer}> {/* Usar pageContainer / Use pageContainer */}
          <div className="text-center p-5">
            <Spinner center size="lg" />
            <p className="mt-3 text-dark">Cargando gimnasios...</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado del estado de error / Error state rendering
  if (error) {
    return (
      <div className={styles.backdrop}> {/* Usar backdrop / Use backdrop */}
        <div className={styles.pageContainer}> {/* Usar pageContainer / Use pageContainer */}
          <div className="text-center mt-5">
            <Alert variant="danger">{error}</Alert>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado principal / Main rendering
  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.pageContainer} onClick={handleContainerClick}>
        <CloseButton
          onClick={handleBackdropClick}
          className={styles.closeButton}
          color="#FFB700"
          ariaLabel="Cerrar página"
        />

        {/* Hero Section */}
        <div className={styles.topSection}>
          <div className={styles.infoCol}>
            <h1 className={styles.title}>Nuestros Gimnasios</h1>
            <p className={styles.subtitle}>
              <strong>Explora la red de gimnasios asociados a GymNomads.</strong>
            </p>
          </div>
          <div className={styles.imageCol}>
            <img
              src="/images/list-gyms-page/list-gyms-page.png"
              alt="Gimnasios GymNomads"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <Row className="justify-content-center mb-5">
            <Col md={8} lg={6} className="mb-3 mb-md-0 me-md-3">
              <div className={styles.searchWrapper}>
                <i
                  className={clsx(
                    `bi bi-search ${styles.searchIcon}`,
                    "text-primary"
                  )}
                ></i>
                <FormControl
                  type="text"
                  placeholder="Buscar por Nombre o Ciudad"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                  className="h-100"
                >
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
                  className="text-center p-5 border-0 shadow-sm"
                >
                  <h4 className="text-muted">No se encontraron resultados</h4>
                  <p className="text-muted">
                    Intenta ajustar los términos de tu búsqueda.
                  </p>
                </Alert>
              </Col>
            ) : (
              gyms.map((gym) => (
                <Col key={gym.id}>
                  <GymCard
                    gym={gym}
                    onDelete={handleDelete}
                    onToggleSuspension={handleToggleSuspension}
                  />
                </Col>
              ))
            )}
          </Row>

          {/* Controles de paginación solo si hay gimnasios para mostrar / Pagination controls only if there are gyms to display */}
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
        </div>
      </div>

      {/* Modal de confirmación para eliminar gimnasio / Confirmation modal for deleting a gym */}
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
