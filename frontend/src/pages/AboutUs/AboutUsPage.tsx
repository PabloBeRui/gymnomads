/**
 * =============================================================================
 * COMPONENTE: AboutUsPage
 * COMPONENT: AboutUsPage
 * =============================================================================
 *
 * Página que muestra la información "Sobre Nosotros" de Gymnomads.
 * Rediseñada con un estilo moderno de secciones alternas (Zig-Zag) e imágenes
 * ilustrativas, manteniendo el texto original.
 *
 * Page that displays the Gymnomads "About Us" information.
 * Redesigned with a modern alternating section style (Zig-Zag) and illustrative
 * images, preserving the original text.
 *
 * =============================================================================
 */

import { useNavigate } from "react-router-dom";
import { CloseButton } from "../../components/ui/CloseButton";
import styles from "./AboutUsPage.module.scss";
import clsx from "clsx";

export const AboutUsPage = () => {
  const navigate = useNavigate();

  const handleBackdropClick = () => {
    navigate(-1);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.pageContainer} onClick={handleContainerClick}>
        
        {/* Cabecera Fija */}
        <div className={styles.headerSection}>
          <CloseButton
            onClick={() => navigate(-1)}
            className={styles.closeButton}
            color="#FFB700"
            ariaLabel="Cerrar página"
          />
          <h1 className={styles.title}>Quiénes Somos</h1>
        </div>

        <div className={styles.contentWrapper}>
          
          {/* Sección 1: Nuestra Misión (Texto Izquierda / Imagen Derecha en Desktop) */}
          <div className={styles.sectionRow}>
            <div className={styles.textCol}>
              <h2>Nuestra Misión</h2>
              <p>
                En Gymnomads, creemos que tu salud y bienestar no deberían tener
                fronteras. Nuestra misión es simple: darte la libertad de entrenar,
                donde sea que te lleven tus viajes.
              </p>
              <p>
                Conectamos una red de gimnasios independientes y asociados. Tu carnet
                de socio te da acceso a toda la red. Si eres socio de un gimnasio de
                nuestra red, eres socio de todos.
              </p>
            </div>
            <div className={styles.imageCol}>
              <img 
                src="/images/about-us-page/nuestra-mision.png" 
                alt="Nuestra misión global" 
                className={styles.sectionImage} 
              />
            </div>
          </div>

          {/* Sección 2: El Problema (Imagen Izquierda / Texto Derecha en Desktop - Reversed) */}
          <div className={clsx(styles.sectionRow, styles.reversed)}>
            <div className={styles.textCol}>
              <h2>El Problema que Solucionamos</h2>
              <p>
                ¿Viajas por trabajo? ¿Te vas de fin de semana? Tu rutina de
                entrenamiento no debería interrumpirse. Gymnomads elimina esa barrera.
              </p>
            </div>
            <div className={styles.imageCol}>
              <img 
                src="/images/about-us-page/problema-que-solucionamos.png" 
                alt="Solución a los viajes" 
                className={styles.sectionImage} 
              />
            </div>
          </div>

          {/* Sección 3: Cómo Funciona (Texto Izquierda / Imagen Derecha en Desktop) */}
          <div className={styles.sectionRow}>
            <div className={styles.textCol}>
              <h2>Cómo Funciona</h2>
              <ol>
                <li>
                  <strong>Únete:</strong> Regístrate en nuestra plataforma y verifica
                  tu membresía en uno de nuestros gimnasios asociados.
                </li>
                <li>
                  <strong>Explora:</strong> Usa nuestro mapa para encontrar gimnasios
                  de la red en tu ciudad de destino.
                </li>
                <li>
                  <strong>Visita:</strong> Ve al gimnasio, genera un código QR de
                  visita desde nuestra app, muéstralo en la recepción y... ¡a
                  entrenar!
                </li>
              </ol>
            </div>
            <div className={styles.imageCol}>
              <img 
                src="/images/about-us-page/como-funciona.png" 
                alt="Cómo funciona la app" 
                className={styles.sectionImage} 
              />
            </div>
          </div>

        </div>

        <div className={styles.disclaimer}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de marcador
          de posición. El contenido es ficticio y ha sido generado para simular
          la página "Sobre Nosotros" de este proyecto académico.
        </div>

      </div>
    </div>
  );
};