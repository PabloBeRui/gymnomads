/**
 * =============================================================================
 * PÁGINA: LoginPage
 * =============================================================================
 *
 * Página de inicio de sesión.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Login page.
 * Refactored to use React-Bootstrap and SASS Modules.
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

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Form, Button, Alert, Spinner,Card } from "react-bootstrap";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./LoginPage.module.scss";
// import clsx from "clsx"; // Importar clsx / Import clsx

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
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className={`p-4 shadow-lg ${styles.loginCard}`}>
        <Card.Body>
          <h2 className="text-center mb-4 fw-bold">Iniciar Sesión</h2>
          <Form onSubmit={handleSubmit} aria-label="Formulario de inicio de sesión">
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleInputChange();
                }}
                required
                disabled={loading}
                aria-label="Email"
                className={styles.formControl}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleInputChange();
                }}
                required
                disabled={loading}
                aria-label="Contraseña"
                className={styles.formControl}
              />
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button variant="primary" type="submit" disabled={loading} className="w-100 mt-3">
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </Form>

          <p className="mt-3 text-center">
            ¿No tienes cuenta?{" "}
            <Button
              variant="link"
              onClick={() => navigate("/register")}
              disabled={loading}
              className={`p-0 ${styles.linkButton}`}
              aria-disabled={loading}>
              Regístrate aquí
            </Button>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};