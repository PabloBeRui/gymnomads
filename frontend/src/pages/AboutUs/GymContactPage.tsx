/**
 * =============================================================================
 * COMPONENTE: GymContactPage
 * COMPONENT: GymContactPage
 * =============================================================================
 *
 * Descripción: Página con un formulario para que los gimnasios interesados
 * puedan contactar para unirse a la red Gymnomads.
 *
 * Detailed description: Page with a form for interested gyms to contact
 * to join the Gymnomads network.
 *
 * =============================================================================
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { CloseButton } from "../../components/ui/CloseButton";

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "30px",
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "15px",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#555",
    lineHeight: 1.6,
    marginBottom: "30px",
  },
  formInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
    marginBottom: "15px",
    fontSize: "1rem",
  },
  formTextarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
    minHeight: "100px",
    marginBottom: "15px",
    fontSize: "1rem",
  },
  formLabel: {
    display: "block",
    textAlign: "left",
    marginBottom: "5px",
    fontWeight: "600",
    color: "#333",
  },
  submitButton: {
    width: "100%",
    padding: "12px 25px",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "rgb(0, 123, 255)", 
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  submitButtonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
  },
};

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
    <div style={styles.pageContainer}>
      <CloseButton navigateTo="/" />
      <h1 style={styles.title}>Contacta con Nosotros</h1>
      <p style={styles.subtitle}>
        ¿Eres un gimnasio y quieres unirte a nuestra red? Rellena el siguiente
        formulario y nos pondremos en contacto contigo.
      </p>
      <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
        <div>
          <label style={styles.formLabel} htmlFor="gymName">
            Nombre del Gimnasio
          </label>
          <input
            id="gymName"
            type="text"
            value={gymName}
            onChange={(e) => setGymName(e.target.value)}
            style={styles.formInput}
            required
          />
        </div>
        <div>
          <label style={styles.formLabel} htmlFor="address">
            Dirección
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={styles.formInput}
            required
          />
        </div>
        <div>
          <label style={styles.formLabel} htmlFor="email">
            Email de Contacto
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.formInput}
            required
          />
        </div>
        <div>
          <label style={styles.formLabel} htmlFor="phone">
            Teléfono de Contacto
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.formInput}
            required
          />
        </div>
        <div>
          <label style={styles.formLabel} htmlFor="observations">
            Observaciones o Dudas (Opcional)
          </label>
          <textarea
            id="observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            style={styles.formTextarea}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...styles.submitButton,
            ...(isSubmitting ? styles.submitButtonDisabled : {}),
          }}>
          {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </form>
    </div>
  );
};
