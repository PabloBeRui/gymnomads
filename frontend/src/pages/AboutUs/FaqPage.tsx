/**
 * =============================================================================
 * COMPONENTE: FaqPage
 * COMPONENT: FaqPage
 * =============================================================================
 *
 * Página que muestra las Preguntas Frecuentes (FAQ) de Gymnomads.
 * Utiliza el layout reutilizable `LegalPageLayout`.
 *
 * Page that displays the Gymnomads Frequently Asked Questions (FAQ).
 * It uses the reusable `LegalPageLayout`.
 *
 * =============================================================================
 */

import { LegalPageLayout } from '../../components/layout/LegalPageLayout';

// Estilo para el bloque de descargo de responsabilidad
// Style for the disclaimer block
const disclaimerStyle: React.CSSProperties = {
  backgroundColor: '#fffbe6',
  border: '1px solid #ffe58f',
  padding: '15px',
  borderRadius: '4px',
  marginTop: '20px',
  fontSize: '0.9rem',
  color: '#6d4f00',
  textAlign: 'left',
};

// Estilo para la respuesta de la FAQ
// Style for the FAQ answer
const answerStyle: React.CSSProperties = {
  paddingLeft: '1.5rem',
  borderLeft: '3px solid #007bff',
  color: '#333',
  margin: '0.5rem 0 1.5rem 0',
};

export const FaqPage = () => {
  return (
    <LegalPageLayout title="Preguntas Frecuentes">
      <>
        <h2>Para Socios</h2>
        
        <h4>¿Tiene algún coste adicional usar Gymnomads?</h4>
        <p style={answerStyle}>
          No. El servicio Gymnomads es un beneficio incluido en tu <strong>abono</strong>
          de socio en cualquiera de nuestros gimnasios asociados. No hay
          costes por visita ni tarifas ocultas.
        </p>

        <h4>¿Cuántas veces puedo visitar otros gimnasios?</h4>
        <p style={answerStyle}>
          Actualmente, tu <strong>abono</strong> te permite visitar otros gimnasios de la
          red hasta un máximo de 5 veces por mes calendario.
        </p>
        
        <h4>¿Puedo visitar cualquier gimnasio, incluso en mi propia ciudad?</h4>
        <p style={answerStyle}>
          Puedes visitar cualquier gimnasio de la red.
        </p>

        <h2>Para Gimnasios</h2>

        <h4>¿Cómo se une mi gimnasio a la red Gymnomads?</h4>
        <p style={answerStyle}>
          ¡Nos encantaría hablar contigo! El primer paso es ponerte en
          contacto con nuestro equipo a través del enlace en la página
          "Únete a Gymnomads". Analizaremos tu solicitud, tus instalaciones y
          te explicaremos el modelo de compensación.
        </p>

        <h4>¿Cómo gestiono las visitas que recibo?</h4>
        <p style={answerStyle}>
          Al unirte, recibirás acceso a un panel de Mánager en esta misma
          plataforma. Desde allí, podrás ver en tiempo real todas las
          visitas de socios Gymnomads, exportar informes y gestionar el
          perfil de tu gimnasio.
        </p>

        <div style={disclaimerStyle}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de
          marcador de posición generado para este proyecto académico.
        </div>
      </>
    </LegalPageLayout>
  );
};