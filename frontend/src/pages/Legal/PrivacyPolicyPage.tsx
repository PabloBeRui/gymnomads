/**
 * =============================================================================
 * COMPONENTE: PrivacyPolicyPage
 * COMPONENT: PrivacyPolicyPage
 * =============================================================================
 *
 * Página que muestra la Política de Privacidad de Gymnomads.
 * Utiliza el layout reutilizable `LegalPageLayout` para mantener la consistencia
 * visual con otras páginas legales.
 *
 * Page that displays the Gymnomads Privacy Policy.
 * It uses the reusable `LegalPageLayout` to maintain visual consistency
 * with other legal pages.
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

export const PrivacyPolicyPage = () => {
  return (
    <LegalPageLayout title="Política de Privacidad">
      <>
        <p>
          <strong>Última actualización:</strong> 15 de noviembre de 2025
        </p>
        <p>
          Bienvenido a Gymnomads. Tu privacidad es de suma importancia para
          nosotros. Esta Política de Privacidad describe cómo recopilamos,
          usamos, procesamos y divulgamos tu información, incluida la
          información personal, en conjunto con tu acceso y uso de la
          Plataforma Gymnomads.
        </p>

        <h2>1. Información que Recopilamos</h2>
        <p>
          Hay tres categorías generales de información que recopilamos.
        </p>
        <h3>1.1. Información que nos proporcionas.</h3>
        <p>
          Recopilamos la información que compartes con nosotros cuando
          utilizas la Plataforma Gymnomads.
        </p>
        <ul>
          <li>
            <strong>Información de la Cuenta:</strong> Al registrarte, te
            pedimos tu nombre, apellidos, dirección de correo electrónico,
            número de teléfono y gimnasio de origen.
          </li>
          <li>
            <strong>Información de Perfil:</strong> Puedes optar por
            proporcionar información adicional como una foto de perfil.
          </li>
          <li>
            <strong>Comunicaciones:</strong> Cuando te comunicas con Gymnomads,
            recopilamos información sobre tu comunicación y cualquier
            información que decidas proporcionar.
          </li>
        </ul>
        <h3>
          1.2. Información que recopilamos automáticamente de tu uso de la
          Plataforma.
        </h3>
        <p>
          Cuando utilizas la Plataforma Gymnomads, recopilamos
          automáticamente información sobre los servicios que utilizas y cómo
          los utilizas.
        </p>
        <ul>
          <li>
            <strong>Datos de Registro y Visitas:</strong> Recopilamos las
            fechas y horas de tus visitas a los gimnasios de la red, así
            como las interacciones con la plataforma.
          </li>
          <li>
            <strong>Cookies y Tecnologías Similares:</strong> Usamos cookies
            como se describe en nuestra Política de Cookies.
          </li>
        </ul>

        <h2>2. Cómo Usamos la Información que Recopilamos</h2>
        <p>
          Utilizamos, almacenamos y procesamos información sobre ti para
          proporcionar, comprender, mejorar y desarrollar la Plataforma
          Gymnomads, crear y mantener un entorno de confianza y más seguro y
          cumplir con nuestras obligaciones legales.
        </p>
        <ul>
          <li>
            <strong>Proveer y Mejorar el Servicio:</strong> Para operar la
            plataforma, autenticar tu cuenta, y permitir el registro de tus
            visitas en la red de gimnasios.
          </li>
          <li>
            <strong>Mantener la Seguridad:</strong> Para detectar y prevenir
            fraudes, abusos y garantizar la seguridad de nuestros usuarios.
          </li>
        </ul>

        <h2>3. Intercambio y Divulgación</h2>
        <p>
          Tu información es compartida de forma limitada para hacer que la
          plataforma funcione:
        </p>
        <ul>
          <li>
            <strong>Con Gimnasios Asociados:</strong> Cuando registras una
            visita en un gimnasio de destino, compartimos tu información
            básica (nombre, gimnasio de origen) con el mánager de dicho
            gimnasio para verificar tu membresía. Tu gimnasio de origen
            también es notificado de tu visita.
          </li>
          <li>
            <strong>Cumplimiento Legal:</strong> No compartiremos tu
            información personal con terceros sin tu consentimiento, excepto
            en las circunstancias descritas en esta política o si estamos
            obligados por ley.
          </li>
        </ul>

        <h2>4. Tus Derechos (ARCO/GDPR)</h2>
        <p>
          Tienes derecho a acceder, rectificar, cancelar y oponerte al
          tratamiento de tus datos personales (derechos ARCO), así como
          otros derechos reconocidos por el GDPR (Reglamento General de
          Protección de Datos), como el derecho a la portabilidad y al
          olvido. Puedes ejercer estos derechos directamente desde tu página
          de Perfil o contactándonos en legal@gymnomads.com.
        </p>

        <div style={disclaimerStyle}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de
          marcador de posición y no constituye una política de privacidad
          legalmente válida. Está diseñado para simular el contenido de la
          página para este proyecto académico.
        </div>
      </>
    </LegalPageLayout>
  );
};