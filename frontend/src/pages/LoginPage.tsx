/**
 * =============================================================================
 * PÁGINA: LoginPage
 * =============================================================================
 *
 * Página de inicio de sesión.
 * Login page.
 *
 * Flujo / Flow:
 * - Rellena email y contraseña, pulsa Iniciar Sesión.
 * - En caso de éxito se llama a authLogin(token) y se redirige al /
 * - On success we call authLogin(token) and navigate to /
 *
 * =============================================================================
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApiCall } from "../hooks/useApiCall";
import { loginUser } from "../services/user-services";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";

// Types
import type { LoginData, LoginResponse } from "../interfaces/user-interfaces";

/* =============================================================================
   ESTILOS (inline)
   ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: 20, maxWidth: 720, margin: "20px auto" },
  formGroup: { marginBottom: 12 },
  label: { display: "block", marginBottom: 6, fontWeight: 600 },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 4,
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  button: {
    marginTop: 12,
    padding: "8px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "blue",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
    margin: 0,
  },
  errorText: { color: "red", marginTop: 8 },
};

/* =============================================================================
   COMPONENTE: LoginPage
   ============================================================================= */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // API hook (typed)
  const { loading, error, execute, resetError } = useApiCall<LoginResponse>(
    "Error al iniciar sesión."
  );

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    try {
      const loginData: LoginData = {
        email: email.trim(),
        password,
      };

      const response = await execute(() => loginUser(loginData));

      if (!response || !response.token) {
        const msg = "Inicio de sesión fallido: token no recibido.";
        toast.error(msg);
        return;
      }

      // Call auth login if available
      if (authLogin) {
        await authLogin(response.token);
      }

      toast.success(response.message || "Inicio de sesión exitoso.");
      navigate("/");
    } catch (err) {
      // Use centralized error handler if you want processed message
      const processed = handleApiError(err, "Error al intentar iniciar sesión.");
      // execute/useApiCall may already show a toast; avoid double noisy messages
      if (!loading) toast.error(processed);
      if (import.meta.env.DEV) console.error("Error en login:", err);
    }
  };

  // Clear API error when user edits fields
  const handleInputChange = () => {
    if (error) resetError();
  };

  return (
    <div style={styles.container}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} aria-label="Formulario de inicio de sesión">
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            id="email"
            aria-label="Email"
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              handleInputChange();
            }}
            required
            disabled={loading}
            placeholder="tu@email.com"
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>
            Contraseña
          </label>
          <input
            id="password"
            aria-label="Contraseña"
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
            required
            disabled={loading}
            placeholder="Tu contraseña"
          />
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <button type="submit" style={styles.button} disabled={loading} aria-busy={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        ¿No tienes cuenta?{" "}
        <button
          onClick={() => navigate("/register")}
          disabled={loading}
          style={styles.linkButton}
          aria-disabled={loading}>
          Regístrate aquí
        </button>
      </p>
    </div>
  );
};