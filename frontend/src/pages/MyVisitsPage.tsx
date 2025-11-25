/**
 * =============================================================================
 * COMPONENTE: MyVisitsPage
 * COMPONENT: MyVisitsPage
 * =============================================================================
 *
 * Descripción: Página para mostrar el historial de visitas de un usuario.
 * Presenta una lista paginada y filtrable de visitas, estadísticas rápidas
 * y permite ver detalles de cada visita. Diseño moderno con cabecera Hero.
 *
 * Description: Page to display a user's visit history.
 * Presents a paginated and filterable list of visits, quick statistics,
 * and allows viewing details of each visit. Modern design with Hero header.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// Importar componentes de UI
// Import UI components
import Spinner from "../components/ui/Spinner";
import { CloseButton } from "../components/ui/CloseButton";

// Importar estilos y utilidades
// Import styles and utilities
import styles from "./MyVisitsPage.module.scss";
import clsx from "clsx";

export const MyVisitsPage = () => {
  // =============================================================================
  // Estados y Hooks
  // States and Hooks
  // =============================================================================

  // Hook de navegación para cerrar la página
  // Navigation hook to close the page
  const navigate = useNavigate();

  // Obtener token del contexto de autenticación
  // Get token from authentication context
  const { token } = useAuth();

  // Estado para almacenar la lista de visitas
  // State to store the list of visits
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  
  // Estado de carga inicial
  // Initial loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para el término de búsqueda (filtro)
  // State for search term (filter)
  const [gymSearch, setGymSearch] = useState("");

  // Hook personalizado de paginación
  // Custom pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination();

  // Estados para modales (Detalles y Estadísticas)
  // States for modals (Details and Statistics)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // =============================================================================
  // Manejadores de Navegación (Cierre tipo Modal)
  // Navigation Handlers (Modal-like Close)
  // =============================================================================

  // Navegar hacia atrás al hacer clic en el fondo (backdrop)
  // Navigate back when clicking on the background (backdrop)
  const handleBackdropClick = () => {
    navigate(-1);
  };

  // Evitar que el clic dentro del contenedor cierre la página
  // Prevent click inside the container from closing the page
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // =============================================================================
  // Efectos y Carga de Datos
  // Effects and Data Loading
  // =============================================================================

  const fetchVisits = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Llamada a la API con paginación y filtros
      // API call with pagination and filters
      const response = await getMyVisits(token, gymSearch, currentPage, itemsPerPage);
      const validData = Array.isArray(response.data) ? response.data : [];
      setVisits(validData);
      setTotalItems(response.total || 0);
    } catch (error) {
      // Manejo centralizado de errores
      // Centralized error handling
      const msg = handleApiError(error, "Error al cargar tus visitas.");
      toast.error(msg);
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambian los filtros o la paginación (con debounce)
  // Effect to load data when filters or pagination change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gymSearch, currentPage, itemsPerPage]);

  // =============================================================================
  // Manejadores de Eventos
  // Event Handlers
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
    goToPage(1); // Resetear a la primera página al buscar
  };

  const handleClearSearch = () => {
    setGymSearch("");
    goToPage(1);
  };

  // =============================================================================
  // Configuración de Columnas
  // Columns Configuration
  // =============================================================================

  const myVisitsColumns: ColumnDefinition<VisitWithDetails>[] = [
    {
      key: "gym_name",
      header: "Gimnasio",
      render: (visit) => (
        <div className="d-flex align-items-center gap-3">
          <Avatar
            src={visit.gym_logo_url}
            firstName={visit.gym_name || "Gimnasio"}
            lastName=""
            size={40}
          />
          <div className="d-flex flex-column">
            <span className="fw-bold text-dark">
                {visit.gym_name || "N/A"}
            </span>
            {visit.is_gym_deleted && (
                <span className="badge bg-danger text-white" style={{ fontSize: '0.7rem', width: 'fit-content' }}>Eliminado</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "visit_date",
      header: "Fecha",
      render: (visit) =>
        new Date(visit.visit_date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
    },
  ];

  // =============================================================================
  // Renderizado
  // Rendering
  // =============================================================================

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

        {/* === SECCIÓN SUPERIOR (Hero + Stats) === */}
        {/* === TOP SECTION (Hero + Stats) === */}
        <div className={styles.topSection}>
          
          {/* Columna de Información y Título */}
          {/* Information and Title Column */}
          <div className={styles.infoCol}>
            <h1 className={styles.title}>Mis Visitas</h1>
            <p className={styles.subtitle}>
              Aquí puedes ver tu historial completo de entrenamientos. Haz clic en cualquier visita para ver los detalles del gimnasio.
            </p>

            {/* Mini Tarjetas de Estadísticas (Acceso rápido al modal) */}
            {/* Mini Stats Cards (Quick access to modal) */}
            <div className={styles.miniStatsGrid}>
               <div 
                 className={styles.miniStatCard}
                 onClick={() => setIsStatsModalOpen(true)}
                 role="button"
                 title="Ver estadísticas detalladas"
               >
                 <div className={styles.miniStatNumber}>
                    {isLoading ? <Spinner size="sm" /> : totalItems}
                 </div>
                 <p className={styles.miniStatLabel}>Total Visitas</p>
               </div>
               
               {/* Botón decorativo/funcional para ver más detalles */}
               {/* Decorative/functional button to view more details */}
               <div 
                 className={clsx(styles.miniStatCard, "d-flex align-items-center justify-content-center")}
                 onClick={() => setIsStatsModalOpen(true)}
                 style={{ backgroundColor: '#194350', borderColor: '#194350' }} // Color secundario / Secondary color
               >
                  <span className="text-white fw-bold small">Ver Gráficos 📊</span>
               </div>
            </div>
          </div>

          {/* Columna de Imagen */}
          {/* Image Column */}
          <div className={styles.imageCol}>
            <img 
              src="/images/my-visits-page/my-visits-page.png" 
              alt="Mis Visitas Gymnomads" 
              className={styles.heroImage} 
            />
          </div>
        </div>

        {/* === SECCIÓN DE CONTENIDO (Tabla y Filtros) === */}
        {/* === CONTENT SECTION (Table and Filters) === */}
        <div className={styles.contentSection}>
            
            {/* Barra de Filtros */}
            {/* Filter Bar */}
            <div className={styles.filtersBar}>
                <div className={styles.filterInputWrapper}>
                    <FilterInput
                        label="Buscar"
                        value={gymSearch}
                        onChange={handleSearchChange}
                        onClear={handleClearSearch}
                        placeholder="Buscar por nombre de gimnasio..."
                        icon={<span>🔍</span>}
                    />
                </div>
                {/* Aquí se podrían añadir más filtros (fechas, etc.) en el futuro */}
                {/* More filters (dates, etc.) could be added here in the future */}
            </div>

            {/* Contenido de la Tabla */}
            {/* Table Content */}
            {isLoading && visits.length === 0 ? (
                <div className={styles.loadingContainer}>
                    <Spinner center size="lg" />
                </div>
            ) : !isLoading && visits.length === 0 ? (
                 gymSearch ? (
                    <div className={styles.emptyState}>
                        <h3>No se encontraron resultados</h3>
                        <p>No hay visitas que coincidan con "{gymSearch}".</p>
                    </div>
                 ) : (
                    <div className={styles.emptyState}>
                        <h3>Aún no has realizado visitas</h3>
                        <p>¡Empieza a entrenar en nuestra red de gimnasios!</p>
                    </div>
                 )
            ) : (
                <>
                    <SortableTable
                        data={visits}
                        columns={myVisitsColumns}
                        initialSortConfig={{ key: "visit_date", direction: "descending" }}
                        onRowClick={handleRowClick}
                    />
                    <div className="mt-4">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            onPageChange={goToPage}
                            onItemsPerPageChange={changeItemsPerPage}
                        />
                    </div>
                </>
            )}
        </div>

      </div>

      {/* === MODALES === */}
      {/* === MODALS === */}
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
    </div>
  );
};
