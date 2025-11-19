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

  useEffect(() => {
    const timers: number[] = [];
    const steps = [
      () => setAnimationStep(1),
      () => setAnimationStep(2),
      () => setAnimationStep(3),
    ];

    let delay = 800;
    steps.forEach((step, index) => {
      timers[index] = setTimeout(step, delay);
      delay += 600;
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={clsx(styles.slide, { [styles.transparent]: transparentBg })}>
      <h1 className={styles.brandName}>GymNomads</h1>

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
