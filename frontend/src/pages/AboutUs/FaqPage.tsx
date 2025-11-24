/**
 * =============================================================================
 * COMPONENTE: FaqPage
 * COMPONENT: FaqPage
 * =============================================================================
 *
 * Página que muestra las Preguntas Frecuentes (FAQ) de Gymnomads.
 * Rediseñada con estilo "Zig-Zag" moderno e imágenes ilustrativas.
 *
 * Page that displays the Gymnomads Frequently Asked Questions (FAQ).
 * Redesigned with modern "Zig-Zag" style and illustrative images.
 *
 * =============================================================================
 */

import { useNavigate } from "react-router-dom";
import { CloseButton } from "../../components/ui/CloseButton";
import styles from "./FaqPage.module.scss";
import clsx from "clsx";

export const FaqPage = () => {
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
          <h1 className={styles.title}>Preguntas Frecuentes</h1>
        </div>

        <div className={styles.contentWrapper}>
          {/* Sección 1: Para Socios (Texto Izquierda / Imagen Derecha en Desktop) */}
          <div className={styles.sectionRow}>
            <div className={styles.textCol}>
              <h2>Para Socios</h2>

              <h4>¿Tiene algún coste adicional usar Gymnomads?</h4>
              <p>
                <strong>No</strong>. El servicio Gymnomads es un beneficio
                incluido en tu abono de socio en cualquiera de nuestros
                gimnasios asociados. No hay costes por visita ni tarifas
                ocultas.
              </p>

              <h4>¿Cuántas veces puedo visitar otros gimnasios?</h4>
              <p>
                Actualmente, tu abono te permite visitar otros gimnasios de la
                red hasta un máximo de <strong>10</strong> veces por mes
                calendario.
              </p>

              <h4>¿Puedo visitar cualquier gimnasio?</h4>
              <p>
                Puedes visitar cualquier gimnasio de la red cuya ciudad sea{" "}
                <strong>distinta</strong> a la de origen.
              </p>
            </div>
            <div className={styles.imageCol}>
              <img
                src="/images/faq-page/para-socios.png"
                alt="Preguntas frecuentes para socios"
                className={styles.sectionImage}
              />
            </div>
          </div>

          {/* Sección 2: Para Gimnasios (Imagen Izquierda / Texto Derecha en Desktop - Reversed) */}
          <div className={clsx(styles.sectionRow, styles.reversed)}>
            <div className={styles.textCol}>
              <h2>Para Gimnasios</h2>

              <h4>¿Cómo se une mi gimnasio a la red Gymnomads?</h4>
              <p>
                <strong>¡Nos encantaría hablar contigo!</strong> El primer paso
                es ponerte en contacto con nuestro equipo a través de este{" "}
                <strong>enlace</strong>. Analizaremos tu solicitud, tus
                instalaciones y te explicaremos el modelo de compensación.
              </p>

              <h4>¿Cómo gestiono las visitas que recibo?</h4>
              <p>
                Al unirte, recibirás acceso a un panel de Mánager en esta misma
                plataforma. Desde allí, podrás ver en tiempo real todas las
                visitas de socios Gymnomads relacionadas con tu gimnasio y
                gestionar el perfil de tu gimnasio.
              </p>
            </div>
            <div className={styles.imageCol}>
              <img
                src="/images/faq-page/para-gimnasios.png"
                alt="Preguntas frecuentes para gimnasios"
                className={styles.sectionImage}
              />
            </div>
          </div>
        </div>

        <div className={styles.disclaimer}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de marcador
          de posición generado para este proyecto académico.
        </div>
      </div>
    </div>
  );
};
