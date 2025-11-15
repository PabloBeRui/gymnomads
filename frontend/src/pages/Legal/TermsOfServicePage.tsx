/**
 * =============================================================================
 * COMPONENTE: TermsOfServicePage
 * COMPONENT: TermsOfServicePage
 * =============================================================================
 *
 * Página que muestra los Términos y Condiciones de Gymnomads.
 * Utiliza el layout reutilizable `LegalPageLayout` para mantener la consistencia
 * visual con otras páginas legales.
 *
 * Page that displays the Gymnomads Terms and Conditions.
 * It uses the reusable `LegalPageLayout` to maintain visual consistency
 * with other legal pages.
 *
 * =============================================================================
 */

import { LegalPageLayout } from "../../components/layout/LegalPageLayout";

// Estilo para el bloque de descargo de responsabilidad
// Style for the disclaimer block
const disclaimerStyle: React.CSSProperties = {
  backgroundColor: "#fffbe6",
  border: "1px solid #ffe58f",
  padding: "15px",
  borderRadius: "4px",
  marginTop: "20px",
  fontSize: "0.9rem",
  color: "#6d4f00",
  textAlign: "left",
};

export const TermsOfServicePage = () => {
  return (
    <LegalPageLayout title="Términos y Condiciones">
      <>
        <p>
          <strong>Última actualización:</strong> 15 de noviembre de 2025
        </p>
        <p>
          Estos Términos de Servicio ("Términos") constituyen un acuerdo
          legalmente vinculante entre usted y Gymnomads S.L. ("Gymnomads",
          "nosotros") que rige su acceso y uso de la plataforma Gymnomads y
          todos los servicios asociados.
        </p>

        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al crear una cuenta de Gymnomads o al usar cualquier servicio
          proporcionado por nosotros, usted acepta estar sujeto a estos
          Términos. Si no está de acuerdo con estos Términos, no debe
          registrarse ni utilizar los servicios de Gymnomads.
        </p>

        <h2>2. Descripción del Servicio</h2>
        <p>
          Gymnomads proporciona una plataforma tecnológica que permite a los
          miembros activos de gimnasios asociados ("Socios") acceder y utilizar
          las instalaciones de otros gimnasios dentro de la red Gymnomads
          ("Gimnasios de Destino"), sujeto a las políticas de cada centro.
        </p>

        <h2>3. Cuentas de Usuario</h2>
        <p>
          Para usar la plataforma, debe registrarse y mantener una cuenta
          activa. Usted acepta:
        </p>
        <ul>
          <li>
            Proporcionar información precisa, actual y completa durante el
            proceso de registro.
          </li>
          <li>
            Mantener la confidencialidad y seguridad de la contraseña de su
            cuenta.
          </li>
          <li>
            Ser el único responsable de toda la actividad que ocurra bajo su
            cuenta.
          </li>
          <li>
            Ser un miembro activo y al corriente de pago en su "Gimnasio de
            Origen". Si su membresía en el gimnasio de origen caduca o es
            suspendida, su acceso a la red Gymnomads será automáticamente
            suspendido.
          </li>
        </ul>

        <h2>4. Reglas de Uso</h2>
        <p>
          Al visitar un Gimnasio de Destino, usted acepta cumplir con todas las
          normas, reglamentos y políticas de dicho gimnasio. Gymnomads no se
          hace responsable de las instalaciones, el equipamiento o las acciones
          del personal de los gimnasios asociados.
        </p>

        <h2>5. Limitación de Responsabilidad</h2>
        <p>
          Usted entiende y acepta que el uso de las instalaciones de los
          gimnasios conlleva un riesgo inherente de lesión. Gymnomads actúa
          únicamente como intermediario tecnológico y no será responsable de
          ninguna lesión, pérdida o daño que pueda sufrir en las instalaciones
          de un gimnasio asociado.
        </p>

        <div style={disclaimerStyle}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de marcador
          de posición. No representa Términos de Servicio reales y está
          incompleto. Para un lanzamiento de producción, este documento debe ser
          redactado por un asesor legal.
        </div>
      </>
    </LegalPageLayout>
  );
};
