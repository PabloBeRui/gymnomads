/**
 * =============================================================================
 * COMPONENTE: AboutUsPage
 * COMPONENT: AboutUsPage
 * =============================================================================
 *
 * Página que muestra la información "Sobre Nosotros" de Gymnomads.
 * Utiliza el layout reutilizable `LegalPageLayout` para mantener la consistencia
 * visual con otras páginas legales e informativas.
 * Refactorizado para usar SASS Modules.
 *
 * Page that displays the Gymnomads "About Us" information.
 * It uses the reusable `LegalPageLayout` to maintain visual consistency
 * with other legal and informational pages.
 * Refactored to use SASS Modules.
 *
 * =============================================================================
 */

import { LegalPageLayout } from "../../components/layout/LegalPageLayout";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./AboutUsPage.module.scss";
// import clsx from "clsx"; // Importar clsx / Import clsx

export const AboutUsPage = () => {
  return (
    <LegalPageLayout title="Quiénes Somos">
      <>
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

        <h2>El Problema que Solucionamos</h2>
        <p>
          ¿Viajas por trabajo? ¿Te vas de fin de semana? Tu rutina de
          entrenamiento no debería interrumpirse. Gymnomads elimina esa barrera.
        </p>

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

        <div className={styles.disclaimer}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de marcador
          de posición. El contenido es ficticio y ha sido generado para simular
          la página "Sobre Nosotros" de este proyecto académico.
        </div>
      </>
    </LegalPageLayout>
  );
};
