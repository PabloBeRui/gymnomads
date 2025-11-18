/**
 * =============================================================================
 * COMPONENTE: FaqPage
 * COMPONENT: FaqPage
 * =============================================================================
 *
 * Página que muestra las Preguntas Frecuentes (FAQ) de Gymnomads.
 * Utiliza el layout reutilizable `LegalPageLayout`.
 * Refactorizado para usar SASS Modules.
 *
 * Page that displays the Gymnomads Frequently Asked Questions (FAQ).
 * It uses the reusable `LegalPageLayout`.
 * Refactored to use SASS Modules.
 *
 * =============================================================================
 */

import { LegalPageLayout } from "../../components/layout/LegalPageLayout";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./FaqPage.module.scss";
// import clsx from "clsx"; // Importar clsx / Import clsx

export const FaqPage = () => {
  return (
    <LegalPageLayout title="Preguntas Frecuentes">
      <>
        <h2>Para Socios</h2>

        <h4>¿Tiene algún coste adicional usar Gymnomads?</h4>
        <p className={styles.answer}>
          No. El servicio Gymnomads es un beneficio incluido en tu{" "}
          <strong>abono</strong>
          de socio en cualquiera de nuestros gimnasios asociados. No hay costes
          por visita ni tarifas ocultas.
        </p>

        <h4>¿Cuántas veces puedo visitar otros gimnasios?</h4>
        <p className={styles.answer}>
          Actualmente, tu <strong>abono</strong> te permite visitar otros
          gimnasios de la red hasta un máximo de 10 veces por mes calendario.
        </p>

        <h4>¿Puedo visitar cualquier gimnasio?</h4>
        <p className={styles.answer}>Puedes visitar cualquier gimnasio de la red cuya ciudad sea distinta a la de origen.</p>

        <h2>Para Gimnasios</h2>

        <h4>¿Cómo se une mi gimnasio a la red Gymnomads?</h4>
        <p className={styles.answer}>
          ¡Nos encantaría hablar contigo! El primer paso es ponerte en contacto
          con nuestro equipo a través del enlace en la página "Únete a
          Gymnomads". Analizaremos tu solicitud, tus instalaciones y te
          explicaremos el modelo de compensación.
        </p>

        <h4>¿Cómo gestiono las visitas que recibo?</h4>
        <p className={styles.answer}>
          Al unirte, recibirás acceso a un panel de Mánager en esta misma
          plataforma. Desde allí, podrás ver en tiempo real todas las visitas de
          socios Gymnomads, exportar informes y gestionar el perfil de tu
          gimnasio.
        </p>

        <div className={styles.disclaimer}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de marcador
          de posición generado para este proyecto académico.
        </div>
      </>
    </LegalPageLayout>
  );
};
