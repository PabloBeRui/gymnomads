/**
 * =============================================================================
 * COMPONENTE: UserVisitGymPage
 * COMPONENT:  UserVisitGymPage
 * =============================================================================
 *
 * Descripción: Muestra la confirmación de una visita a un gimnasio. Presenta
 * los detalles de la visita y un código QR único para el acceso. Esta página
 * es a la que se redirige al usuario tras registrar una visita con éxito.
 *
 * Description: Displays the confirmation of a gym visit. It presents the
 * visit details and a unique QR code for access. This is the page the user is
 * redirected to after successfully registering a visit.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeComponent } from "../components/QRCodeComponent";
import { handleApiError } from "../utils/error-handler";
import { toast } from "sonner";
import { Container, Row, Col, Alert, Button, Card, Spinner, Collapse } from "react-bootstrap";
import { CloseButton } from "../components/ui/CloseButton"; // Importar CloseButton
import styles from "./UserVisitGymPage.module.scss"; // Importar estilos
import clsx from "clsx";


// =============================================================================
// INTERFACES
// =============================================================================
/**
 * @interface VisitDetails
 * @description Define la estructura de los datos de detalle de una visita.
 * @description Defines the structure for the detailed data of a visit.
 * @property {number} id - El ID único de la visita. / The unique ID of the visit.
 * @property {string} gym_name - Nombre del gimnasio visitado. / Name of the visited gym.
 * @property {string} gym_address - Dirección del gimnasio. / Address of the gym.
 * @property {string} visit_date - Fecha y hora de la visita (ISO string). / Date and time of the visit (ISO string).
 * @property {string} user_name - Nombre del usuario que realiza la visita. / Name of the user making the visit.
 */
interface VisitDetails {
    id: number;
    gym_name: string;
    gym_address: string;
    visit_date: string;
    user_name: string;
}

// =============================================================================
// COMPONENTE: UserVisitGymPage
// COMPONENT:  UserVisitGymPage
// =============================================================================
export const UserVisitGymPage = () => {
    // Obtener el ID de la visita desde los parámetros de la URL // Get the visit ID from URL parameters
    const { visitId } = useParams<{ visitId: string }>();
    const navigate = useNavigate();

    // Estados del componente // Component states
    const [visitDetails, setVisitDetails] = useState<VisitDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false); // Estado para el desplegable / State for collapse

    // Cargar detalles de la visita al montar // Load visit details on mount
    useEffect(() => {
        const fetchVisitDetails = async () => {
            if (!visitId) {
                setError("ID de visita no proporcionado.");
                setIsLoading(false);
                return;
            }

            setError(null);
            setIsLoading(true);

            try {
                // TODO: Reemplazar con llamada real al backend cuando el endpoint esté listo
                // TODO: Replace with a real backend call when the endpoint is ready
                // const data = await getVisitById(Number(visitId), token);

                // Datos mock temporales para demostración // Temporary mock data for demonstration
                await new Promise((resolve) => setTimeout(resolve, 500)); // Simular carga / Simulate loading

                const mockData: VisitDetails = {
                    id: Number(visitId),
                    gym_name: "Gimnasio Forja de Titanes",
                    gym_address: "Avenida del Músculo, 42, Metrópolis",
                    visit_date: new Date().toISOString(),
                    user_name: "Alex "
                };

                setVisitDetails(mockData);
            } catch (err) {
                const msg = handleApiError(
                    err,
                    "No se pudieron cargar los detalles de la visita."
                );
                setError(msg);
                toast.error(msg);
                if (import.meta.env.DEV) console.error("Error fetching visit:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVisitDetails();
    }, [visitId]);

    // Formatear fecha para mostrar // Format date for display
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Renderizado de estado de carga // Loading state rendering
    if (isLoading) {
        return (
            <Container className="text-center p-5">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Cargando detalles...</span>
                </Spinner>
                <p className="mt-3 text-dark">Cargando detalles de la visita...</p>
            </Container>
        );
    }

    // Renderizado de estado de error // Error state rendering
    if (error || !visitDetails) {
        return (
            <Container className="text-center p-5">
                <Alert variant="danger">
                    {error || "No se encontraron detalles para esta visita."}
                </Alert>
                <Button variant="primary" onClick={() => navigate("/gyms")} className="mt-3">
                    Volver a Gimnasios
                </Button>
            </Container>
        );
    }

    // Generar datos para el QR // Generate QR data
    const qrData = JSON.stringify({
        visitId: visitDetails.id,
        timestamp: new Date().toISOString(),
    });

    // Renderizado principal del componente // Main component rendering
    return (
        <Container fluid="sm" className="py-3 py-md-4">
            <Row className="justify-content-center">
                <Col md={10} lg={8} className={styles.relativeCol}>
                    {/* CloseButton posicionado absolutamente */}
                    <CloseButton
                        onClick={() => navigate("/gyms")}
                        className={styles.pageCloseButton}
                        color="#FFB700"
                        ariaLabel="Volver a la lista de gimnasios"
                    />

                    <header className="text-center">
                        {/* Se eliminó el título h1 y el párrafo según instrucciones previas */}
                    </header>

                    <Alert className={clsx("text-center mb-2", styles.customSuccessAlert)}>
                        <h4>✓ ¡Visita Confirmada!</h4> <p>Tu acceso al gimnasio está listo.</p>
                    </Alert>

                    {/* 2. Código QR (Reordenado: Segundo - Central) */}
                    {/* 2. QR Code (Reordered: Second - Central) */}
                    <Card className="text-center mb-4 border-0 shadow-lg" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                        <Card.Header className="bg-primary text-white py-3">
                            <h2 className="h4 mb-0 fw-bold">Tu Pase de Acceso</h2>
                        </Card.Header>
                        <Card.Body className="p-4 bg-white">
                            <div className="d-flex justify-content-center">
                                <QRCodeComponent
                                    logoUrl="/images/gymnomads/logo/gymnomads-logo.png"
                                    data={qrData}
                                    size={280}
                                    altText={`Código QR de acceso para visita #${visitDetails.id}`}
                                />
                            </div>
                            <p className="text-muted mt-3 mb-0 small">Escanea este código en la entrada</p>
                        </Card.Body>
                    </Card>

                    {/* 1. Instrucciones (Reordenado: Ahora Tercero) */}
                    {/* 1. Instructions (Reordered: Now Third) */}
                    <Alert variant="warning" className="mb-4 border-0 shadow-sm">
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-info-circle-fill me-2 fs-4 text-primary"></i>
                            <Alert.Heading as="h4" className={clsx("h6 mb-0", "text-primary")}>Instrucciones de Acceso</Alert.Heading>
                        </div>
                        <ul className="mb-0 ps-3">
                            <li className="text-dark mb-1">Presenta este código QR en la recepción del gimnasio.</li>
                            <li className="text-dark mb-1">El código es de un solo uso y válido para hoy.</li>
                        </ul>
                    </Alert>

                    {/* 3. Detalles de la Visita (Reordenado: Cuarto - Desplegable) */}
                    {/* 3. Visit Details (Reordered: Fourth - Collapsible) */}
                    <Card className="mb-4 border-0 shadow-sm bg-light">
                        <Card.Header 
                            className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3" 
                            role="button" 
                            onClick={() => setShowDetails(!showDetails)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center">
                                <i className="bi bi-receipt me-2 text-primary"></i>
                                <h3 className={clsx("h6 mb-0", "text-primary")}>Detalles del Ticket</h3>
                            </div>
                            <i className={`bi bi-chevron-${showDetails ? 'up' : 'down'} text-muted`}></i>
                        </Card.Header>
                        <Collapse in={showDetails}>
                            <div>
                                <Card.Body className="pt-0 border-top">
                                    <Row className="mt-3">
                                        <Col sm={6} className="mb-2">
                                            <p className="mb-1 small text-muted">Gimnasio</p>
                                            <p className="fw-bold text-dark">{visitDetails.gym_name}</p>
                                        </Col>
                                        <Col sm={6} className="mb-2">
                                            <p className="mb-1 small text-muted">Fecha</p>
                                            <p className="fw-bold text-dark">{formatDate(visitDetails.visit_date)}</p>
                                        </Col>
                                        <Col xs={12} className="mb-2">
                                            <p className="mb-1 small text-muted">Dirección</p>
                                            <p className="text-dark">{visitDetails.gym_address}</p>
                                        </Col>
                                        <Col xs={12}>
                                            <p className="mb-0 small text-muted">ID de Referencia: <span className="font-monospace text-dark">#{visitDetails.id}</span></p>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </div>
                        </Collapse>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
