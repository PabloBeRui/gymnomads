import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { VisitWithDetails } from "../interfaces";
import { Avatar, PaginationControls, SortableTable, type ColumnDefinition, Spinner } from "../components/ui";
import { VisitsDetailsModal, VisitsStatsModal } from "../components/modals";
import { FilterInput } from "../components/forms";
import { useVisitsManagement, useMediaQuery } from "../hooks";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import styles from "./VisitsManagementPage.module.scss";
import clsx from "clsx";
import { getGymById } from "../services";

/**
 * =============================================================================
 * COMPONENTE: VisitsManagementPage
 * COMPONENT:  VisitsManagementPage
 * =============================================================================
 *
 * Descripción: Página para la gestión de visitas. Permite a los administradores
 * ver todas las visitas, y a los gerentes ver las visitas recibidas en su
 * gimnasio o las enviadas por sus usuarios.
 * 
 * Refactorizado para usar el hook useVisitsManagement.
 *
 * =============================================================================
 */
export const VisitsManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  // Custom Hook
  const {
    visits,
    gyms,
    isLoading,
    error,
    managerVisitView,
    selectedGymId,
    userSearch,
    gymSearchTerm,
    setManagerVisitView,
    setSelectedGymId,
    setUserSearch,
    setGymSearchTerm,
    pagination: {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      goToPage,
      changeItemsPerPage,
    },
  } = useVisitsManagement();

  // Local UI States
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [managerGymName, setManagerGymName] = useState<string>("");

  // Responsive Hook
  const isLargeScreen = useMediaQuery("(min-width: 768px)");

  // Obtener el nombre del gimnasio si es manager
  // Get gym name if manager
  useEffect(() => {
    if (isManager && user?.home_gym_id) {
      const fetchManagerGym = async () => {
        try {
          const gym = await getGymById(user.home_gym_id);
          setManagerGymName(gym.name);
        } catch (err) {
          console.error("Error fetching manager gym:", err);
        }
      };
      fetchManagerGym();
    }
  }, [isManager, user?.home_gym_id]);

  // Handlers
  const handleRowClick = (visit: VisitWithDetails) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedVisit(null);
  };

  // Table Columns Definition
  const visitColumns: ColumnDefinition<VisitWithDetails>[] = useMemo(() => {
    const baseColumns: ColumnDefinition<VisitWithDetails>[] = [
      {
        key: "user_name",
        header: "Usuario",
        render: (visit) => (
          <div className={styles.avatarCell}>
            <Avatar
              src={visit.user_profile_picture}
              firstName={visit.user_name || "Usuario"}
              size={35}
            />
            <span className="text-dark">
              {isLargeScreen
                ? visit.user_name || "N/A"
                : visit.user_name?.split(" ")[0] || "N/A"}
            </span>
          </div>
        ),
      },
    ];

    if (isManager && managerVisitView === "received") {
      baseColumns.push({
        key: "origin_gym_name",
        header: "Gimnasio de Origen",
        render: (visit: VisitWithDetails) => (
          <div className={styles.avatarCell}>
            <Avatar
              src={visit.origin_gym_logo_url}
              firstName={visit.origin_gym_name || "Gimnasio"}
              size={35}
            />
            <span className="text-dark">{visit.origin_gym_name || "N/A"}</span>
          </div>
        ),
      });
    }

    if (isAdmin || (isManager && managerVisitView === "sent")) {
      baseColumns.push({
        key: isAdmin ? "gym_name" : "destination_gym_name",
        header: isAdmin ? "Gimnasio Visitado" : "Gimnasio de Destino",
        render: (visit: VisitWithDetails) => (
          <div className={styles.avatarCell}>
            <Avatar
              src={
                isAdmin ? visit.gym_logo_url : visit.destination_gym_logo_url
              }
              firstName={
                isAdmin
                  ? visit.gym_name || "Gimnasio"
                  : visit.destination_gym_name || "Gimnasio"
              }
              size={35}
            />
            <div>
              <span
                className={clsx({
                  "text-dark": !visit.is_gym_deleted,
                  [styles.deletedGym]: visit.is_gym_deleted,
                })}
                title={visit.is_gym_deleted ? "Gimnasio Eliminado" : ""}>
                {isAdmin
                  ? visit.gym_name || "N/A"
                  : visit.destination_gym_name || "N/A"}
              </span>
            </div>
          </div>
        ),
      });
    }

    if (isLargeScreen) {
      baseColumns.push({
        key: "visit_date",
        header: "Fecha de Visita",
        render: (visit) =>
          new Date(visit.visit_date).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }),
      });
    }

    return baseColumns;
  }, [isLargeScreen, isAdmin, isManager, managerVisitView]);

  // Render Loading
  if (isLoading && visits.length === 0) {
    return <Spinner center size="lg" className="vh-100" />;
  }

  // Render Error
  if (error && visits.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid="xl" className="py-4">
      <header className="mb-4 text-center">
        <h1 className="h2 text-primary">
          {isAdmin
            ? "Gestión de Visitas"
            : isManager
            ? managerVisitView === "received"
              ? "Visitas Recibidas en mi Gimnasio"
              : "Visitas Enviadas por mis Usuarios"
            : "Visitas a mi Gimnasio"}
        </h1>
        <p className="text-light">
          {isAdmin
            ? "Visualiza y filtra todas las visitas de todos los gimnasios."
            : isManager
            ? managerVisitView === "received"
              ? "Visualiza y filtra las visitas que ha recibido tu gimnasio."
              : "Visualiza y filtra las visitas que tus usuarios han realizado a otros gimnasios."
            : "Visualiza y filtra las visitas a tu gimnasio."}
        </p>
      </header>

      <Card className="mb-4">
        <Card.Header as="h5" className="bg-secondary text-white text-center">
          Filtros y Métricas
        </Card.Header>
        <Card.Body>
          {isManager && (
            <div className="mb-3 d-flex gap-2">
              <Button
                variant={
                  managerVisitView === "received" ? "primary" : "secondary"
                }
                onClick={() => setManagerVisitView("received")}>
                Visitas Recibidas
              </Button>
              <Button
                variant={managerVisitView === "sent" ? "primary" : "secondary"}
                onClick={() => setManagerVisitView("sent")}>
                Visitas Enviadas
              </Button>
            </div>
          )}
          <Row className="align-items-end">
            <Col md={4} lg={3} className="mb-3 text-center">
              <Card
                className={styles.statCard}
                onClick={() => setIsStatsModalOpen(true)}
                title="Ver estadísticas detalladas">
                <Card.Body>
                  <div className="text-dark mb-0 small">
                    {isLoading ? (
                      <Spinner size="sm" />
                    ) : isManager ? (
                      managerVisitView === "received" ? (
                        "Total Recibidas"
                      ) : (
                        "Total Enviadas"
                      )
                    ) : (
                      "Total de Visitas"
                    )}
                  </div>
                  <h2 className="fw-bold text-primary">{totalItems}</h2>{" "}
                </Card.Body>
              </Card>
            </Col>

            {isAdmin && (
              <Col md={8} lg={5} className="mb-3">
                <FilterInput
                  label="Buscar Gimnasio"
                  icon={<i className="bi bi-search"></i>}
                  placeholder="Nombre o ciudad..."
                  value={gymSearchTerm}
                  onChange={(e) => setGymSearchTerm(e.target.value)}
                  onClear={() => setGymSearchTerm("")}
                  id="gymSearchFilter"
                />
                <Form.Select
                  value={selectedGymId}
                  onChange={(e) => setSelectedGymId(e.target.value)}
                  aria-label="Filtrar por gimnasio"
                  className="mt-2">
                  <option value="">A Todos los Gimnasios</option>
                  <option value="deleted" className={styles.deletedOption}>
                    A Gimnasios Eliminados
                  </option>
                  {gyms.map((gym) => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name} - {gym.city}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

            <Col md={4} lg={4} className="mb-3">
              <FilterInput
                label="Buscar por Usuario"
                icon={<i className="bi bi-search"></i>}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onClear={() => setUserSearch("")}
                placeholder="Nombre o email..."
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {visits.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <h5 className="text-dark">
            {userSearch || selectedGymId
              ? "🔍 No se encontraron visitas con los filtros aplicados."
              : "📭 Aún no hay visitas registradas."}
          </h5>
        </div>
      ) : (
        <>
          <SortableTable
            data={visits}
            columns={visitColumns}
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

      <VisitsDetailsModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        visit={selectedVisit}
        viewMode={isAdmin ? "admin" : isManager ? "manager" : "user"}
        visitType={isManager ? managerVisitView : undefined}
      />

      <VisitsStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        viewMode={isAdmin ? "admin" : "manager"}
        gymName={managerGymName}
      />
    </Container>
  );
};