/**
 * =============================================================================
 * HOOK: useEmail
 * =============================================================================
 *
 * Hook personalizado para gestionar el envío de correos electrónicos mediante EmailJS.
 * Abstrae la lógica de configuración, manejo de estados de carga y errores.
 *
 * Custom hook to manage email sending via EmailJS.
 * Abstracts configuration, loading state management, and error handling.
 *
 * =============================================================================
 */
import { useState } from "react";
import emailjs from "@emailjs/browser";

// Definimos la interfaz para la respuesta del hook
// Define the interface for the hook response
interface UseEmailReturn {
  // Función para enviar el email
  // Function to send the email
  sendEmail: (templateParams: Record<string, unknown>) => Promise<boolean>;
  // Estado de carga
  // Loading state
  isSending: boolean;
  // Mensaje de error si falla
  // Error message if it fails
  error: string | null;
}

export const useEmail = (): UseEmailReturn => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (
    templateParams: Record<string, unknown>
  ): Promise<boolean> => {
    setIsSending(true);
    setError(null);

    // Recuperar variables de entorno
    // Retrieve environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Validación de configuración
    // Configuration validation
    if (!serviceId || !templateId || !publicKey) {
      console.error("Faltan las variables de entorno de EmailJS");
      setError("Error de configuración del servicio de correo.");
      setIsSending(false);
      return false;
    }

    try {
      // Intentar enviar el correo a través de EmailJS
      // Attempt to send the email via EmailJS
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return true; // Envío exitoso / Successful send
    } catch (err) {
      console.error("Error al enviar email:", err);
      setError("No se pudo enviar el correo. Inténtalo más tarde.");
      return false; // Envío fallido / Failed send
    } finally {
      // Restablecer estado de carga
      // Reset loading state
      setIsSending(false);
    }
  };

  return { sendEmail, isSending, error };
};
