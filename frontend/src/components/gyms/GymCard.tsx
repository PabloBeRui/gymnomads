/**
 * =============================================================================
 * COMPONENTE: GymCard
 * COMPONENT: GymCard
 * =============================================================================
 *
 * Descripción: Componente de tarjeta reutilizable para mostrar la información de un gimnasio.
 * Incluye imagen, logo, nombre, ciudad y acciones condicionales de edición/borrado/suspensión
 * basadas en el rol del usuario (Admin/Manager).
 *
 * Description: Reusable card component to display gym information.
 * Includes image, logo, name, city, and conditional edit/delete/suspension actions
 * based on user role (Admin/Manager).
 *
 * =============================================================================
 */

import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";
import type { Gym } from "../../interfaces";
import styles from "./GymCard.module.scss";

// Interfaz para las propiedades del componente GymCard / Interface for GymCard component properties
interface GymCardProps {
  gym: Gym; // Objeto del gimnasio a mostrar / Gym object to display
  onDelete?: (gym: Gym) => void; // Función opcional para manejar la eliminación / Optional function to handle deletion
  onToggleSuspension?: (gym: Gym) => void; // Función opcional para manejar la suspensión/reactivación / Optional function to handle suspension/reactivation
}

export const GymCard: React.FC<GymCardProps> = ({
  gym,
  onDelete,
  onToggleSuspension,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  // URL base del backend para las imágenes / Backend Base URL for images
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  // Construir URL de la imagen principal del gimnasio con fallback / Build gym main image URL with fallback
  const gymImageSrc = gym.main_image_url
    ? `${backendBaseUrl}/${gym.main_image_url.replace(/\\/g, "/")}`
    : "/images/gym-image/default-gym-image.jpg";

  // Construir URL del logo del gimnasio con fallback / Build gym logo URL with fallback
  const logoSrc = gym.logo_url
    ? `${backendBaseUrl}/${gym.logo_url.replace(/\\/g, "/")}`
    : "/images/gym-logo/default-gym-logo.png";

  /**
   * =============================================================================
   * MANEJADOR: handleEdit
   * HANDLER: handleEdit
   * =============================================================================
   *
   * Navega a la página de edición del gimnasio.
   * Navigates to the gym edit page.
   *
   * @param e Evento de ratón para detener la propagación. / Mouse event to stop propagation.
   * =============================================================================
   */
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar la navegación de la tarjeta principal / Prevent main card navigation
    navigate(`/gyms/edit/${gym.id}`);
  };

  /**
   * =============================================================================
   * MANEJADOR: handleDeleteClick
   * HANDLER: handleDeleteClick
   * =============================================================================
   *
   * Invoca la función `onDelete` pasada por props.
   * Invokes the `onDelete` function passed via props.
   *
   * @param e Evento de ratón para detener la propagación. / Mouse event to stop propagation.
   * =============================================================================
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar la navegación de la tarjeta principal / Prevent main card navigation
    if (onDelete) onDelete(gym);
  };

  /**
   * =============================================================================
   * MANEJADOR: handleSuspensionClick
   * HANDLER: handleSuspensionClick
   * =============================================================================
   *
   * Invoca la función `onToggleSuspension` pasada por props.
   * Invokes the `onToggleSuspension` function passed via props.
   *
   * @param e Evento de ratón para detener la propagación. / Mouse event to stop propagation.
   * =============================================================================
   */
  const handleSuspensionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar la navegación de la tarjeta principal / Prevent main card navigation
    if (onToggleSuspension) onToggleSuspension(gym);
  };

  return (
    <Card
      className={clsx("h-100 shadow-sm border-0", styles.gymCard, {
        [styles.suspendedGym]: gym.is_suspended === 1, // Clase condicional para gimnasios suspendidos / Conditional class for suspended gyms
      })}
      onClick={() => navigate(`/gyms/${gym.id}`)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/gyms/${gym.id}`);
        }
      }}
    >
      <div className={styles.cardImageWrapper}>
        <Card.Img
          variant="top"
          src={gymImageSrc}
          alt={`Imagen de ${gym.name}`}
          className={styles.gymImage}
        />
        <div className={styles.cardOverlay}>
          <h5 className="text-primary fw-bold">{gym.name}</h5>
        </div>
      </div>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div className="d-flex flex-column">
          <Card.Text className="small text-dark">
            <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
            <strong>{gym.city}</strong>
          </Card.Text>
        </div>
        <div>
          <img
            src={logoSrc}
            alt={`Logo de ${gym.name}`}
            className={styles.cardBodyLogo}
          />
        </div>
      </Card.Body>
      {/* Botones de acción visibles solo para Admin o Manager del gimnasio / Action buttons visible only for Admin or Gym Manager */}
      {(isAdmin ||
        (user?.role === "manager" && user.home_gym_id === gym.id)) && (
        <Card.Footer className="bg-white border-top-0">
          <div className="d-flex justify-content-end align-items-center gap-2">
            <Button variant="outline-info" onClick={handleEdit}>
              <i className="bi bi-pencil-fill me-2"></i>Editar
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline-danger" onClick={handleDeleteClick}>
                  <i className="bi bi-trash-fill me-2"></i>Borrar
                </Button>
                <Button
                  variant={
                    gym.is_suspended === 1
                      ? "outline-success" // Si está suspendido, botón verde para reactivar / If suspended, green button to reactivate
                      : "outline-warning" // Si está activo, botón amarillo para suspender / If active, yellow button to suspend
                  }
                  onClick={handleSuspensionClick}
                >
                  <i
                    className={clsx("bi me-2", {
                      "bi-play-circle-fill": gym.is_suspended === 1, // Icono de play si está suspendido / Play icon if suspended
                      "bi-pause-circle-fill": gym.is_suspended === 0, // Icono de pausa si está activo / Pause icon if active
                    })}
                  ></i>
                  {gym.is_suspended === 1 ? "Reactivar" : "Suspender"}
                </Button>
              </>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};
