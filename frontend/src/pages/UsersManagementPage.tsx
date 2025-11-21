import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getAllUsers,
    getUsersByGym,
    deleteUser,
    type GetAllUsersFilters,
    type GetUsersByGymFilters,
} from "../services/user-services";
import { getAllGyms } from "../services/gym-services";
import type { UserWithGym, GymUser } from "../interfaces/user-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { Avatar } from "../components/Avatar";
import { UserDetailModal } from "../components/modals/UserDetailModal";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../components/ui/PaginationControls";
import { FilterInput } from "../components/forms/FilterInput";
import {
    SortableTable,
    type ColumnDefinition,
} from "../components/ui/SortableTable";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Spinner,
    Alert,
} from "react-bootstrap";
import styles from "./UsersManagementPage.module.scss";

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
 * Description: Page for user management. Administrators can view and filter
 * all users on the platform, while managers can only see the users from
 * their own gym.
 *
 * =============================================================================
 */
export const UsersManagementPage = () => {
    const { user, token } = useAuth();
    const isAdmin = user?.role === "admin";
    const isManager = user?.role === "manager";

    // Estados del componente // Component states
    const [users, setUsers] = useState<(UserWithGym | GymUser)[]>([]);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Hook de paginación // Pagination hook
    const {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        setTotalItems,
        goToPage,
        changeItemsPerPage,
    } = usePagination();

    // Estados de filtros // Filter states
    const [selectedGymId, setSelectedGymId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [gymSearchTerm, setGymSearchTerm] = useState<string>("");

    // Estados para el modal // States for modal
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<UserWithGym | GymUser | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Cargar gimnasios (solo para admin) // Load gyms (admin only)
    useEffect(() => {
        if (!isAdmin || !token) return;

        const fetchGyms = async () => {
            try {
                const gymsData = await getAllGyms(token, { limit: 1000 });
                const validGyms = Array.isArray(gymsData.data) ? gymsData.data : [];
                setGyms(validGyms);
            } catch (err) {
                const msg = handleApiError(err, "Error al cargar gimnasios.");
                toast.error("No se pudieron cargar los gimnasios.");
                setGyms([]);
                if (import.meta.env.DEV) {
                    console.error("Error al cargar gimnasios:", msg);
                }
            }
        };

        fetchGyms();
    }, [isAdmin, token]);

    // Filtrar gimnasios según el término de búsqueda // Filter gyms by search term
    const filteredGyms = gyms.filter(
        (gym) =>
            gym.name.toLowerCase().includes(gymSearchTerm.toLowerCase()) ||
            gym.city.toLowerCase().includes(gymSearchTerm.toLowerCase())
    );

    // Cargar usuarios // Load users
    const fetchUsers = async () => {
        if (!token) {
            setError("No estás autenticado.");
            setIsLoading(false);
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            let response;
            if (isAdmin) {
                const gymIdAsNumber = Number(selectedGymId);
                const filters: GetAllUsersFilters = {
                    search: searchTerm.trim() || undefined,
                    page: currentPage,
                    limit: itemsPerPage,
                };
                if (selectedGymId === "deleted") {
                    filters.gym_status = "deleted";
                } else if (gymIdAsNumber > 0) {
                    filters.gym_id = gymIdAsNumber;
                    filters.gym_status = "active";
                }
                response = await getAllUsers(token, filters);
            } else if (isManager && user?.home_gym_id) {
                const filters: GetUsersByGymFilters = {
                    search: searchTerm.trim() || undefined,
                    page: currentPage,
                    limit: itemsPerPage,
                };
                response = await getUsersByGym(token, user.home_gym_id, filters);
            } else {
                throw new Error("No tienes permisos para ver esta página.");
            }

            const validData = Array.isArray(response.data) ? response.data : [];
            setUsers(validData);
            setTotalItems(response.total || 0);
        } catch (err) {
            const msg = handleApiError(err, "Error al cargar los usuarios.");
            setError(msg);
            toast.error("No se pudieron cargar los usuarios.");
            setUsers([]);
            if (import.meta.env.DEV) {
                console.error("Error al cargar usuarios:", msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto con debounce para cargar usuarios // Debounce effect for loading users
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGymId, searchTerm, currentPage, itemsPerPage]);

    // Formatear fecha para mostrar // Format date for display
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    // --- Lógica del Modal --- // --- Modal Logic ---

    // Abrir modal con datos del usuario // Open modal with user data
    const handleRowClick = (user: UserWithGym | GymUser) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    // Cerrar modal // Close modal
    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedUser(null);
    };

    // Eliminar usuario // Delete user
    const handleDeleteUser = async (userId: number) => {
        if (!token) {
            toast.error("No estás autenticado.");
            return;
        }
        setIsDeleting(true);
        try {
            await deleteUser(token, userId);
            toast.success("Usuario eliminado correctamente.");
            await fetchUsers();
        } catch (err) {
            const msg = handleApiError(err, "Error al eliminar el usuario.");
            toast.error(msg);
        } finally {
            setIsDeleting(false);
            handleCloseModal();
        }
    };

    // Definición de columnas para la tabla // Column definitions for the table
    const userColumns: ColumnDefinition<UserWithGym | GymUser>[] = [
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
                        {u.first_name} {u.last_name}
                    </span>
                </div>
            ),
        },
        ...(isAdmin
            ? [
                {
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
                                <span className="text-dark">
                                    {userWithGym.gym_name}
                                    {userWithGym.is_gym_deleted ? <span className="text-danger ms-1">(Eliminado)</span> : null}
                                </span>
                            </div>
                        );
                    },
                },
            ]
            : [
                {
                    key: "registered_at" as keyof (UserWithGym | GymUser),
                    header: "Fecha de Registro",
                    render: (u: UserWithGym | GymUser) =>
                        formatDate(u.registered_at),
                },
            ]),
    ];

    // Renderizado de estado de carga // Loading state rendering
    if (isLoading && users.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Cargando usuarios...</span>
                </Spinner>
            </div>
        );
    }

    // Renderizado de estado de error // Error state rendering
    if (error && users.length === 0) {
        return (
            <Container className="text-center mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    // Renderizado principal // Main rendering
    return (
        <Container fluid="xl" className="py-4">
            <header className="mb-4 text-center">
                <h1 className="h2 text-primary">
                    {isAdmin ? "Gestión de Usuarios" : "Usuarios de mi Gimnasio"}
                </h1>
                <p className="text-dark">
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
                        {/* Métricas */}
                        <Col md={4} lg={3} className="mb-3 text-center">
                            <p className="text-dark mb-0 small">
                                {isLoading ? "Cargando..." : "Total de Usuarios"}
                            </p>
                            <h2 className="fw-bold text-primary">{totalItems}</h2>
                        </Col>

                        {/* Filtros */}
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
                                    className="mt-2"
                                >
                                    <option value="">Todos los Usuarios</option>
                                    <option value="deleted" className={styles.deletedOption}>
                                        Usuarios de Gimnasios Eliminados
                                    </option>
                                    {filteredGyms.map((gym) => (
                                        <option key={gym.id} value={gym.id}>
                                            {gym.name} - {gym.city}
                                        </option>
                                    ))}
                                </Form.Select>
                                {gymSearchTerm && filteredGyms.length === 0 && (
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
