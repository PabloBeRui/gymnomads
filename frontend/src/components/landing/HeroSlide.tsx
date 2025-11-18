/**
 * =============================================================================
 * COMPONENTE: HeroSlide
 * COMPONENT:  HeroSlide
 * =============================================================================
 *
 * Descripción: La primera diapositiva (Hero) de la landing page.
 * Muestra el nombre de la marca y anima el lema "Viaja. Entrena. Repite."
 * en una secuencia de tres pasos. Refactorizado con SASS Modules.
 *
 * Description: The first slide (Hero) of the landing page.
 * Displays the brand name and animates the tagline "Travel. Train. Repeat."
 * in a three-step sequence. Refactored with SASS Modules.
 *
 * =============================================================================
 */

import React, { useState, useEffect } from "react";
import styles from "./HeroSlide.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

export const HeroSlide: React.FC = () => {
  // Estado para controlar el paso de la animación (0=inicio, 1=Viaja, 2=Entrena, 3=Repite)
  // State to control the animation step (0=start, 1=Travel, 2=Train, 3=Repeat)
  const [animationStep, setAnimationStep] = useState(0);

  // useEffect para manejar la secuencia de la animación
  // useEffect to manage the animation sequence
  useEffect(() => {
    const timers: number[] = [];

    // Definir la secuencia de pasos
    // Define the sequence of steps
    const steps = [
      () => setAnimationStep(1), // Paso 1: Mostrar "Viaja" / Step 1: Show "Viaja"
      () => setAnimationStep(2), // Paso 2: Mostrar "Entrena" / Step 2: Show "Entrena"
      () => setAnimationStep(3), // Paso 3: Mostrar "Repite" / Step 3: Show "Repite"
    ];

    // Iniciar los temporizadores en secuencia
    // Start timers in sequence
    // Retraso inicial (ej. 800ms) + retraso entre palabras (ej. 600ms)
    // Initial delay (e.g., 800ms) + delay between words (e.g., 600ms)
    let delay = 800;
    steps.forEach((step, index) => {
      timers[index] = setTimeout(step, delay);
      delay += 600;
    });

    // Función de limpieza / Cleanup function
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []); // El array vacío [] asegura que esto solo se ejecute una vez / The empty array [] ensures this runs only once

  return (
    <div className={styles.slide}>
      <h1 className={styles.brandName}>GymNomads</h1>

      <div className={styles.taglineContainer}>
        {/* VIAJA */}
        <span
          className={clsx(styles.taglineWord, {
            [styles.taglineWordVisible]: animationStep >= 1,
          })}
          style={{ transitionDelay: "0ms" }} // "Viaja" aparece primero / "Viaja" appears first
        >
          Viaja.
        </span>

        {/* ENTRENA */}
        <span
          className={clsx(styles.taglineWord, {
            [styles.taglineWordVisible]: animationStep >= 2,
          })}
          style={{ transitionDelay: "200ms" }} // "Entrena" aparece un poco después / "Entrena" appears a bit later
        >
          Entrena.
        </span>

        {/* REPITE */}
        <span
          className={clsx(styles.taglineWord, {
            [styles.taglineWordVisible]: animationStep >= 3,
          })}
          style={{ transitionDelay: "400ms" }} // "Repite" aparece al final / "Repite" appears at the end
        >
          Repite.
        </span>
      </div>
    </div>
  );
};
