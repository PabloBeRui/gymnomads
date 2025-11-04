/**
 * =============================================================================
 * PÁGINA: GymPage
 * =============================================================================
 *
 * Página para mostrar los detalles de un gimnasio específico.
 * Muestra información del gimnasio, mapa (placeholder), y permite a los
 * usuarios (role='user') registrar una visita.
 *
 * Page to display details of a specific gym.
 * Shows gym information, map (placeholder), and allows users (role='user')
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

/* =============================================================================
   ESTILOS (inline)
   ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
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
  mapPlaceholder: {
    width: "100%",
    height: "300px",
    backgroundColor: "#e9ecef",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "#6c757d",
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
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Fallback para backendBaseUrl
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

  // Manejar la confirmación y registro de visita
  // Handle visit confirmation and registration
  const handleVisitClick = async () => {
    // Confirmar con el usuario
    // Confirm with user
    const confirmed = window.confirm(
      `¿Confirmas tu visita a ${gym?.name || "este gimnasio"}?`
    );

    if (!confirmed) return;

    // Validar autenticación
    // Validate authentication
    if (!token || !gym) {
      toast.error("No estás autenticado para realizar esta acción.");
      return;
    }

    setIsRegistering(true);

    try {
      // Crear la visita en el backend
      // Create the visit in the backend
      const response = await createVisit(gym.id, token);

      // 🔍 DEBUG: Ver qué devuelve el backend (quitar en producción)
      // DEBUG: See what the backend returns (remove in production)
      if (import.meta.env.DEV) {
        console.log("Response from createVisit:", response);
      }

      // Extraer el ID de la visita (el backend devuelve visitId directamente)
      // Extract visit ID (backend returns visitId directly)
      const visitId = response.visitId;

      // Validar que se recibió el ID
      // Validate that ID was received
      if (!visitId) {
        throw new Error("No se recibió el ID de la visita del servidor");
      }

      // Mostrar mensaje de éxito
      // Show success message
      toast.success(response.message || "Visita registrada con éxito.");

      // Navegar a la página del QR, pasando el ID de la visita
      // Navigate to QR page, passing the visit ID
      navigate(`/visits/${visitId}/qr`);
    } catch (err) {
      // Procesar el error con el manejador centralizado
      // Process error with centralized handler
      const msg = handleApiError(err, "No se pudo registrar la visita.");
      toast.error(msg);
      if (import.meta.env.DEV) console.error("Error creating visit:", err);
    } finally {
      setIsRegistering(false);
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
    : "/images/gym-image/default-gym-image.png";

  // Render principal
  return (
    <div style={styles.container}>
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

      {/* Placeholder del mapa */}
      {/* Map placeholder */}
      <div style={styles.mapPlaceholder}>
        <span>MAPA</span>
      </div>

      {/* Botón "Visitar" solo para usuarios con role='user' */}
      {/* "Visit" button only for users with role='user' */}
      {user && user.role === "user" && (
        <button
          style={{
            ...styles.visitButton,
            ...(isRegistering ? styles.visitButtonDisabled : {}),
          }}
          onClick={handleVisitClick}
          disabled={isRegistering}
          aria-label={`Registrar visita a ${gym.name}`}
          onMouseOver={(e) => {
            if (!isRegistering) {
              (e.target as HTMLButtonElement).style.backgroundColor =
                styles.visitButtonHover.backgroundColor || "";
            }
          }}
          onMouseOut={(e) => {
            if (!isRegistering) {
              (e.target as HTMLButtonElement).style.backgroundColor =
                styles.visitButton.backgroundColor || "";
            }
          }}>
          {isRegistering ? "Registrando visita..." : "Visitar"}
        </button>
      )}
    </div>
  );
};
