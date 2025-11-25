/**
 * =============================================================================
 * COMPONENTE: QRCodeComponent
 * COMPONENT: QRCodeComponent
 * =============================================================================
 *
 * Componente reutilizable para mostrar códigos QR estilizados.
 * Utiliza 'qr-code-styling' para generar un QR con logo.
 * Refactorizado para usar SASS Modules.
 *
 * Reusable component to display stylized QR codes.
 * Uses 'qr-code-styling' to generate a QR with a logo.
 * Refactored to use SASS Modules.
 *
 * =============================================================================
 */

// ---  imports de React y la librería --- / ---  React imports and the library ---
import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./QRCodeComponent.module.scss";

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

  // Estado para almacenar el color del QR dinámicamente desde CSS
  // State to store the QR color dynamically from CSS
  const [qrColor, setQrColor] = useState<string>("#194350"); // Default a $secondary

  // Efecto para obtener el valor de la variable CSS --bs-secondary
  // Effect to get the value of the --bs-secondary CSS variable
  useEffect(() => {
    if (typeof window !== "undefined") {
      const computedStyle = getComputedStyle(document.documentElement);
      const bsSecondary = computedStyle.getPropertyValue("--bs-secondary").trim();
      if (bsSecondary) {
        setQrColor(bsSecondary);
      }
    }
  }, []);

  // useEffect para (re)dibujar el QR cuando cambien las props o el color
  // useEffect to (re)draw the QR when props or color change
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
        color: qrColor, // Usar el color secundario dinámico // Use dynamic secondary color
        type: "square", // Puntos cuadrados (QR normal) // Square dots (normal QR)
      },
      cornersSquareOptions: {
        type: "square", // Esquinas cuadradas // Square corners
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
  }, [data, logoUrl, size, qrRef, qrColor]); // Dependencias: añadir qrColor // Dependencies: add qrColor

  // --- FIN LÓGICA QR-CODE-STYLING ---
  // --- END QR-CODE-STYLING LOGIC ---

  return (
    <div className={styles.qrContainer}>
      <div
        ref={qrRef}
        className={styles.qrCodeWrapper} // Usamos el nuevo estilo wrapper / Using the new wrapper style
        aria-label={altText}
        role="img"
      />
    </div>
  );
};