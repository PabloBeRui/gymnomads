/**
 * =============================================================================
 * PÁGINA: UserVisitGymPage
 * =============================================================================
 *
 * Página que muestra la confirmación de visita a un gimnasio con código QR.
 * Incluye información de la visita y el QR de acceso.
 *
 * Page that shows gym visit confirmation with QR code.
 * Includes visit information and access QR.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeComponent } from "../components/QRCodeComponent";
import { handleApiError } from "../utils/error-handler";
import { toast } from "sonner";
// TODO: Importar servicio para obtener detalles de la visita cuando esté disponible
// TODO: Import service to get visit details when available
// import { getVisitById } from "../services/visit-services";

/* =============================================================================
   INTERFACES
   ============================================================================= */
// Interfaz temporal para los datos de la visita
// Temporary interface for visit data
interface VisitDetails {
  id: number;
  gym_name: string;
  gym_address: string;
  visit_date: string;
  user_name: string;
}

/* =============================================================================
   ESTILOS (inline)
   ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "700px",
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
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    marginBottom: "5px",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #c3e6cb",
    marginBottom: "30px",
    textAlign: "center",
  },
  infoSection: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
  },
  infoRow: {
    marginBottom: "10px",
    fontSize: "1rem",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#495057",
  },
  infoValue: {
    color: "#212529",
  },
  qrSection: {
    textAlign: "center",
    marginBottom: "30px",
  },
  qrTitle: {
    fontSize: "1.3rem",
    marginBottom: "20px",
    color: "#495057",
  },
  instructions: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ffeeba",
    marginTop: "30px",
  },
  backButton: {
    width: "100%",
    padding: "12px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
  },
};

/* =============================================================================
   COMPONENTE: UserVisitGymPage
   ============================================================================= */
export const UserVisitGymPage = () => {
  // Obtener el ID de la visita desde los parámetros de la URL
  // Get the visit ID from URL parameters
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();

  // Estados del componente / Component states
  const [visitDetails, setVisitDetails] = useState<VisitDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar detalles de la visita al montar
  // Load visit details on mount
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
        // TODO: Reemplazar con llamada real al backend
        // TODO: Replace with real backend call
        // const data = await getVisitById(Number(visitId), token);
        
        // Datos mock temporales / Temporary mock data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simular carga
        
        const mockData: VisitDetails = {
          id: Number(visitId),
          gym_name: "Gimnasio Demo",
          gym_address: "Calle Principal 123, Madrid",
          visit_date: new Date().toISOString(),
          user_name: "Usuario Demo",
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

  // Formatear fecha para mostrar
  // Format date for display
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

  // Render loading
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Cargando detalles de la visita...</p>
        {/* TODO: Spinner */}
      </div>
    );
  }

  // Render error
  if (error || !visitDetails) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>
          {error || "No se encontraron detalles de la visita."}
        </div>
        <button style={styles.backButton} onClick={() => navigate("/gyms")}>
          Volver a Gimnasios
        </button>
      </div>
    );
  }

  // Generar datos para el QR (formato que usará el gimnasio para validar)
  // Generate QR data (format that gym will use for validation)
  const qrData = JSON.stringify({
    visitId: visitDetails.id,
    timestamp: new Date().toISOString(),
    // TODO: Añadir más campos según necesidades de seguridad
    // TODO: Add more fields based on security needs
  });

  // Render principal
  return (
    <div style={styles.container}>
      {/* Encabezado */}
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>¡Visita Confirmada!</h1>
        <p style={styles.subtitle}>Tu acceso al gimnasio está listo</p>
      </div>

      {/* Mensaje de éxito */}
      {/* Success message */}
      <div style={styles.successMessage}>
        <strong>✓ Visita registrada correctamente</strong>
      </div>

      {/* Información de la visita */}
      {/* Visit information */}
      <div style={styles.infoSection}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Gimnasio: </span>
          <span style={styles.infoValue}>{visitDetails.gym_name}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Dirección: </span>
          <span style={styles.infoValue}>{visitDetails.gym_address}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Fecha de visita: </span>
          <span style={styles.infoValue}>
            {formatDate(visitDetails.visit_date)}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>ID de visita: </span>
          <span style={styles.infoValue}>#{visitDetails.id}</span>
        </div>
      </div>

      {/* Sección del código QR */}
      {/* QR code section */}
      <div style={styles.qrSection}>
        <h2 style={styles.qrTitle}>Código de Acceso</h2>
        <QRCodeComponent
          data={qrData}
          size={280}
          altText={`Código QR de acceso para visita #${visitDetails.id}`}
        />
      </div>

      {/* Instrucciones */}
      {/* Instructions */}
      <div style={styles.instructions}>
        <strong>📱 Instrucciones:</strong>
        <ul style={{ textAlign: "left", marginTop: "10px" }}>
          <li>Presenta este código QR en la recepción del gimnasio</li>
          <li>El código es válido para el día de hoy</li>
          <li>Guarda esta pantalla o haz una captura</li>
        </ul>
      </div>

      {/* Botón para volver */}
      {/* Back button */}
      <button
        style={styles.backButton}
        onClick={() => navigate("/gyms")}
        aria-label="Volver a la lista de gimnasios"
      >
        Volver a Gimnasios
      </button>
    </div>
  );
};