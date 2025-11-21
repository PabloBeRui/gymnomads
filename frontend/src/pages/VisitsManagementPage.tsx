import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getAllVisits,
    getManagerGymVisits,
    getManagerOutgoingVisits,
} from "../services/visit-services";
import { getAllGyms } from "../services/gym-services";
import type {
    VisitWithDetails,
    VisitsFilters,
} from "../interfaces/visit-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { Avatar } from "../components/Avatar";
import { VisitsDetailsModal } from "../components/modals/VisitsDetailsModal";
import { VisitsStatsModal } from "../components/modals/VisitsStatsModal";
import { usePagination } from "../hooks/usePagination";
import { useMediaQuery } from "../hooks/useMediaQuery";
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

import styles from "./VisitsManagementPage.module.scss";

/**
 * =============================================================================
 * COMPONENTE: VisitsManagementPage
 * COMPONENT:  VisitsManagementPage
 * =============================================================================
 *
 * Descripción: Página para la gestión de visitas. Permite a los administradores
 * ver todas las visitas, y a los gerentes ver las visitas recibidas en su
 * gimnasio o las enviadas por sus usuarios. Incluye filtros, paginación y
 * estadísticas.
 *
 * Description: Page for managing visits. It allows administrators to view all
 * visits, and managers to view visits received at their gym or those sent by
 * their users. It includes filters, pagination, and statistics.
 *
 * =============================================================================
 */
export const VisitsManagementPage = () => {
    const { user, token } = useAuth();
    const isAdmin = user?.role === "admin";
    const isManager = user?.role === "manager";

    // Estados del componente // Component states
    const [visits, setVisits] = useState<VisitWithDetails[]>([]);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [managerVisitView, setManagerVisitView] = useState<"received" | "sent">(
        "received"
    );

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
    const [userSearch, setUserSearch] = useState<string>("");
    const [gymSearchTerm, setGymSearchTerm] = useState<string>("");

    // Estados para el modal de detalles // States for details modal
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(
        null
    );
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    // Hook para responsividad / Hook for responsiveness
    const isLargeScreen = useMediaQuery("(min-width: 768px)");

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

    const filteredGyms = gyms.filter(
        (gym) =>
            gym.name.toLowerCase().includes(gymSearchTerm.toLowerCase()) ||
            gym.city.toLowerCase().includes(gymSearchTerm.toLowerCase())
    );

    // Cargar visitas // Load visits
    const fetchVisits = async () => {
        if (!token) {
            setError("No estás autenticado.");
            setIsLoading(false);
            return;
        }

        setError(null);
        setIsLoading(true);
        try {
            let response;
            const baseFilters: VisitsFilters = {
                page: currentPage,
                limit: itemsPerPage,
                user_search: userSearch.trim() || undefined,
            };

            if (isAdmin) {
                const gymIdAsNumber = Number(selectedGymId);
                const adminFilters: VisitsFilters = { ...baseFilters };

                if (selectedGymId === "deleted") {
                    adminFilters.gym_status = "deleted";
                } else if (gymIdAsNumber > 0) {
                    adminFilters.gym_id = gymIdAsNumber;
                    adminFilters.gym_status = "active";
                }
                response = await getAllVisits(token, adminFilters);
            } else if (isManager) {
                if (managerVisitView === "received") {
                    response = await getManagerGymVisits(token, baseFilters);
                } else {
                    response = await getManagerOutgoingVisits(token, baseFilters);
                }
            } else {
                throw new Error("No tienes permisos para ver esta página.");
            }

            const validVisits = Array.isArray(response.data) ? response.data : [];
            setVisits(validVisits);
            setTotalItems(response.total || 0);
        } catch (err) {
            const msg = handleApiError(err, "Error al cargar las visitas.");
            setError(msg);
            toast.error("No se pudieron cargar las visitas.");
            setVisits([]);
            if (import.meta.env.DEV) {
                console.error("Error al cargar visitas:", msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para debounce en la búsqueda // Effect for search debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchVisits();
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGymId, userSearch, currentPage, itemsPerPage, managerVisitView]);

    // Maneja el clic en una fila de la tabla // Handles a click on a table row
    const handleRowClick = (visit: VisitWithDetails) => {
        setSelectedVisit(visit);
        setShowDetailModal(true);
    };

    // Cierra el modal de detalles // Closes the details modal
    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedVisit(null);
    };

    // Definición de columnas para la tabla // Column definitions for the table
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
                            {isLargeScreen ? visit.user_name || "N/A" : (visit.user_name?.split(' ')[0] || "N/A")}
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
                key: "destination_gym_name",
                header: isAdmin ? "Gimnasio Visitado" : "Gimnasio de Destino",
                render: (visit: VisitWithDetails) => (
                    <div className={styles.avatarCell}>
                        <Avatar
                            src={isAdmin ? visit.gym_logo_url : visit.destination_gym_logo_url}
                            firstName={isAdmin ? visit.gym_name || "Gimnasio" : visit.destination_gym_name || "Gimnasio"}
                            size={35}
                        />
                        <span className="text-dark">
                            {isAdmin ? visit.gym_name || "N/A" : visit.destination_gym_name || "N/A"}
                            {visit.is_gym_deleted ? <span className="text-danger ms-1">(Eliminado)</span> : null}
                        </span>
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

    // Muestra el spinner mientras carga y no hay datos // Shows spinner while loading and there is no data
    if (isLoading && visits.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Cargando visitas...</span>
                </Spinner>
            </div>
        );
    }

    // Muestra el error si no hay datos // Shows error if there is no data
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
                <p className="text-dark">
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
                                variant={managerVisitView === 'received' ? 'primary' : 'secondary'}
                                onClick={() => setManagerVisitView("received")}
                            >
                                Visitas Recibidas
                            </Button>
                            <Button
                                variant={managerVisitView === 'sent' ? 'primary' : 'secondary'}
                                onClick={() => setManagerVisitView("sent")}
                            >
                                Visitas Enviadas
                            </Button>
                        </div>
                    )}
                    <Row className="align-items-end">
                        <Col md={4} lg={3} className="mb-3 text-center">
                            <Card
                                className={styles.statCard}
                                onClick={() => setIsStatsModalOpen(true)}
                                title="Ver estadísticas detalladas"
                            >
                                <Card.Body>
                                    <p className="text-dark mb-0 small">
                                        {isLoading
                                            ? "Cargando..."
                                            : isManager
                                                ? managerVisitView === "received"
                                                    ? "Total Recibidas"
                                                    : "Total Enviadas"
                                                : "Total de Visitas"}
                                    </p>
                                    <h2 className="fw-bold text-primary">{totalItems}</h2>
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
                                    className="mt-2"
                                >
                                    <option value="">A Todos los Gimnasios</option>
                                    <option value="deleted" className={styles.deletedOption}>
                                        A Gimnasios Eliminados
                                    </option>
                                    {filteredGyms.map((gym) => (
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
            />
        </Container>
    );
};
