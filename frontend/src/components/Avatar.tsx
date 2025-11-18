import React from "react";
import { getInitials, getColorFromString } from "../utils/avatar-utils";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./Avatar.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx

// Propiedades del componente Avatar
// Avatar component properties
interface AvatarProps {
  src?: string | null; // URL de la imagen de perfil / Profile picture URL
  firstName: string; // Nombre del usuario / User's first name
  lastName: string; // Apellido del usuario / User's last name
  size?: number; // Tamaño del avatar en píxeles (default: 40) / Avatar size in pixels (default: 40)
  onClick?: () => void; // Función al hacer click / Click handler function
  className?: string; // Clases CSS adicionales / Additional CSS classes
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  firstName,
  lastName,
  size = 40,
  onClick,
  className = "",
}) => {
  // Obtener iniciales para el fallback / Get initials for fallback
  const initials = getInitials(firstName, lastName);

  // Obtener color único basado en el nombre completo / Get unique color based on full name
  const backgroundColor = getColorFromString(`${firstName}${lastName}`);

  // Estado para manejar errores de carga de imagen / State to handle image loading errors
  const [imageError, setImageError] = React.useState(false);

  // Determinar si mostrar imagen o iniciales / Determine whether to show image or initials
  const showImage = src && !imageError;

  // Estilos dinámicos para el tamaño y color de fondo / Dynamic styles for size and background color
  const dynamicStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.4}px`, // Tamaño de fuente proporcional / Proportional font size
    backgroundColor: showImage ? "transparent" : backgroundColor,
  };

  return (
    <div
      className={clsx(
        styles.avatarContainer,
        { [styles.clickable]: onClick },
        className
      )}
      style={dynamicStyles}
      onClick={onClick}
      title={`${firstName} ${lastName}`} // Tooltip con nombre completo / Tooltip with full name
      role={onClick ? "button" : "img"}
      aria-label={`Avatar de ${firstName} ${lastName}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={`${firstName} ${lastName}`}
          className={styles.avatarImage}
          onError={() => setImageError(true)} // Si falla la carga, mostrar iniciales / Show initials if loading fails
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

