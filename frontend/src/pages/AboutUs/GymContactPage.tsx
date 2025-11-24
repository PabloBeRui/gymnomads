/**
 * =============================================================================
 * COMPONENTE: GymContactPage
 * COMPONENT: GymContactPage
 * =============================================================================
 *
 * Descripción: Página con un formulario para que los gimnasios interesados
 * puedan contactar para unirse a la red Gymnomads.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Detailed description: Page with a form for interested gyms to contact
 * to join the Gymnomads network.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { CloseButton } from "../../components/ui/CloseButton";
import { useNavigate } from "react-router-dom";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Form, Button, Spinner } from "react-bootstrap";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./GymContactPage.module.scss";
import clsx from "clsx";

export const GymContactPage = () => {
  const navigate = useNavigate();
  const [gymName, setGymName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación de envío
    setTimeout(() => {
      toast.success(
        "¡Gracias por tu interés! Hemos recibido tus datos y te contactaremos pronto."
      );
      setGymName("");
      setAddress("");
      setEmail("");
      setPhone("");
      setObservations("");
      setIsSubmitting(false);
    }, 1500);
  };

  const handleBackdropClick = () => {
    navigate(-1);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.pageContainer} onClick={handleContainerClick}>
        <CloseButton 
          onClick={() => navigate(-1)} 
          className={styles.closeButton} 
          color="#FFB700" 
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
                      
                      <h1 className={styles.title}>Contacta con Nosotros</h1>            <p className={styles.subtitle}>
              Rellena el formulario para unirte a nuestra red exclusiva y en en
              poco tiempo contactaremos contigo.
            </p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="gymName">
                <Form.Label className={styles.formLabel}>
                  Nombre del Gimnasio
                </Form.Label>
                <Form.Control
                  type="text"
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className={styles.formControl}
                  placeholder="Calle Principal, 123, Madrid"
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
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className={styles.formControl}
                  placeholder="Cuéntanos un poco sobre tus instalaciones..."
                />
              </Form.Group>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={clsx(styles.submitButton, "w-100")}>
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
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
