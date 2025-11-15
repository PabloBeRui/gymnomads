/**
 * =============================================================================
 * COMPONENTE: LegalNoticePage
 * COMPONENT: LegalNoticePage
 * =============================================================================
 *
 * Página que muestra el Aviso Legal de Gymnomads.
 * Utiliza el layout reutilizable `LegalPageLayout` para mantener la consistencia
 * visual con otras páginas legales.
 *
 * Page that displays the Gymnomads Legal Notice.
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

export const LegalNoticePage = () => {
  return (
    <LegalPageLayout title="Aviso Legal">
      <>
        <p>
          <strong>Última actualización:</strong> 15 de noviembre de 2025
        </p>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de
          Servicios de la Sociedad de la Información y Comercio Electrónico
          (LSSICE), a continuación se exponen los datos identificativos del
          titular de esta plataforma (en adelante, "Gymnomads").
        </p>

        <h2>1. Datos del Titular (Marcador de Posición)</h2>
        <ul>
          <li>
            <strong>Denominación Social:</strong> Gymnomads S.L. (Ficticia)
          </li>
          <li>
            <strong>CIF:</strong> B-12345678
          </li>
          <li>
            <strong>Domicilio Social:</strong> Calle Ficticia 123, 28080 Madrid,
            España
          </li>
          <li>
            <strong>Correo Electrónico de Contacto:</strong> legal@gymnomads.com
          </li>
          <li>
            <strong>Datos de Registro:</strong> Inscrita en el Registro
            Mercantil de Madrid, Tomo 0000, Folio 00, Hoja M-000000.
          </li>
        </ul>

        <h2>2. Propiedad Intelectual e Industrial</h2>
        <p>
          El código fuente, los diseños gráficos, las imágenes, las
          fotografías, los sonidos, las animaciones, el software, los textos,
          así como la información y los contenidos que se recogen en el
          presente sitio web (incluyendo la marca "Gymnomads") están
          protegidos por la legislación española sobre los derechos de
          propiedad intelectual e industrial a favor de Gymnomads S.L.
        </p>
        <p>
          No se permite la reproducción y/o publicación, total o parcial, del
          sitio web, ni su tratamiento informático, su distribución, su
          difusión, ni su modificación, transformación o descompilación, ni
          demás derechos legalmente reconocidos a su titular, sin el permiso
          previo y por escrito del mismo.
        </p>

        <h2>3. Limitación de Responsabilidad</h2>
        <p>
          Gymnomads no se hace responsable de los daños y perjuicios
          producidos o que puedan producirse, cualquiera que sea su
          naturaleza, que se deriven del uso de la información, de las
          materias contenidas en este sitio web y de los programas que
          incorpora. Los enlaces (links) e hipertexto que posibiliten, a
          través del sitio web, acceder al usuario a prestaciones y servicios
          ofrecidos por terceros, no pertenecen ni se encuentran bajo el
          control de Gymnomads.
        </p>

        <h2>4. Legislación Aplicable y Jurisdicción</h2>
        <p>
          Todas las disputas o reclamaciones surgidas de la interpretación o
          ejecución del presente aviso legal se regirán por la legislación
          española y se someterán a la jurisdicción de los Juzgados y
          Tribunales de la ciudad de Madrid.
        </p>

        <div style={disclaimerStyle}>
          <strong>Nota del Desarrollador:</strong> Este es un texto de
          marcador de posición. Toda la información (CIF, Razón Social,
          dirección) es ficticia y se utiliza únicamente para los fines de
          este proyecto académico. El contenido debe ser redactado y
          validado por un asesor legal antes de cualquier uso en producción.
        </div>
      </>
    </LegalPageLayout>
  );
};