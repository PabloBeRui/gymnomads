/**
 * =============================================================================
 * PÁGINA: ManagersManagementPage
 * =============================================================================
 *
 * Muestra una lista de managers con un orden inicial que depende del rol del
 * usuario. Permite la búsqueda y paginación.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Displays a list of managers with an initial order that depends on the user's
 * role. Allows searching and pagination.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllManagers, updateManager } from "../services/user-services";
import type {
  ManagerWithGym,
  UpdateManagerData,
} from "../interfaces/user-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { ManagerDetailsModal } from "../components/modals/ManagerDetailsModal";
import { Avatar } from "../components/Avatar";
import { usePagination } from "../hooks/usePagination";
import { useMediaQuery } from "../hooks/useMediaQuery"; // Importar el nuevo hook
import { PaginationControls } from "../components/ui/PaginationControls";
import { FilterInput } from "../components/forms/FilterInput";
import {
  SortableTable,
  type ColumnDefinition,
} from "../components/ui/SortableTable";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import Spinner from "../components/ui/Spinner";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./ManagersManagementPage.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
   COMPONENTE: ManagersManagementPage
   COMPONENT: ManagersManagementPage
   ============================================================================= */
export const ManagersManagementPage = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";

  // Estados del componente / Component states
  const [managers, setManagers] = useState<ManagerWithGym[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hook de paginación / Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination();

  // Estado de filtro único / Single filter state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Estados para modal de detalles / States for details modal
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedManager, setSelectedManager] = useState<ManagerWithGym | null>(
    null
  );

  // Hook para responsividad / Hook for responsiveness
  const isLargeScreen = useMediaQuery("(min-width: 768px)");

  // Cargar managers / Load managers
  const fetchManagers = async () => {
    if (!isAdmin) {
      setError("No tienes permisos para ver esta página.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const filters = {
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage,
      };
      const response = await getAllManagers(token!, filters);
      // Validar que la respuesta contiene un array de datos
      // Validate that the response contains a data array
      const validData = Array.isArray(response.data) ? response.data : [];
      setManagers(validData);
      setTotalItems(response.total || 0);
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar los managers.");
      setError(msg);
      toast.error("No se pudieron cargar los managers.");
      // Asegurar que managers siempre sea un array en caso de error
      // Ensure managers is always an array in case of an error
      setManagers([]);
      if (import.meta.env.DEV) {
        console.error("Error al cargar managers:", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto con debounce para cargar managers cuando cambie el filtro
  // Effect with debounce to load managers when filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchManagers();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentPage, itemsPerPage]);

  // Manejar click en fila para ver detalles / Handle row click to view details
  const handleRowClick = (manager: ManagerWithGym) => {
    setSelectedManager(manager);
    setShowDetailsModal(true);
  };

  // Manejar guardado de cambios en manager / Handle manager changes save
  const handleSaveManager = async (
    managerId: number,
    updatedData: UpdateManagerData
  ) => {
    if (!token) {
      toast.error("No estás autenticado.");
      return;
    }

    try {
      const response = await updateManager(token, managerId, updatedData);
      toast.success(response.message || "Manager actualizado correctamente.");
      setManagers((prev) =>
        prev.map((m) => (m.id === managerId ? response.user : m))
      );
      setSelectedManager(response.user);
      if (import.meta.env.DEV) {
        console.log("Manager actualizado:", response.user);
      }
    } catch (err) {
      const msg = handleApiError(err, "Error al actualizar el manager.");
      toast.error(msg);
      if (import.meta.env.DEV) {
        console.error("Error actualizando manager:", msg);
      }
      throw err;
    }
  };

  // Cerrar modal de detalles / Close details modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedManager(null);
  };

  // --- Definición de columnas para la tabla ---
  // --- Column definitions for the table ---
  const managerColumns: ColumnDefinition<ManagerWithGym>[] = useMemo(() => {
    const columns: ColumnDefinition<ManagerWithGym>[] = [
      {
        key: "first_name",
        header: "Manager",
        render: (manager) => (
          <div className="d-flex align-items-center gap-2">
            <Avatar
              src={manager.profile_picture}
              firstName={manager.first_name}
              lastName={manager.last_name}
              size={35}
            />
            <span>
              {isLargeScreen
                ? `${manager.first_name} ${manager.last_name}`
                : manager.first_name}
            </span>
          </div>
        ),
      },
      {
        key: "gym_name",
        header: "Gimnasio",
        render: (manager) => (
          <div className="d-flex align-items-center gap-2">
            <Avatar
              src={manager.logo_url}
              firstName={manager.gym_name}
              lastName=""
              size={35}
            />
            <span>{manager.gym_name}</span>
          </div>
        ),
      },
    ];

    if (isLargeScreen) {
      columns.push({
        key: "gym_city",
        header: "Ciudad",
        render: (manager) => <span>{manager.gym_city}</span>,
      });
    }

    return columns;
  }, [isLargeScreen]);

  // Render loading
  if (isLoading && managers.length === 0) {
    return (
      <Container className={clsx(styles.loadingContainer, "text-center mt-5")}>
        <Spinner center size="lg" />
      </Container>
    );
  }

  // Render error
  if (error && managers.length === 0) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Render principal / Main render
  return (
    <Container fluid="xl" className="py-4">
      {/* Encabezado / Header */}
      <div className="mb-4 text-center">
        <h1 className="h2 text-primary">Gestión de Managers</h1>
        <p className="text-light">
          Visualiza, edita y filtra todos los gerentes registrados en la
          plataforma.
        </p>
      </div>

      <Card className="mb-4">
        <Card.Header as="h5" className="bg-secondary text-white text-center">
          Filtros y Métricas
        </Card.Header>
        <Card.Body>
          <Row className="align-items-end">
            {/* Métricas */}
            <Col md={4} lg={3} className="mb-3 text-center">
              <div className="text-dark mb-0 small">
                {isLoading ? <Spinner size="sm" /> : "Total de Managers"}
              </div>
              <h2 className="fw-bold text-primary mb-1">{totalItems}</h2>
            </Col>

            {/* Filtro */}
            <Col md={8} lg={9} className="mb-3">
              <FilterInput
                label="Buscar Manager"
                icon={<i className="bi bi-search"></i>}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                placeholder="Manager, Gimnasio, Ciudad..."
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Advertencia sobre eliminación / Warning about deletion */}
      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        Haz click en una fila para ver y editar detalles (incluido email y
        teléfono). Los managers no se pueden eliminar directamente.
      </Alert>

      {/* Tabla de managers / Managers table */}
      {managers.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          {searchTerm ? (
            <p className="text-dark">
              🔍 No se encontraron managers con el criterio de búsqueda.
            </p>
          ) : (
            <p className="text-dark">📭 Aún no hay managers registrados.</p>
          )}
        </div>
      ) : (
        <>
          <SortableTable
            data={managers}
            columns={managerColumns}
            initialSortConfig={{ key: "first_name", direction: "ascending" }}
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

      <ManagerDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        manager={selectedManager}
        onSave={handleSaveManager}
      />
    </Container>
  );
};
