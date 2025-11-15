/**
 * =============================================================================
 * COMPONENTE: CookieConsentModal
 * COMPONENT:  CookieConsentModal
 * =============================================================================
 *
 * Modal para solicitar el consentimiento de cookies al usuario.
 * Utiliza localStorage para recordar la elección del usuario y no volver
 * a mostrarse. Si el usuario acepta, establece una cookie de ejemplo.
 *
 * Modal to request cookie consent from the user.
 * Uses localStorage to remember the user's choice and not show again.
 * If the user accepts, it sets an example cookie.
 *
 * =============================================================================
 */

import React, { useState, useEffect } from "react";

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fondo oscurecido
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050, // Por encima de todo
  },
  modalContent: {
    backgroundColor: "white",
    padding: "25px 30px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "10px",
  },
  text: {
    fontSize: "0.9rem",
    color: "#555",
    lineHeight: 1.6,
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  button: {
    padding: "10px 20px",
    fontSize: "0.9rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  rejectButton: {
    backgroundColor: "#f1f1f1",
    color: "#555",
  },
  acceptButton: {
    backgroundColor: "#007bff", // Color primario (configurable)
    color: "white",
  },
};

export const CookieConsentModal: React.FC = () => {
  // Definir estado para la visibilidad del modal
  // Define state for modal visibility
  const [isVisible, setIsVisible] = useState(false);

  // Comprobar el consentimiento al cargar el componente
  // Check for consent when the component mounts
  useEffect(() => {
    // Ejecutar solo una vez
    // Run only once
    const consent = localStorage.getItem("gymnomads_cookie_consent");
    if (!consent) {
      // Si no hay ninguna elección guardada, mostrar el modal
      // If no choice is saved, show the modal
      setIsVisible(true);
    }
  }, []);

  // Manejar la aceptación de cookies
  // Handle cookie acceptance
  const handleAccept = () => {
    // 1. Guardar la elección para no volver a mostrar el modal
    // 1. Save the choice to not show the modal again
    localStorage.setItem("gymnomads_cookie_consent", "accepted");

    // 2. Guardar la cookie de "analítica" (dura 1 año)
    // 2. Save the "analytics" cookie (lasts 1 year)
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    document.cookie = `analytics_enabled=true; max-age=${oneYearInSeconds}; path=/`;

    // 3. Ocultar el modal
    // 3. Hide the modal
    setIsVisible(false);
  };

  // Manejar el rechazo de cookies
  // Handle cookie rejection
  const handleReject = () => {
    // 1. Guardar la elección para no volver a mostrar el modal
    // 1. Save the choice to not show the modal again
    localStorage.setItem("gymnomads_cookie_consent", "rejected");

    // 2. Ocultar el modal
    // 2. Hide the modal
    setIsVisible(false);
  };

  // No renderizar nada si no es visible
  // Don't render anything if it's not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.title}>Datos para mejorar tu experiencia</h3>
        <p style={styles.text}>
          Para ofrecer las mejores experiencias, utilizamos tecnologías como las
          cookies para almacenar y/o acceder a la información del dispositivo.
          El consentimiento de estas tecnologías nos permitirá procesar datos
          como el comportamiento de navegación o las identificaciones únicas en
          este sitio. No consentir o retirar el consentimiento, puede afectar
          negativamente a ciertas características y funciones.
        </p>
        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, ...styles.rejectButton }}
            onClick={handleReject}>
            Rechazar
          </button>
          <button
            style={{ ...styles.button, ...styles.acceptButton }}
            onClick={handleAccept}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
