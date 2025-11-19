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
import { Container, Row, Col, Alert, Button, Card, Spinner } from "react-bootstrap";
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
        <Container fluid="sm" className="py-4 py-md-5">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <header className="text-center mb-4">
                        <h1 className="h2 text-primary">¡Visita Confirmada!</h1>
                        <p className="lead text-dark">Tu acceso al gimnasio está listo.</p>
                    </header>

                    <Alert variant="success" className="text-center">
                        <strong>✓ Visita registrada correctamente</strong>
                    </Alert>

                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title as="h3" className={clsx("h5 mb-3", "text-primary")}>Detalles de la Visita</Card.Title>
                            <p><strong className="text-dark">Gimnasio:</strong> {visitDetails.gym_name}</p>
                            <p><strong className="text-dark">Dirección:</strong> {visitDetails.gym_address}</p>
                            <p><strong className="text-dark">Fecha de visita:</strong> {formatDate(visitDetails.visit_date)}</p>
                            <p className="mb-0"><strong className="text-dark">ID de visita:</strong> #{visitDetails.id}</p>
                        </Card.Body>
                    </Card>

                    <Card className="text-center mb-4">
                        <Card.Body>
                            <Card.Title as="h2" className={clsx("h4", "text-primary")}>Código de Acceso</Card.Title>
                            <QRCodeComponent
                                logoUrl="/images/gymnomads/logo/gymnomads-logo.png"
                                data={qrData}
                                size={250}
                                altText={`Código QR de acceso para visita #${visitDetails.id}`}
                            />
                        </Card.Body>
                    </Card>

                    <Alert variant="warning">
                        <Alert.Heading as="h4" className={clsx("h6", "text-primary")}>📱 Instrucciones</Alert.Heading>
                        <ul className="mb-0">
                            <li className="text-dark">Presenta este código QR en la recepción del gimnasio.</li>
                            <li className="text-dark">El código es de un solo uso y válido para hoy.</li>
                            <li className="text-dark">Puedes hacer una captura de pantalla si lo necesitas.</li>
                        </ul>
                    </Alert>

                    <div className="d-grid mt-4">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate("/gyms")}
                            aria-label="Volver a la lista de gimnasios"
                        >
                            Volver a Gimnasios
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
