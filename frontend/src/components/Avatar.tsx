import React from "react";
import { getInitials, getColorFromString } from "../utils/avatar-utils";
import styles from "./Avatar.module.scss";
import clsx from "clsx";

/**
 * =============================================================================
 * COMPONENTE: Avatar
 * COMPONENT:  Avatar
 * =============================================================================
 *
 * Descripción: Muestra una imagen de perfil o, en su defecto, las iniciales
 * del usuario sobre un fondo de color generado a partir de su nombre.
 * El tamaño se controla ahora principalmente a través de una variable CSS
 * `--avatar-size` para mayor flexibilidad.
 *
 * Description: Displays a profile picture or, as a fallback, the user's
 * initials on a colored background generated from their name. The size is
 * now primarily controlled via a CSS variable `--avatar-size` for greater
 * flexibility.
 *
 * =============================================================================
 */
interface AvatarProps {
    src?: string | null; // URL de la imagen de perfil / Profile picture URL
    firstName: string; // Nombre del usuario / User's first name
    lastName: string; // Apellido del usuario / User's last name
    size?: number; // Tamaño del avatar. Se usa para la variable CSS. / Avatar size. Used for the CSS variable.
    onClick?: () => void; // Función al hacer click / Click handler function
    className?: string; // Clases CSS adicionales / Additional CSS classes
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    firstName,
    lastName,
    size,
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

    // Estilos dinámicos: ahora solo para el color de fondo y la variable de tamaño.
    // Dynamic styles: now only for background color and the size variable.
    const dynamicStyles: React.CSSProperties = {
        backgroundColor: showImage ? "transparent" : backgroundColor,
    };

    // Si se proporciona un tamaño, se pasa como una variable CSS.
    // If a size is provided, it's passed as a CSS variable.
    if (size) {
        dynamicStyles["--avatar-size"] = `${size}px`;
    }

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