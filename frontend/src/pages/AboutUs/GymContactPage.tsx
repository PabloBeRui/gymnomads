/**
 * =============================================================================
 * COMPONENTE: GymContactPage
 * COMPONENT: GymContactPage
 * =============================================================================
 *
 * Descripción: Página con un formulario para que los gimnasios interesados
 * puedan contactar para unirse a la red Gymnomads.
 * Refactorizado para usar el hook personalizado useEmail y el CloseButton animado.
 *
 * Description: Page with a form for interested gyms to contact
 * to join the Gymnomads network.
 * Refactored to use the custom useEmail hook and animated CloseButton.
 *
 * =============================================================================
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { CloseButton } from "../../components/ui/CloseButton";
import { useNavigate } from "react-router-dom";
import { useEmail } from "../../hooks/useEmail"; // Importar el hook personalizado

// Importar componentes de React-Bootstrap
import { Form, Button } from "react-bootstrap";
import Spinner from "../../components/ui/Spinner";

// Importar el módulo SCSS
import styles from "./GymContactPage.module.scss";
import clsx from "clsx";

export const GymContactPage = () => {
  const navigate = useNavigate();

  // Utilizar el hook useEmail para manejar la lógica de envío
  const { sendEmail, isSending } = useEmail();

  // Estados locales del formulario
  const [gymName, setGymName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [observations, setObservations] = useState("");

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!gymName || !address || !email || !phone) {
      toast.error("Por favor, rellena todos los campos obligatorios.");
      return;
    }

    // Preparar los parámetros para la plantilla de correo
    const templateParams = {
      gym_name: gymName,
      address: address,
      email: email,
      phone: phone,
      observations: observations,
    };

    // Ejecutar el envío usando el hook
    const success = await sendEmail(templateParams);

    if (success) {
      toast.success(
        "¡Gracias por tu interés! Hemos recibido tus datos y te contactaremos pronto."
      );
      // Limpiar formulario tras éxito
      setGymName("");
      setAddress("");
      setEmail("");
      setPhone("");
      setObservations("");
    } else {
      toast.error(
        "Hubo un error al enviar la solicitud. Por favor, inténtalo de nuevo."
      );
    }
  };

  // Navegar hacia atrás al hacer clic en el fondo
  const handleBackdropClick = () => {
    navigate(-1);
  };

  // Evitar propagación del clic en el contenedor
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.pageContainer} onClick={handleContainerClick}>
        {/* CORRECCIÓN: Adaptado a la API del nuevo CloseButton animado */}
        <CloseButton
          onClick={() => navigate(-1)}
          className={styles.closeButton}
          color="#FFB700" // Usamos 'color' en lugar de 'colorVariant'
          ariaLabel="Cerrar formulario"
        />
        <div className={styles.splitLayout}>
          {/* Sección Izquierda: Imagen e Inspiración */}
          <div className={styles.imageSection}>
            <img
              src="/images/gym-contact-page/gym-contact-page.png"
              alt="Gimnasio moderno GymNomads"
              className={styles.contactImage}
            />
            <div className={styles.imageOverlay}>
              <h2>Expande tu Negocio</h2>
              <p>Únete a la red de gimnasios más flexible de España.</p>
            </div>
          </div>

          {/* Sección Derecha: Formulario */}
          <div className={styles.formSection}>
            <h1 className={styles.title}>Contacta con Nosotros</h1>
            <p className={styles.subtitle}>
              Rellena el formulario para unirte a nuestra red exclusiva y en
              poco tiempo contactaremos contigo.
            </p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="gymName">
                <Form.Label className={styles.formLabel}>
                  Nombre del Gimnasio
                </Form.Label>
                <Form.Control
                  type="text"
                  name="gym_name"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  required
                  className={styles.formControl}
                  placeholder="Ej: Iron Temple Gym"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="address">
                <Form.Label className={styles.formLabel}>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className={styles.formControl}
                  placeholder="Calle Principal, 123, Cádiz"
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label className={styles.formLabel}>
                      Email Profesional
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={styles.formControl}
                      placeholder="contacto@tugimnasio.com"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="phone">
                    <Form.Label className={styles.formLabel}>
                      Teléfono
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={styles.formControl}
                      placeholder="+34 600 000 000"
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-4" controlId="observations">
                <Form.Label className={styles.formLabel}>
                  Observaciones (Opcional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  name="observations"
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className={styles.formControl}
                  placeholder="Cuéntanos un poco sobre tus instalaciones..."
                />
              </Form.Group>

              <Button
                type="submit"
                disabled={isSending}
                className={clsx(styles.submitButton, "w-100 btn-primary")}>
                {isSending ? (
                  <>
                    <Spinner size="sm" variant="dark" className="me-2" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitud"
                )}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
