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
import { getGymById } from "../services/gym-services";
import { createVisit, getVisitsStats } from "../services/visit-services";
import { useAuth } from "../context/AuthContext";
import type { Gym } from "../interfaces/gym-interfaces";
import type { VisitStats } from "../interfaces/visit-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
// modal de confirmación / confirmation modal
import { ConfirmationModal } from "../components/modals/ConfirmationModal";
import { CloseButton } from "../components/ui/CloseButton"; // Importar el botón de cierre

// Importar el WeatherWidget --- / -Import the WeatherWidget ---
import { WeatherWidget } from "../components/widgets/WeatherWidget";

// --- Componente de Mapa / Map Component ---
import { GymMap } from "../components/GymMap";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Button, Spinner, Alert } from "react-bootstrap";

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

  // Fallback para backendBaseUrl
  // Fallback for backendBaseUrl
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

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
        if (token && user?.role === 'user') {
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
      toast.error("Has alcanzado el límite de 10 visitas a otros gimnasios este mes.");
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
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando datos del gimnasio...</span>
        </Spinner>
      </Container>
    );
  }

  // Render error
  if (error || !gym) {
    return (
      <Container className={styles.container}>
        <Alert variant="danger">
          {error || "No se encontró el gimnasio."}
        </Alert>
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
  const canVisit = user &&
    user.role === 'user' &&
    gym &&
    user.home_gym_id !== gym.id &&
    user.home_gym_city?.toLowerCase() !== gym.city?.toLowerCase();

  // Render principal
  return (
    <Container className={styles.container}>
      {/*  Contenedor para widgets ---
         Container for widgets ---
      */}
      <div className={styles.widgetsContainer}>
        {/* Botón de cierre importado */}
        {/* Imported close button */}
        <CloseButton navigateTo="/gyms" />

        {/* Widget de tiempo (se renderiza solo si hay lat/lon) */}
        {/* Weather widget (renders only if lat/lon exist) */}
        {gym.latitude && gym.longitude && (
          <WeatherWidget latitude={gym.latitude} longitude={gym.longitude} />
        )}
      </div>

      {/* Encabezado con logo y nombre */}
      {/* Header with logo and name */}
      <div className={styles.gymHeader}>
        <img
          src={logoSrc}
          alt={`Logo de ${gym.name}`}
          className={styles.gymLogo}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/images/gym-logo/default-gym-logo.png";
          }}
        />
        <h1 className={styles.gymName}>{gym.name}</h1>
        <p className={styles.gymAddress}>{gym.address}</p>
        <p className={styles.gymCity}>{gym.city}</p>
      </div>

      {/* Imagen principal del gimnasio */}
      {/* Main gym image */}
      <img
        src={mainImageSrc}
        alt={`Imagen de ${gym.name}`}
        className={styles.gymImage}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "/images/gym-image/default-gym-image.jpg";
        }}
      />

      {/* --- Map --- */}
      <div className="mb-4">
        <h3 className="mb-3">Ubicación</h3>

        {/* --- lat/lon not null --- */}
        {gym.latitude && gym.longitude ? (
          <GymMap
            lat={gym.latitude}
            lon={gym.longitude}
            gymName={gym.name}
            logoUrl={logoSrc}
          />
        ) : (
          // Fallback si no hay coordenadas en la BBDD
          // Fallback if no coordinates are in the DB
          <Alert variant="warning" className="p-2">
            Ubicación no disponible en el mapa.
          </Alert>
        )}
      </div>

      {/* Botón "Visitar" solo para usuarios (no en su gym de origen y no en su ciudad) */}
      {/* "Visit" button only for users (not in their home gym and not in their city) */}
      {canVisit && (
          <Button
            className={styles.visitButton}
            onClick={handleVisitClick}
            disabled={isProcessing}
            aria-label={`Registrar visita a ${gym.name}`}
          >
            {isProcessing ? "Registrando visita..." : "Visitar"}
          </Button>
        )}

      {/* Añadir el Modal de Confirmación */}
      {/* Add the Confirmation Modal */}
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
        variant="info" // Usamos 'info' (azul)
        isLoading={isProcessing}
      />
    </Container>
  );
};
