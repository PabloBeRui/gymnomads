import React from "react";
import { getInitials, getColorFromString } from "../utils/avatar-utils";

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
  // Obtener iniciales para el fallback
  // Get initials for fallback
  const initials = getInitials(firstName, lastName);

  // Obtener color único basado en el nombre completo
  // Get unique color based on full name
  const backgroundColor = getColorFromString(`${firstName}${lastName}`);

  // Estado para manejar errores de carga de imagen
  // State to handle image loading errors
  const [imageError, setImageError] = React.useState(false);

  // Determinar si mostrar imagen o iniciales
  // Determine whether to show image or initials
  const showImage = src && !imageError;

  // Estilos del contenedor del avatar
  // Avatar container styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: showImage ? "transparent" : backgroundColor,
      color: "#fff",
      fontWeight: "600",
      fontSize: `${size * 0.4}px`, // Tamaño de fuente proporcional / Proportional font size
      cursor: onClick ? "pointer" : "default",
      overflow: "hidden",
      flexShrink: 0, // Evita que el avatar se encoja / Prevent avatar from shrinking
      userSelect: "none",
      transition: "transform 0.2s ease",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
  };

  // Efecto hover si hay onClick
  // Hover effect if onClick exists
  const [isHovered, setIsHovered] = React.useState(false);
  const containerStyle = {
    ...styles.container,
    ...(onClick && isHovered ? { transform: "scale(1.05)" } : {}),
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${firstName} ${lastName}`} // Tooltip con nombre completo / Tooltip with full name
      role={onClick ? "button" : "img"}
      aria-label={`Avatar de ${firstName} ${lastName}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={`${firstName} ${lastName}`}
          style={styles.image}
          onError={() => setImageError(true)} // Si falla la carga, mostrar iniciales / Show initials if loading fails
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

