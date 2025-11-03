/**
 * =============================================================================
 * COMPONENTE: QRCodeComponent
 * =============================================================================
 *
 * Componente reutilizable para mostrar códigos QR.
 * Actualmente muestra un placeholder, se implementará con librería QR.
 *
 * Reusable component to display QR codes.
 * Currently shows a placeholder, will be implemented with QR library.
 *
 * =============================================================================
 */

/* =============================================================================
   PROPS
   ============================================================================= */
interface QRCodeComponentProps {
  // Datos a codificar en el QR / Data to encode in QR
  data: string;
  
  // Tamaño del QR en píxeles (opcional) / QR size in pixels (optional)
  size?: number;
  
  // Texto alternativo (opcional) / Alt text (optional)
  altText?: string;
}

/* =============================================================================
   ESTILOS (inline)
   ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  qrContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  qrPlaceholder: {
    backgroundColor: "#e9ecef",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    color: "#6c757d",
    fontWeight: "bold",
  },
  qrInfo: {
    fontSize: "0.85rem",
    color: "#999",
    marginTop: "10px",
    fontStyle: "italic",
  },
};

/* =============================================================================
   COMPONENTE: QRCodeComponent
   ============================================================================= */
export const QRCodeComponent = ({
  data,
  size = 300,
  altText = "Código QR",
}: QRCodeComponentProps) => {
  // TODO: Implementar librería QR (react-qr-code, qrcode.react, etc.)
  // TODO: Implement QR library (react-qr-code, qrcode.react, etc.)

  return (
    <div style={styles.qrContainer}>
      {/* Placeholder temporal del QR */}
      {/* Temporary QR placeholder */}
      <div
        style={{
          ...styles.qrPlaceholder,
          width: `${size}px`,
          height: `${size}px`,
        }}
        aria-label={altText}
        role="img"
      >
        <span>QR</span>
      </div>

      {/* Información de desarrollo */}
      {/* Development info */}
      {import.meta.env.DEV && (
        <p style={styles.qrInfo}>
          Dev: QR data = "{data.substring(0, 30)}
          {data.length > 30 ? "..." : ""}"
        </p>
      )}
    </div>
  );
};