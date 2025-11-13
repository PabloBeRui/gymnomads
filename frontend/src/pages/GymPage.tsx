/**
 * =============================================================================
 * PÁGINA: GymPage
 * =============================================================================
 *
 * Página para mostrar los detalles de un gimnasio específico.
 * Muestra información del gimnasio, mapa interactivo (OSM), y permite a los
 * usuarios (role='user') registrar una visita.
 *
 * Page to display details of a specific gym.
 * Shows gym information, interactive map (OSM), and allows users (role='user')
 * to register a visit.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGymById } from "../services/gym-services";
import { createVisit } from "../services/visit-services";
import { useAuth } from "../context/AuthContext";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
// modal de confirmación / confirmation modal
import { ConfirmationModal } from "../components/modals/ConfirmationModal";
import { CloseButton } from "../components/ui/CloseButton"; // Importar el nuevo componente

// --- Componente de Mapa / Map Component ---
import { GymMap } from "../components/GymMap";

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
    position: "relative", // Añadido para posicionar el botón de cierre
  },
  loadingContainer: {
    padding: "20px",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    padding: "20px",
  },
  gymHeader: {
    marginBottom: "30px",
    textAlign: "center",
  },
  gymLogo: {
    width: "200px",
    height: "200px",
    objectFit: "contain",
    marginBottom: "20px",
    border: "2px solid #eee",
    borderRadius: "8px",
    padding: "10px",
  },
  gymName: {
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#333",
  },
  gymAddress: {
    fontSize: "1.1rem",
    color: "#666",
    marginBottom: "5px",
  },
  gymCity: {
    fontSize: "1.1rem",
    color: "#666",
    fontWeight: "bold",
  },
  gymImage: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "30px",
  },
  visitButton: {
    width: "100%",
    padding: "15px",
    fontSize: "1.2rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  visitButtonHover: {
    backgroundColor: "#218838",
  },
  visitButtonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
  },
};

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

  // --- MODIFICADO: Renombrado a 'isProcessing' / MODIFIED: Renamed to 'isProcessing' ---
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --- NUEVO: Estado para el modal / NEW: State for modal ---
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Fallback para backendBaseUrl
  // Fallback for backendBaseUrl
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  // Cargar datos del gimnasio al montar
  // Load gym data on mount
  useEffect(() => {
    const fetchGym = async () => {
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
        const gymData = await getGymById(Number(id));
        setGym(gymData);
      } catch (err) {
        const msg = handleApiError(
          err,
          "Hubo un problema al cargar los datos del gimnasio."
        );
        setError(msg);
        toast.error(msg);
        if (import.meta.env.DEV) console.error("Error fetching gym:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGym();
  }, [id]);

  // ---  Manejar la confirmación y registro de visita ---
  // ---  Handle visit confirmation and registration ---

  // PASO 1: Abrir el modal de confirmación
  // STEP 1: Open confirmation modal
  const handleVisitClick = () => {
    // abre el modal
    // opens the modal
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
      <div style={styles.loadingContainer}>
        <p>Cargando datos del gimnasio...</p>
        {/* TODO: Spinner */}
      </div>
    );
  }

  // Render error
  if (error || !gym) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>
          {error || "No se encontró el gimnasio."}
        </div>
      </div>
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

  // Render principal
  return (
    <div style={styles.container}>
      <CloseButton navigateTo="/gyms" ariaLabel="Volver a la lista de gimnasios" />

      {/* Encabezado con logo y nombre */}
      {/* Header with logo and name */}
      <div style={styles.gymHeader}>
        <img
          src={logoSrc}
          alt={`Logo de ${gym.name}`}
          style={styles.gymLogo}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/images/gym-logo/default-gym-logo.png";
          }}
        />
        <h1 style={styles.gymName}>{gym.name}</h1>
        <p style={styles.gymAddress}>{gym.address}</p>
        <p style={styles.gymCity}>{gym.city}</p>
      </div>

      {/* Imagen principal del gimnasio */}
      {/* Main gym image */}
      <img
        src={mainImageSrc}
        alt={`Imagen de ${gym.name}`}
        style={styles.gymImage}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "/images/gym-image/default-gym-image.jpg";
        }}
      />

      {/* --- Map --- */}

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px" }}>Ubicación</h3>

        {/* ---  lat/lon not null --- */}

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
          <p style={{ ...styles.errorText, padding: 0 }}>
            Ubicación no disponible en el mapa.
          </p>
        )}
      </div>

      {/* Botón "Visitar" solo para usuarios (no en su gym de origen) */}
      {/* "Visit" button only for users (not in their home gym) */}
      {user && user.role === "user" && gym && user.home_gym_id !== gym.id && (
        <button
          style={{
            ...styles.visitButton,
            ...(isProcessing ? styles.visitButtonDisabled : {}),
          }}
          // --- onClick ahora solo abre el modal ---
          // --- onClick now just opens the modal ---
          onClick={handleVisitClick}
          disabled={isProcessing}
          aria-label={`Registrar visita a ${gym.name}`}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              (e.target as HTMLButtonElement).style.backgroundColor =
                styles.visitButtonHover.backgroundColor || "";
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              (e.target as HTMLButtonElement).style.backgroundColor =
                styles.visitButton.backgroundColor || "";
            }
          }}>
          {isProcessing ? "Registrando visita..." : "Visitar"}
        </button>
      )}

      {/* Añadir el Modal de Confirmación  */}
      {/* Add the Confirmation Modal  */}
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
    </div>
  );
};
