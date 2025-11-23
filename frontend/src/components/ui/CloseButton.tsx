/**
 * =============================================================================
 * COMPONENTE: CloseButton (Animado)
 * COMPONENT:  CloseButton (Animated)
 * =============================================================================
 *
 * @description Botón de cierre reutilizable y animado que usa un icono SVG.
 * Al hacer clic, ejecuta una animación de "desaparición" antes de llamar
 * a la función `onClick`.
 * 
 * @description Reusable and animated close button using an SVG icon.
 * On click, it performs a "disappearing" animation before calling the
 * `onClick` function.
 *
 * @props {() => void} onClick - La función a ejecutar después de la animación de cierre.
 * @props {string} [color='#1A202C'] - El color del trazo (stroke) del icono SVG.
 * @props {number} [size=30] - El tamaño (ancho y alto) del icono SVG en píxeles.
 * @props {string} [className] - Clases CSS adicionales para posicionamiento.
 * @props {string} [ariaLabel='Cerrar'] - Etiqueta de accesibilidad.
 * =============================================================================
 */
import React, { useState } from 'react';
import styles from './CloseButton.module.scss';
import clsx from 'clsx';

interface CloseButtonProps {
  onClick: () => void;
  color?: string;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  color = '#FFB700', // Cambiar por defecto al color primario (#FFB700) // Change default to primary color (#FFB700)
  size = 30,
  className,
  ariaLabel = 'Cerrar',
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClick = () => {
    // 1. Activar el estado de cierre para aplicar la clase de animación
    // 1. Activate closing state to apply the animation class
    setIsClosing(true);

    // 2. Esperar a que la animación termine (300ms) antes de llamar a la función onClick
    // 2. Wait for the animation to finish (300ms) before calling the onClick function
    setTimeout(() => {
      onClick();
      // 3. Resetear el estado por si el componente se reutiliza sin desmontarse
      // 3. Reset the state in case the component is reused without unmounting
      setIsClosing(false);
    }, 300);
  };

  return (
    <button
      className={clsx(styles.closeButton, className)}
      onClick={handleClick}
      aria-label={ariaLabel}
      disabled={isClosing} // Deshabilitar el botón durante la animación // Disable button during animation
    >
      <div
        className={clsx(styles.iconContainer, { [styles.closing]: isClosing })}
        style={{ width: size, height: size }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 30 30"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeMiterlimit="10"
        >
          {/* Este SVG ahora forma una 'X' directamente, sin necesitar rotación inicial. */}
          {/* This SVG now forms an 'X' directly, without needing initial rotation. */}
          <line x1="6" y1="6" x2="24" y2="24" />
          <line x1="24" y1="6" x2="6" y2="24" />
        </svg>
      </div>
    </button>
  );
};