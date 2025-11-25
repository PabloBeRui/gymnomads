import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
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

// Importar componentes de React-Bootstrap

import Spinner from "../components/ui/Spinner";

// Importar el módulo SCSS
import styles from "./MyVisitsPage.module.scss";
import { CloseButton } from "../components/ui/CloseButton";
import clsx from "clsx";

export const MyVisitsPage = () => {
  // --- ESTADOS Y HOOKS ---
  const navigate = useNavigate(); // Hook de navegación
  const { token } = useAuth();
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gymSearch, setGymSearch] = useState("");

  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // --- MANEJADORES DE CIERRE DE PÁGINA (Estilo Modal) ---
  const handleBackdropClick = () => {
    navigate(-1); // Navegar hacia atrás al hacer clic en el fondo
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic en el contenido cierre la página
  };

  // --- CARGA DE DATOS ---
  const fetchVisits = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await getMyVisits(token, gymSearch, currentPage, itemsPerPage);
      const validData = Array.isArray(response.data) ? response.data : [];
      setVisits(validData);
      setTotalItems(response.total || 0);
    } catch (error) {
      const msg = handleApiError(error, "Error al cargar tus visitas.");
      toast.error(msg);
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gymSearch, currentPage, itemsPerPage]);

  // --- MANEJADORES ---
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
    goToPage(1);
  };

  const handleClearSearch = () => {
    setGymSearch("");
    goToPage(1);
  };

  // --- COLUMNAS DE LA TABLA ---
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

  // --- RENDERIZADO ---
  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.pageContainer} onClick={handleContainerClick}>
        
        <CloseButton
          onClick={handleBackdropClick}
          className={styles.closeButton}
          color="#FFB700" // Usar color primario (amarillo) para mejor visibilidad y consistencia
          ariaLabel="Cerrar página"
        />

        {/* === SECCIÓN SUPERIOR (Hero + Stats) === */}
        <div className={styles.topSection}>
          
          {/* Columna de Información y Título */}
          <div className={styles.infoCol}>
            <h1 className={styles.title}>Mis Visitas</h1>
            <p className={styles.subtitle}>
              Aquí puedes ver tu historial completo de entrenamientos. Haz clic en cualquier visita para ver los detalles del gimnasio.
            </p>

            {/* Mini Tarjetas de Estadísticas (Acceso rápido al modal) */}
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
               <div 
                 className={clsx(styles.miniStatCard, "d-flex align-items-center justify-content-center")}
                 onClick={() => setIsStatsModalOpen(true)}
                 style={{ backgroundColor: '#194350', borderColor: '#194350' }} // Color secundario
               >
                  <span className="text-white fw-bold small">Ver Gráficos 📊</span>
               </div>
            </div>
          </div>

          {/* Columna de Imagen */}
          <div className={styles.imageCol}>
            <img 
              src="/images/my-visits-page/my-visits-page.png" 
              alt="Mis Visitas Gymnomads" 
              className={styles.heroImage} 
            />
          </div>
        </div>

        {/* === SECCIÓN DE CONTENIDO (Tabla y Filtros) === */}
        <div className={styles.contentSection}>
            
            {/* Barra de Filtros */}
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
            </div>

            {/* Contenido de la Tabla */}
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