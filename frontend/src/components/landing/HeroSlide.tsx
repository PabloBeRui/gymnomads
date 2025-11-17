/**
 * =============================================================================
 * COMPONENTE: HeroSlide
 * COMPONENT:  HeroSlide
 * =============================================================================
 *
 * Descripción: La primera diapositiva (Hero) de la landing page.
 * Muestra el nombre de la marca y anima el lema "Viaja. Entrena. Repite."
 * en una secuencia de tres pasos.
 *
 * Description: The first slide (Hero) of the landing page.
 * Displays the brand name and animates the tagline "Travel. Train. Repeat."
 * in a three-step sequence.
 *
 * =============================================================================
 */

import React, { useState, useEffect } from "react";

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  // 1. Estilos de la diapositiva (base)
  // 1. Slide styles (base)
  slide: {
    height: "100vh",
    width: "100%",
    scrollSnapAlign: "start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    boxSizing: "border-box",
    textAlign: "center",
    backgroundColor: "#ffffff", // Fondo blanco para la primera
  },
  // 2. Estilo para el nombre principal
  // 2. Style for the main brand name
  brandName: {
    fontSize: "clamp(3rem, 6vw, 5rem)",
    fontWeight: "bold",
    color: "#1a202c", // Oscuro
    margin: 0,
  },
  // 3. Contenedor para el lema animado
  // 3. Container for the animated tagline
  taglineContainer: {
    display: "flex",
    fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
    color: "#4a5568", // Gris medio
    marginTop: "1rem",
    gap: "1rem", // Espacio entre palabras
    height: "60px", // Altura fija para evitar "saltos"
    alignItems: "center",
  },
  // 4. Estilo para cada palabra del lema (base: invisible)
  // 4. Style for each tagline word (base: invisible)
  taglineWord: {
    opacity: 0,
    transform: "translateY(20px)",
    transition: "opacity 0.8s ease, transform 0.8s ease",
  },
  // 5. Estilo para la palabra visible
  // 5. Style for the visible word
  taglineWordVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
};

/* =============================================================================
    COMPONENTE: HeroSlide
    COMPONENT:  HeroSlide
    ============================================================================= */
export const HeroSlide: React.FC = () => {
  // Estado para controlar el paso de la animación (0=inicio, 1=Viaja, 2=Entrena, 3=Repite)
  // State to control the animation step (0=start, 1=Travel, 2=Train, 3=Repeat)
  const [animationStep, setAnimationStep] = useState(0);

  // useEffect para manejar la secuencia de la animación
  // useEffect to manage the animation sequence
  useEffect(() => {
    // --- INICIO DE LA CORRECCIÓN ---
    // --- START OF FIX ---

    // En el navegador, setTimeout devuelve un 'number', no un 'NodeJS.Timeout'
    // In the browser, setTimeout returns a 'number', not a 'NodeJS.Timeout'
    const timers: number[] = [];

    // --- FIN DE LA CORRECCIÓN ---

    // Definir la secuencia de pasos
    // Define the sequence of steps
    const steps = [
      () => setAnimationStep(1), // Paso 1: Mostrar "Viaja"
      () => setAnimationStep(2), // Paso 2: Mostrar "Entrena"
      () => setAnimationStep(3), // Paso 3: Mostrar "Repite"
    ];

    // Iniciar los temporizadores en secuencia
    // Start timers in sequence
    // Retraso inicial (ej. 800ms) + retraso entre palabras (ej. 600ms)
    // Initial delay (e.g., 800ms) + delay between words (e.g., 600ms)
    let delay = 800;
    steps.forEach((step, index) => {
      // setTimeout es una API de navegador, aquí su ID es un número
      // setTimeout is a browser API, here its ID is a number
      timers[index] = setTimeout(step, delay);
      delay += 600;
    });

    // Función de limpieza
    // Cleanup function
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []); // El array vacío [] asegura que esto solo se ejecute una vez

  return (
    <div style={styles.slide}>
      <h1 style={styles.brandName}>GymNomads</h1>

      <div style={styles.taglineContainer}>
        {/* VIAJA */}
        <span
          style={{
            ...styles.taglineWord,
            ...(animationStep >= 1 ? styles.taglineWordVisible : {}),
            transitionDelay: "0ms", // "Viaja" aparece primero
          }}>
          Viaja.
        </span>

        {/* ENTRENA */}
        <span
          style={{
            ...styles.taglineWord,
            ...(animationStep >= 2 ? styles.taglineWordVisible : {}),
            transitionDelay: "200ms", // "Entrena" aparece un poco después
          }}>
          Entrena.
        </span>

        {/* REPITE */}
        <span
          style={{
            ...styles.taglineWord,
            ...(animationStep >= 3 ? styles.taglineWordVisible : {}),
            transitionDelay: "400ms", // "Repite" aparece al final
          }}>
          Repite.
        </span>
      </div>
    </div>
  );
};
