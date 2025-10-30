// Importar hooks de React / Import React hooks
import { useState } from "react";
// Importar hook de navegación / Import navigation hook
import { useNavigate } from "react-router-dom";
// Importar el hook de autenticación / Import the authentication hook
import { useAuth } from "../context/AuthContext";
// Importar el hook personalizado para manejar llamadas API / Import the custom hook to handle API calls
import { useApiCall } from "../hooks/useApiCall";

// Importar interfaces / Import interfaces
import type { LoginData, LoginResponse } from "../interfaces/user-interfaces";

// Importar servicios / Import services
import { loginUser } from "../services/user-services";

// Importar notificaciones / Import notifications
import { toast } from "sonner";

export const LoginPage = () => {
  // Obtener la función de navegación / Get the navigation function
  const navigate = useNavigate();
  // Obtener la función login del contexto / Get the login function from context
  const { login: authLogin } = useAuth();

  // --- Estados del Formulario / Form States ---
  // Crear useState para el email / Create useState for email
  const [email, setEmail] = useState("");
  // Crear useState para la contraseña / Create useState for password
  const [password, setPassword] = useState("");

  // Usar el hook personalizado para manejar la llamada API de login / Use the custom hook to handle login API call
  const { loading, error, execute, resetError } = useApiCall<LoginResponse>(
    "Error al iniciar sesión."
  );

  // Definir función para manejar el envío del formulario / Define function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir recarga de página / Prevent page reload

    // Validar campos obligatorios / Validate required fields
    if (!email || !password) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    try {
      // Preparar datos de login / Prepare login data
      const loginData: LoginData = {
        email: email.trim(),
        password,
      };

      // Ejecutar llamada API de login / Execute login API call
      const response = await execute(
        () => loginUser(loginData),
        "Error al iniciar sesión"
      );

      // Llamar a la función login del contexto con el token / Call the context login function with the token
      await authLogin(response.token);

      // Mostrar notificación de éxito / Show success notification
      toast.success(response.message || "Inicio de sesión exitoso.");

      // Redirigir al usuario a la página principal / Redirect user to main page
      navigate("/");
    } catch (error) {
      // El error ya está manejado por useApiCall / Error is already handled by useApiCall
      // Mostrar notificación de error / Show error notification
      toast.error("Email o contraseña incorrectos. Inténtalo de nuevo.");

      if (import.meta.env.DEV) {
        console.error("Error en login:", error);
      }
    }
    // Log del error completo solo en desarrollo / Full error log only in development
  };

  // Definir función para limpiar errores al editar campos / Define function to clear errors when editing fields
  const handleInputChange = () => {
    if (error) {
      resetError();
    }
  };

  // Renderizar formulario de login / Render login form
  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        {/* Campo de Email / Email Field */}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
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

        {/* Campo de Contraseña / Password Field */}
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
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

        {/* Mostrar mensaje de error si existe / Show error message if it exists */}
        {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}

        {/* Botón de Envío / Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      {/* Enlace a registro / Link to registration */}
      <p>
        ¿No tienes cuenta?{" "}
        <button
          onClick={() => navigate("/register")}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
          }}>
          Regístrate aquí
        </button>
      </p>
    </div>
  );
};
