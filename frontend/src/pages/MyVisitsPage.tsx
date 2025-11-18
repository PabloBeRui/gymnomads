/**
 * =============================================================================
 * PÁGINA: MyVisitsPage
 * =============================================================================
 *
 * Página para mostrar las visitas de un usuario.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Page to display user visits.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyVisits } from "../services/visit-services";
import type { VisitWithDetails } from "../interfaces/visit-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { VisitsDetailsModal } from "../components/modals/VisitsDetailsModal";
import { Avatar } from "../components/Avatar";
import { VisitsStatsModal } from "../components/modals/VisitsStatsModal";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../components/ui/PaginationControls";
import { FilterInput } from "../components/forms/FilterInput";
import {
  SortableTable,
  type ColumnDefinition,
} from "../components/ui/SortableTable";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./MyVisitsPage.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
    COMPONENTE: MyVisitsPage
    COMPONENT: MyVisitsPage
    ============================================================================= */
export const MyVisitsPage = () => {
  // =============================================================================
  // Estados y Hooks
  // States and Hooks
  // =============================================================================

  // Obtener token de autenticación del contexto
  // Get authentication token from context
  const { token } = useAuth();

  // Estado para almacenar la lista de visitas
  // State to store the list of visits
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);

  // Estado para controlar la carga de datos
  // State to control data loading
  const [isLoading, setIsLoading] = useState(true);

  // Estado para el término de búsqueda de gimnasios
  // State for the gym search term
  const [gymSearch, setGymSearch] = useState("");

  // Hook personalizado para gestionar la lógica de paginación
  // Custom hook to manage pagination logic
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination();

  // Estado para controlar la visibilidad del modal de detalles
  // State to control the visibility of the details modal
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Estado para almacenar la visita seleccionada para el modal
  // State to store the selected visit for the modal
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(
    null
  );

  // Estado para controlar la visibilidad del modal de estadísticas
  // State to control the visibility of the statistics modal
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // =============================================================================
  // Carga de Datos
  // Data Loading
  // =============================================================================

  // Función para obtener las visitas desde el backend
  // Function to fetch visits from the backend
  const fetchVisits = async () => {
    if (!token) {
      // Si no hay token, no hacer nada y asegurar que el estado de carga es falso.
      // If there is no token, do nothing and ensure the loading state is false.
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Llamar al servicio con filtros de búsqueda y paginación
      // Call the service with search and pagination filters
      const response = await getMyVisits(
        token,
        gymSearch,
        currentPage,
        itemsPerPage
      );
      // Validar que la respuesta contiene un array de datos
      // Validate that the response contains a data array
      const validData = Array.isArray(response.data) ? response.data : [];
      setVisits(validData);
      setTotalItems(response.total || 0);
    } catch (error) {
      // Manejar errores de la API y mostrar notificación
      // Handle API errors and show notification
      const msg = handleApiError(error, "Error al cargar tus visitas.");
      toast.error(msg);
      // Asegurar que visits siempre sea un array en caso de error
      // Ensure visits is always an array in case of an error
      setVisits([]);
    } finally {
      // Finalizar el estado de carga
      // Finalize the loading state
      setIsLoading(false);
    }
  };

  // Efecto para cargar las visitas cuando cambian los filtros o la paginación
  // Effect to load visits when filters or pagination change
  useEffect(() => {
    // Usar un debounce para evitar peticiones excesivas al escribir
    // Use a debounce to avoid excessive requests while typing
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500); // 500ms de espera / 500ms wait

    // Limpiar el timeout si el efecto se vuelve a ejecutar
    // Clear the timeout if the effect runs again
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gymSearch, currentPage, itemsPerPage]);

  // =============================================================================
  // Manejadores de Eventos y Definiciones de Columnas
  // Event Handlers and Column Definitions
  // =============================================================================

  const handleRowClick = (visit: VisitWithDetails) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedVisit(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGymSearch(e.target.value);
    goToPage(1); // Resetear a la primera página con cada nueva búsqueda
  };

  const myVisitsColumns: ColumnDefinition<VisitWithDetails>[] = [
    {
      key: "gym_name",
      header: "Gimnasio",
      render: (visit) => (
        <div className="d-flex align-items-center gap-2">
          <Avatar
            src={visit.gym_logo_url}
            firstName={visit.gym_name || "Gimnasio"}
            lastName=""
            size={35}
          />
          <span>
            {visit.gym_name || "N/A"}
            {visit.is_gym_deleted === true && " (Eliminado)"}
          </span>
        </div>
      ),
    },
    {
      key: "visit_date",
      header: "Fecha",
      render: (visit) =>
        new Date(visit.visit_date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }),
    },
  ];

  // =============================================================================
  // Renderizado Condicional
  // Conditional Rendering
  // =============================================================================

  if (isLoading && visits.length === 0) {
    return (
      <Container className={clsx(styles.loading, "text-center mt-5")}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando tus visitas...</span>
        </Spinner>
      </Container>
    );
  }

  // =============================================================================
  // Renderizado Principal
  // Main Rendering
  // =============================================================================
  return (
    <Container className={styles.container}>
      <h1 className={styles.title}>Mis Visitas</h1>

      {/* Tarjeta de estadísticas que abre un modal */}
      {/* Statistics card that opens a modal */}
      <Row className={clsx(styles.statsContainer, "mb-4")}>
        <Col xs={12} md={6} lg={4}>
          <Card
            className={styles.statCard}
            onClick={() => setIsStatsModalOpen(true)}
            title="Ver estadísticas detalladas"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsStatsModalOpen(true);
              }
            }}>
            <Card.Body>
              <Card.Title className={styles.statNumber}>{totalItems}</Card.Title>
              <Card.Text className={styles.statLabel}>
                {isLoading && visits.length === 0
                  ? "Cargando..."
                  : "Total de Visitas"}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtro de búsqueda */}
      {/* Search filter */}
      <div className={clsx(styles.filtersContainer, "mb-4")}>
        <FilterInput
          label="Buscar Visitas por Gimnasio"
          value={gymSearch}
          onChange={handleSearchChange}
          placeholder="🔍 Buscar por nombre de gimnasio..."
        />
      </div>

      {/* Indicador de carga durante la búsqueda */}
      {/* Loading indicator during search */}
      {isLoading && <p className="text-center text-muted">Buscando...</p>}

      {/* Estado vacío o sin resultados */}
      {/* Empty state or no results */}
      {!isLoading && visits.length === 0 ? (
        gymSearch ? (
          <Alert variant="info" className={styles.empty}>
            No se encontraron visitas para "{gymSearch}".
          </Alert>
        ) : (
          <Alert variant="info" className={styles.empty}>
            Aún no has visitado ningún gimnasio.
          </Alert>
        )
      ) : (
        <>
          <SortableTable
            data={visits}
            columns={myVisitsColumns}
            initialSortConfig={{ key: "visit_date", direction: "descending" }}
            onRowClick={handleRowClick}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            onItemsPerPageChange={changeItemsPerPage}
          />
        </>
      )}

      {/* Modales */}
      {/* Modals */}
      <VisitsDetailsModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        visit={selectedVisit}
        viewMode="user"
      />
      <VisitsStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        viewMode="user"
      />
    </Container>
  );
};
