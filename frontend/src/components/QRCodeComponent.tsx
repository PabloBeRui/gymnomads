/**
 * =============================================================================
 * COMPONENTE: QRCodeComponent
 * COMPONENT: QRCodeComponent
 * =============================================================================
 *
 * Componente reutilizable para mostrar códigos QR estilizados.
 * Utiliza 'qr-code-styling' para generar un QR con logo.
 *
 * Reusable component to display stylized QR codes.
 * Uses 'qr-code-styling' to generate a QR with a logo.
 *
 * =============================================================================
 */

// ---  imports de React y la librería ---
// ---  React imports and the library ---
import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

/* =============================================================================
    PROPS
    ============================================================================= */
interface QRCodeComponentProps {
  // Datos a codificar en el QR / Data to encode in QR
  data: string;

  // --- Ruta pública del logo a mostrar en el centro ---
  // ---  Public path of the logo to show in the center ---
  logoUrl: string;

  // Tamaño del QR en píxeles (opcional) / QR size in pixels (optional)
  size?: number;

  // Texto alternativo (opcional) / Alt text (optional)
  altText?: string;
}

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  qrContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  // ---  Estilo para el contenedor que tendrá el canvas del QR ---
  // ---  Style for the container that will hold the QR canvas ---
  qrCodeWrapper: {
    backgroundColor: "#ffffff", // Fondo blanco / White background
    border: "1px solid #eee", // Borde sutil / Subtle border
    borderRadius: "12px", // Bordes redondeados / Rounded borders
    display: "flex", // Centrar el canvas si es necesario / Center the canvas if needed
    alignItems: "center",
    justifyContent: "center",
    padding: "16px", // Espacio interno / Internal padding
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
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
    COMPONENT: QRCodeComponent
    ============================================================================= */
export const QRCodeComponent = ({
  data,
  logoUrl,
  size = 300,
  altText = "Código QR",
}: QRCodeComponentProps) => {
  // --- INICIO LÓGICA QR-CODE-STYLING ---
  // --- START QR-CODE-STYLING LOGIC ---

  // Ref para el div que contendrá el canvas del QR
  // Ref for the div that will hold the QR canvas
  const qrRef = useRef<HTMLDivElement>(null);

  // useEffect para (re)dibujar el QR cuando cambien las props
  // useEffect to (re)draw the QR when props change
  useEffect(() => {
    // 1. Validar que el div contenedor exista
    // 1. Validate that the container div exists
    if (!qrRef.current) {
      return;
    }

    // 2. Crear instancia de QR
    // 2. Create QR instance
    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      data: data, // Datos (URL) a codificar / Data (URL) to encode
      image: logoUrl, // Logo de GymNomads / GymNomads logo
      dotsOptions: {
        color: "#333333", // Puntos oscuros / Dark dots
        type: "rounded", // Puntos redondeados / Rounded dots
      },
      cornersSquareOptions: {
        type: "extra-rounded", // Esquinas redondeadas / Rounded corners
      },
      backgroundOptions: {
        color: "#ffffff", // Fondo blanco (del canvas) / White background (of the canvas)
      },
      imageOptions: {
        hideBackgroundDots: true, // Ocultar puntos tras el logo / Hide dots behind logo
        imageSize: 0.4, // Logo al 40% / Logo at 40%
        margin: 4, // Margen del logo / Logo margin
      },
    });

    // 3. Limpiar el div (para borrar QR antiguos) y añadir el nuevo
    // 3. Clear the div (to remove old QRs) and append the new one
    qrRef.current.innerHTML = "";
    qrCode.append(qrRef.current);
  }, [data, logoUrl, size, qrRef]); // Dependencias / Dependencies

  // --- FIN LÓGICA QR-CODE-STYLING ---
  // --- END QR-CODE-STYLING LOGIC ---

  return (
    <div style={styles.qrContainer}>
      <div
        ref={qrRef}
        style={styles.qrCodeWrapper} // Usamos el nuevo estilo wrapper / Using the new wrapper style
        aria-label={altText}
        role="img"
      />

      {/* Información de desarrollo (se mantiene de tu código original) */}
      {/* Development info (kept from your original code) */}
      {import.meta.env.DEV && (
        <p style={styles.qrInfo}>
          Dev: QR data = "{data.substring(0, 30)}
          {data.length > 30 ? "..." : ""}"
        </p>
      )}
    </div>
  );
};
