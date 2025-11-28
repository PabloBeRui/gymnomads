/**
 * =============================================================================
 * PÁGINA: GymPage
 * PAGE:     GymPage
 * =============================================================================
 *
 * Página para mostrar los detalles de un gimnasio específico.
 * Muestra información del gimnasio, mapa (OSM), widget de tiempo (Open-Meteo)
 * y permite a los usuarios (role='user') registrar una visita.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Page to display details of a specific gym.
 * Shows gym info, map (OSM), weather widget (Open-Meteo), and allows
 * users (role='user') to register a visit.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGymById, createVisit, getVisitsStats } from "../services";
import { useAuth } from "../context/AuthContext";
import type { Gym, VisitStats } from "../interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils";
// modal de confirmación / confirmation modal
import { ConfirmationModal } from "../components/modals/ConfirmationModal";
import { CloseButton } from "../components/ui/CloseButton"; // Importar el botón de cierre

// Importar el WeatherWidget --- / -Import the WeatherWidget ---
import { WeatherWidget } from "../components/widgets/WeatherWidget";

// --- Componente de Mapa / Map Component ---
import { GymMap } from "../components/widgets/GymMap";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Button, Alert, Col, Card, Row } from "react-bootstrap";
import Spinner from "../components/ui/Spinner";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./GymPage.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx

/* =============================================================================
    COMPONENTE: GymPage
    COMPONENT: GymPage
    ============================================================================= */
export const GymPage = () => {
  // Obtener el ID del gimnasio desde los parámetros de la URL
  // Get the gym ID from URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Estados del componente / Component states
  const [gym, setGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  // Estado para las estadísticas de visitas del usuario
  // State for user's visit statistics
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  
  // Estado para la animación del botón de visita
  // State for the visit button animation
  const [animateVisit, setAnimateVisit] = useState(false);
  const [isIconRunning, setIsIconRunning] = useState(false); // Nuevo estado para alternar el icono // New state to toggle icon

  // Fallback para backendBaseUrl
  // Fallback for backendBaseUrl
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  // Efecto para activar la animación del botón al cargar
  // Effect to trigger button animation on load
  useEffect(() => {
    // Activamos la animación general
    setAnimateVisit(true);

    // Intervalo para alternar el icono (simular correr)
    // Interval to toggle icon (simulate running)
    const iconInterval = setInterval(() => {
      setIsIconRunning((prev) => !prev);
    }, 200); // Cambia cada 200ms // Changes every 200ms

    // Temporizador para finalizar la animación
    // Timer to end animation
    const timer = setTimeout(() => {
      setAnimateVisit(false);
      setIsIconRunning(false); // Asegurar que termine en estado "caminando" // Ensure it ends in "walking" state
      clearInterval(iconInterval);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(iconInterval);
    };
  }, []);

  // Cargar datos del gimnasio al montar
  // Load gym data on mount
  useEffect(() => {
    const fetchGymAndStats = async () => {
      // Validar que el ID existe
      // Validate that ID exists
      if (!id) {
        setError("ID de gimnasio no proporcionado.");
        setIsLoading(false);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        // Obtener datos del gimnasio
        // Get gym data
        const gymData = await getGymById(Number(id));
        setGym(gymData);

        // Si el usuario es de tipo 'user', obtener sus estadísticas de visita
        // If the user is of type 'user', get their visit statistics
        if (token && user?.role === "user") {
          const stats = await getVisitsStats(token);
          setVisitStats(stats);
        }
      } catch (err) {
        const msg = handleApiError(
          err,
          "Hubo un problema al cargar los datos."
        );
        setError(msg);
        toast.error(msg);
        if (import.meta.env.DEV) console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGymAndStats();
  }, [id, token, user]);

  // --- Manejar la confirmación y registro de visita ---
  // --- Handle visit confirmation and registration ---

  // PASO 1: Abrir el modal de confirmación, comprobando el límite de visitas
  // STEP 1: Open confirmation modal, checking visit limit
  const handleVisitClick = () => {
    // Comprobar si el usuario ha alcanzado el límite de visitas mensuales
    // Check if the user has reached the monthly visit limit
    if ((visitStats?.thisMonth ?? 0) >= 10) {
      toast.error(
        "Has alcanzado el límite de 10 visitas a otros gimnasios este mes."
      );
      return;
    }
    setShowConfirmModal(true);
  };

  // PASO 2: Cancelar la visita (cierra el modal)
  // STEP 2: Cancel the visit (closes modal)
  const handleCancelVisit = () => {
    setShowConfirmModal(false);
  };

  // PASO 3: Confirmar la visita (lógica de API)
  // STEP 3: Confirm the visit (API logic)
  const handleConfirmVisit = async () => {
    // Validar autenticación
    // Validate authentication
    if (!token || !gym) {
      toast.error("No estás autenticado para realizar esta acción.");
      return;
    }

    setIsProcessing(true);
    setShowConfirmModal(false); // Cerrar modal al confirmar

    try {
      // Crear la visita en el backend
      // Create the visit in the backend
      const response = await createVisit(gym.id, token);

      toast.success(response.message || "Visita registrada con éxito.");

      // Navegar a la página del QR, usando el visitId de la respuesta
      // Navigate to QR page, using visitId from response
      navigate(`/visits/${response.visitId}/qr`);
    } catch (err) {
      const msg = handleApiError(err, "No se pudo registrar la visita.");
      toast.error(msg);
      if (import.meta.env.DEV) console.error("Error creating visit:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render loading
  if (isLoading) {
    return (
      <Container className={clsx(styles.loadingContainer, "text-center mt-5")}>
        <Spinner center size="lg" />
      </Container>
    );
  }

  // Render error
  if (error || !gym) {
    return (
      <Container className={styles.container}>
        <Alert variant="danger">{error || "No se encontró el gimnasio."}</Alert>
        <Button onClick={() => navigate("/gyms")} variant="primary">
          Volver a la lista
        </Button>
      </Container>
    );
  }

  // Construcción de URLs de imágenes con fallbacks
  // Building image URLs with fallbacks
  const logoSrc = gym.logo_url
    ? `${backendBaseUrl}/${
        gym.logo_url.startsWith("/") ? gym.logo_url.substring(1) : gym.logo_url
      }`
    : "/images/gym-logo/default-gym-logo.png";

  const mainImageSrc = gym.main_image_url
    ? `${backendBaseUrl}/${
        gym.main_image_url.startsWith("/")
          ? gym.main_image_url.substring(1)
          : gym.main_image_url
      }`
    : "/images/gym-image/default-gym-image.jpg";

  // Condición para mostrar el botón de visita
  // Condition to show the visit button
  const canVisit =
    user &&
    user.role === "user" &&
    gym &&
    user.home_gym_id !== gym.id &&
    user.home_gym_city?.toLowerCase() !== gym.city?.toLowerCase();

  // Render principal
  return (
    <div className={styles.pageWrapper} onClick={() => navigate("/gyms")}>
      <Container
        fluid="md"
        className={`${styles.contentContainer} py-4`}
        onClick={(e) => e.stopPropagation()}>
        <Row className="justify-content-center">
          <Col lg={11}>
            {/* --- CABECERA MÓVIL (Nombre y Logo) --- */}
            {/* --- MOBILE HEADER (Name and Logo) --- */}
            <Row className={clsx("d-md-none", styles.mobileHeaderRow, "justify-content-between align-items-center mb-3 gx-0")}>
              <Col xs="auto" className="d-flex align-items-center">
                <h1 className={clsx(styles.mobileGymTitle, "me-2")}>{gym.name}</h1>
              </Col>
              <Col xs="auto">
                <img
                  src={logoSrc}
                  alt={`Logo de ${gym.name}`}
                  className={styles.gymLogoSmall}
                />
              </Col>
            </Row>

            {/* --- WIDGET DEL TIEMPO (solo móvil) --- */}
            {/* --- WEATHER WIDGET (mobile only) --- */}
            <Row className="d-md-none justify-content-center mb-4">
              <Col xs="auto">
                {gym.latitude && gym.longitude && (
                  <WeatherWidget
                    latitude={gym.latitude}
                    longitude={gym.longitude}
                  />
                )}
              </Col>
            </Row>

            {/* --- CABECERA DESKTOP (Weather, Logo y Botón de Cierre) --- */}
            {/* --- DESKTOP HEADER (Weather, Logo, and Close Button) --- */}
            <Row className="d-none d-md-flex justify-content-between align-items-center mb-4">
              <Col md="auto">
                {gym.latitude && gym.longitude && (
                  <WeatherWidget
                    latitude={gym.latitude}
                    longitude={gym.longitude}
                  />
                )}
              </Col>
              <Col md="auto">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={logoSrc}
                    alt={`Logo de ${gym.name}`}
                    className={styles.gymLogoSmall}
                  />
                  <CloseButton
                    onClick={() => navigate("/gyms")}
                    color="#FFB700"
                  />
                </div>
              </Col>
            </Row>{" "}
            {/* --- Hero Image y Detalles Principales --- */}
            {/* --- Hero Image and Main Details --- */}
            <Card className="mb-4 shadow-sm border-0">
              <div className={styles.heroImageWrapper}>
                <Card.Img
                  variant="top"
                  src={mainImageSrc}
                  alt={`Imagen principal de ${gym.name}`}
                  className={styles.heroImage}
                />
                <div className={styles.heroOverlay}>
                  {/* Nombre del gimnasio (solo desktop, movido arriba para móvil) */}
                  {/* Gym name (desktop only, moved above for mobile) */}
                  <h1 className={clsx("text-primary fw-bold mb-0", "d-none d-md-block")}>{gym.name}</h1>
                  {/* Ciudad del gimnasio (solo desktop, movida abajo para móvil) */}
                  {/* Gym city (desktop only, moved below for mobile) */}
                  <p className={clsx("text-white mb-0 fs-5", "d-none d-md-block")}>
                    <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                    {gym.city}
                  </p>
                </div>
              </div>
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={8}>
                    {/* Ciudad del gimnasio (solo móvil, visible debajo de la imagen) */}
                    {/* Gym city (mobile only, visible below the image) */}
                    <p className={clsx("text-secondary mb-2 d-md-none", styles.mobileGymCity)}>
                      <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                      {gym.city}
                    </p>
                    <p className="text-secondary mb-0">
                      <i className="bi bi-geo-alt-fill me-2 text-info"></i>
                      {gym.address}
                    </p>
                  </Col>
                  <Col md={4} className="text-md-end mt-3 mt-md-0">
                    {canVisit && (
                      <Button
                        variant="primary"
                        onClick={handleVisitClick}
                        disabled={isProcessing}
                        className={clsx("w-100", styles.visitButton, { [styles.animating]: animateVisit })}>
                        {isProcessing ? (
                          <>
                            <Spinner
                              size="sm"
                              className="me-2"
                              variant="light"
                            />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <i className={clsx("bi", isIconRunning ? "bi-person-running" : "bi-person-walking", "me-2", styles.visitIcon)}></i><span className="fw-bold">Visitar</span>
                          </>
                        )}
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {/* --- Secciones de Detalles y Ubicación --- */}
            <Row>
              <Col lg={12} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    {/* Horario del gimnasio (opcional) / Gym hours (optional) */}
                    <h4 className="fw-bold mb-3 text-primary">Horario</h4>
                    <p className="text-secondary mb-3" style={{whiteSpace: 'pre-line'}}>
                      <i className="bi bi-clock me-2 text-info"></i>
                      {gym.gym_hours || "Consultar horario"}
                    </p>
                    <h4 className="fw-bold mb-3 text-primary">Ubicación</h4>
                    {gym.latitude && gym.longitude ? (
                      <GymMap
                        lat={gym.latitude}
                        lon={gym.longitude}
                        gymName={gym.name}
                        logoUrl={logoSrc}
                      />
                    ) : (
                      <Alert variant="warning" className="p-3 text-center">
                        Ubicación no disponible en el mapa.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
      {/* El modal se deja fuera del contenedor principal para que la lógica de stopPropagation no interfiera */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onCancel={handleCancelVisit}
        onConfirm={handleConfirmVisit}
        title="Confirmar Visita"
        message={`¿Estás seguro de que quieres registrar una visita a ${
          gym?.name || "este gimnasio"
        }?`}
        note="Esto contará como una visita válida para el día de hoy."
        confirmText={isProcessing ? "Registrando..." : "Confirmar Visita"}
        variant="info"
        isLoading={isProcessing}
      />
    </div>
  );
};
