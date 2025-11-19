/**
 * =============================================================================
 * COMPONENTE: CookieConsentModal
 * COMPONENT:  CookieConsentModal
 * =============================================================================
 *
 * Modal para solicitar el consentimiento de cookies al usuario.
 * Utiliza localStorage para recordar la elección del usuario y no volver
 * a mostrarse. Si el usuario acepta, establece una cookie de ejemplo.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Modal to request cookie consent from the user.
 * Uses localStorage to remember the user's choice and not show again.
 * If the user accepts, it sets an example cookie.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import React, { useState, useEffect } from "react";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Modal, Button } from "react-bootstrap";
import styles from "./CookieConsentModal.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

export const CookieConsentModal: React.FC = () => {
  // Definir estado para la visibilidad del modal / Define state for modal visibility
  const [isVisible, setIsVisible] = useState(false);

  // Comprobar el consentimiento al cargar el componente / Check for consent when the component mounts
  useEffect(() => {
    // Ejecutar solo una vez / Run only once
    const consent = localStorage.getItem("gymnomads_cookie_consent");
    if (!consent) {
      // Si no hay ninguna elección guardada, mostrar el modal / If no choice is saved, show the modal
      setIsVisible(true);
    }
  }, []);

  // Manejar la aceptación de cookies / Handle cookie acceptance
  const handleAccept = () => {
    // 1. Guardar la elección para no volver a mostrar el modal / 1. Save the choice to not show the modal again
    localStorage.setItem("gymnomads_cookie_consent", "accepted");

    // 2. Guardar la cookie de "analítica" (dura 1 año) / 2. Save the "analytics" cookie (lasts 1 year)
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    document.cookie = `analytics_enabled=true; max-age=${oneYearInSeconds}; path=/`;

    // 3. Ocultar el modal / 3. Hide the modal
    setIsVisible(false);
  };

  // Manejar el rechazo de cookies / Handle cookie rejection
  const handleReject = () => {
    // 1. Guardar la elección para no volver a mostrar el modal / 1. Save the choice to not show the modal again
    localStorage.setItem("gymnomads_cookie_consent", "rejected");

    // 2. Ocultar el modal / 2. Hide the modal
    setIsVisible(false);
  };

  return (
    <Modal show={isVisible} onHide={handleReject} centered className={styles.modalOverlay}>
      <Modal.Body className={styles.modalContent}>
        <h3 className={clsx(styles.title, "text-primary")}>Datos para mejorar tu experiencia</h3>
        <p className={clsx(styles.text, "text-dark")}>
          Para ofrecer las mejores experiencias, utilizamos tecnologías como las
          cookies para almacenar y/o acceder a la información del dispositivo.
          El consentimiento de estas tecnologías nos permitirá procesar datos
          como el comportamiento de navegación o las identificaciones únicas en
          este sitio. No consentir o retirar el consentimiento, puede afectar
          negativamente a ciertas características y funciones.
        </p>
        <div className={styles.buttonContainer}>
          <Button variant="secondary" onClick={handleReject}>
            Rechazar
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            Aceptar
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};