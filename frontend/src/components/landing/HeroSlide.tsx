/**
 * =============================================================================
 * COMPONENTE: HeroSlide
 * COMPONENT:  HeroSlide
 * =============================================================================
 *
 * Descripción: La primera diapositiva (Hero) de la landing page.
 * Muestra el nombre de la marca y anima el lema.
 *
 * Description: The first slide (Hero) of the landing page.
 * Displays the brand name and animates the tagline.
 *
 * =============================================================================
 */
import React, { useState, useEffect } from "react";
import styles from "./HeroSlide.module.scss";
import clsx from "clsx";

interface HeroSlideProps {
    transparentBg?: boolean;
}

export const HeroSlide: React.FC<HeroSlideProps> = ({ transparentBg = true }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [gymColorAnimated, setGymColorAnimated] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const steps = [
      () => setGymColorAnimated(true), // Paso 0: Animar color de "Gym"
      () => setAnimationStep(1),      // Paso 1: "Viaja."
      () => setAnimationStep(2),      // Paso 2: "Entrena."
      () => setAnimationStep(3),      // Paso 3: "Repite."
    ];

    let delay = 500; // Delay inicial
    steps.forEach((step, index) => {
      timers[index] = setTimeout(step, delay);
      delay += 750; // Delay 25% más lento
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={clsx(styles.slide, { [styles.transparent]: transparentBg })}>
      <h1 className={styles.brandName}>
        <span className={clsx(styles.gym, { [styles.gymAnimated]: gymColorAnimated })}>
            Gym
        </span>
        <span className={styles.nomads}>Nomads</span>
      </h1>

      <div className={styles.taglineContainer}>
        <span
          className={clsx(styles.taglineWord, {
            [styles.taglineWordVisible]: animationStep >= 1,
          })}
          style={{ transitionDelay: "0ms" }}
        >
          Viaja.
        </span>

        <span
          className={clsx(styles.taglineWord, {
            [styles.taglineWordVisible]: animationStep >= 2,
          })}
          style={{ transitionDelay: "200ms" }}
        >
          Entrena.
        </span>

        <span
          className={clsx(styles.taglineWord, {
            [styles.taglineWordVisible]: animationStep >= 3,
          })}
          style={{ transitionDelay: "400ms" }}
        >
          Repite.
        </span>
      </div>
    </div>
  );
};
