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

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Form, Button } from "react-bootstrap";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./GymContactPage.module.scss";
// import clsx from "clsx"; // Importar clsx / Import clsx

export const GymContactPage = () => {
  const [gymName, setGymName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    // Simulación de envío a un API
    // API submission simulation
    setTimeout(() => {
      toast.success(
        "¡Gracias por tu interés! Hemos recibido tus datos y te contactaremos pronto."
      );

      // Resetear formulario y estado
      // Reset form and state
      setGymName("");
      setAddress("");
      setEmail("");
      setPhone("");
      setObservations("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Container className={styles.pageContainer}>
      <CloseButton navigateTo="/" />
      <h1 className={styles.title}>Contacta con Nosotros</h1>
      <p className={styles.subtitle}>
        ¿Eres un gimnasio y quieres unirte a nuestra red? Rellena el siguiente
        formulario y nos pondremos en contacto contigo.
      </p>
      <Form onSubmit={handleSubmit} className="text-start">
        <Form.Group className="mb-3" controlId="gymName">
          <Form.Label>Nombre del Gimnasio</Form.Label>
          <Form.Control
            type="text"
            value={gymName}
            onChange={(e) => setGymName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="address">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email de Contacto</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="phone">
          <Form.Label>Teléfono de Contacto</Form.Label>
          <Form.Control
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="observations">
          <Form.Label>Observaciones o Dudas (Opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-100">
          {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
        </Button>
      </Form>
    </Container>
  );
};
