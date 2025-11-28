import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import type { UserWithGym, GymUser } from "../interfaces";
import {
  Avatar,
  PaginationControls,
  SortableTable,
  type ColumnDefinition,
  Spinner,
} from "../components/ui";
import { UserDetailModal } from "../components/modals";
import { FilterInput } from "../components/forms";
import { useUsersManagement, useMediaQuery } from "../hooks";
import { Container, Row, Col, Form, Card, Alert } from "react-bootstrap";
import styles from "./UsersManagementPage.module.scss";
import clsx from "clsx";

/**
 * =============================================================================
 * COMPONENTE: UsersManagementPage
 * COMPONENT:  UsersManagementPage
 * =============================================================================
 *
 * Descripción: Página para la gestión de usuarios. Los administradores pueden
 * ver y filtrar todos los usuarios de la plataforma, mientras que los gerentes
 * solo pueden ver los usuarios de su propio gimnasio.
 *
 * Refactorizado para usar el hook useUsersManagement.
 *
 * =============================================================================
 */
export const UsersManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Custom Hook
  const {
    users,
    gyms,
    isLoading,
    error,
    isDeleting,
    selectedGymId,
    searchTerm,
    gymSearchTerm,
    setSelectedGymId,
    setSearchTerm,
    setGymSearchTerm,
    deleteUser,
    pagination: {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      goToPage,
      changeItemsPerPage,
    },
  } = useUsersManagement();

  // Local UI States
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<
    UserWithGym | GymUser | null
  >(null);

  // Responsive Hook
  const isLargeScreen = useMediaQuery("(min-width: 768px)");

  // Handlers
  const handleRowClick = (user: UserWithGym | GymUser) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (userId: number) => {
    const success = await deleteUser(userId);
    if (success) {
      handleCloseModal();
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Table Columns Definition
  const userColumns: ColumnDefinition<UserWithGym | GymUser>[] = useMemo(() => {
    const columns: ColumnDefinition<UserWithGym | GymUser>[] = [
      {
        key: "first_name",
        header: "Nombre",
        render: (u) => (
          <div className={styles.avatarCell}>
            <Avatar
              src={u.profile_picture}
              firstName={u.first_name}
              lastName={u.last_name}
              size={35}
            />
            <span className="text-dark">
              {isLargeScreen ? `${u.first_name} ${u.last_name}` : u.first_name}
            </span>
          </div>
        ),
      },
    ];

    if (isAdmin) {
      columns.push({
        key: "gym_name" as keyof (UserWithGym | GymUser),
        header: "Gimnasio",
        render: (u: UserWithGym | GymUser) => {
          const userWithGym = u as UserWithGym;
          return (
            <div className={styles.avatarCell}>
              <Avatar
                src={userWithGym.logo_url}
                firstName={userWithGym.gym_name}
                size={35}
              />
              <span
                className={clsx({
                  "text-dark": !userWithGym.is_gym_deleted,
                  [styles.deletedGym]: userWithGym.is_gym_deleted,
                })}
                title={userWithGym.is_gym_deleted ? "Gimnasio Eliminado" : ""}>
                {userWithGym.gym_name}
              </span>
            </div>
          );
        },
      });
    }

    if (isLargeScreen) {
      columns.push({
        key: "registered_at" as keyof (UserWithGym | GymUser),
        header: "Miembro desde",
        render: (u: UserWithGym | GymUser) => formatDate(u.registered_at),
      });
    }

    return columns;
  }, [isLargeScreen, isAdmin]);

  // Render Loading
  if (isLoading && users.length === 0) {
    return <Spinner center size="lg" className="vh-100" />;
  }

  // Render Error
  if (error && users.length === 0) {
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
          {isAdmin ? "Gestión de Usuarios" : "Usuarios de mi Gimnasio"}
        </h1>
        <p className="text-light">
          {isAdmin
            ? "Visualiza y filtra todos los usuarios de la plataforma."
            : "Visualiza y filtra los usuarios registrados en tu gimnasio."}
        </p>
      </header>

      <Card className="mb-4">
        <Card.Header as="h5" className="bg-secondary text-white text-center">
          Filtros y Métricas
        </Card.Header>
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4} lg={3} className="mb-3 text-center">
              <div className="text-dark mb-0 small">
                {isLoading ? <Spinner size="sm" /> : <strong>Total de Usuarios</strong>}
              </div>
              <h2 className="fw-bold text-primary">{totalItems}</h2>
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
                  <option value="">Todos los Usuarios</option>
                  <option value="deleted" className={styles.deletedOption}>
                    Usuarios de Gimnasios Eliminados
                  </option>
                  {gyms.map((gym) => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name} - {gym.city}
                    </option>
                  ))}
                </Form.Select>
                {gymSearchTerm && gyms.length === 0 && (
                  <small className="text-danger mt-1 d-block">
                    No se encontraron gimnasios
                  </small>
                )}
              </Col>
            )}
            <Col md={4} lg={4} className="mb-3">
              <FilterInput
                label="Buscar Usuario"
                icon={<i className="bi bi-search"></i>}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                placeholder="Nombre o email..."
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {users.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <h5 className="text-dark">
            {searchTerm || selectedGymId
              ? "🔍 No se encontraron usuarios con los filtros aplicados."
              : "📭 Aún no hay usuarios registrados."}
          </h5>
        </div>
      ) : (
        <>
          <SortableTable
            data={users}
            columns={userColumns}
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

      <UserDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        user={selectedUser as UserWithGym | null}
        onDelete={handleDeleteUser}
        isDeleting={isDeleting}
      />
    </Container>
  );
};
