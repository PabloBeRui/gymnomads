/**
 * =============================================================================
 * COMPONENTE: CookiesPolicyPage
 * COMPONENT: CookiesPolicyPage
 * =============================================================================
 *
 * Página que muestra la Política de Cookies de Gymnomads.
 * Utiliza el layout reutilizable `LegalPageLayout` para mantener la consistencia
 * visual con otras páginas legales.
 *
 * Page that displays the Gymnomads Cookies Policy.
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

export const CookiesPolicyPage = () => {
  return (
    <LegalPageLayout title="Política de Cookies">
      <>
        <p>
          <strong>Última actualización:</strong> 15 de noviembre de 2025
        </p>
        <p>
          Esta Política de Cookies explica qué son las cookies y cómo las
          utilizamos en la plataforma Gymnomads (en adelante, "la Plataforma"). Le
          recomendamos que lea esta política para entender qué tipo de cookies
          utilizamos, la información que recopilamos y cómo se utiliza esa
          información.
        </p>

        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en su
          navegador o dispositivo (ordenador, teléfono móvil, tableta) cuando
          visita un sitio web. Se utilizan ampliamente para "recordar" sus
          preferencias, ya sea para una sola visita (a través de una "cookie
          de sesión") o para múltiples visitas repetidas (usando una "cookie
          persistente").
        </p>

        <h2>2. ¿Cómo utilizamos las cookies?</h2>
        <p>Utilizamos cookies para varios propósitos esenciales:</p>
        <ul>
          <li>
            <strong>Cookies Esenciales/Técnicas:</strong> Son estrictamente
            necesarias para el funcionamiento de la Plataforma. Sin ellas,
            servicios como el inicio de sesión o el registro de visitas no
            podrían funcionar. Esto también incluye el `localStorage` que
            usamos para guardar su preferencia de consentimiento.
          </li>
          <li>
            <strong>Cookies de Analítica/Rendimiento:</strong> Si usted acepta,
            utilizamos una cookie (`analytics_enabled`) para recopilar
            información anónima sobre cómo los visitantes utilizan nuestro
            sitio web. Esto nos ayuda a entender qué páginas son más
            populares y cómo podemos mejorar la aplicación.
          </li>
          <li>
            <strong>Cookies de Funcionalidad:</strong> Se utilizan para
            recordar elecciones que ha hecho (como su nombre de usuario) y
            proporcionar características más personales.
          </li>
        </ul>
        
        <h2>3. Cookies Específicas que Usamos</h2>
        <ul>
          <li>
            <strong>gymnomads_cookie_consent (`localStorage`):</strong> Almacena
            su elección (aceptada o rechazada) sobre el consentimiento de
            cookies. Es una cookie técnica esencial y no se utiliza si usted
            la rechaza (ya que simplemente no se crea).
          </li>
          <li>
            <strong>analytics_enabled (`cookie`):</strong> Se almacena solo si
            usted "Acepta" en nuestro modal de consentimiento. Nos permite
            contar visitas de forma anónima. Caduca después de 1 año.
          </li>
        </ul>

        <h2>4. Control de Cookies</h2>
        <p>
          Al visitar nuestro sitio por primera vez, se le presenta un modal
          para aceptar o rechazar el uso de cookies no esenciales. Puede
          cambiar sus preferencias en cualquier momento (aunque esta
          funcionalidad de "re-consentimiento" no está implementada en esta
          versión del proyecto).
        </p>
        <p>
          Además, puede configurar su navegador para rechazar todas las
          cookies o para que le indique cuándo se envía una cookie. Sin
          embargo, si deshabilita las cookies esenciales, es posible que
          algunas partes de nuestra Plataforma no funcionen correctamente.
        </p>

        <div style={disclaimerStyle}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de
          marcador de posición. Para un lanzamiento de producción real, este
          contenido debe ser redactado y validado por un asesor legal para
          cumplir plenamente con el GDPR, la LSSI y otras regulaciones de
          privacidad aplicables.
        </div>
      </>
    </LegalPageLayout>
  );
};