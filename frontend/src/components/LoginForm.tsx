import { useState } from "react";
// Hooks de React Router para navegación / React Router hooks for navigation
import { useNavigate } from "react-router-dom";
// Notificaciones sonner / sonner notifications
import { toast } from "sonner";
// Importar la función de login del servicio de usuario
// Import login function from user service
import { loginUser } from "../services/user-services";
// Importar interfaz para datos de login
// Import interface for login data
import type { LoginData } from "../interfaces/user-interfaces";

export const LoginForm = () => {
  // Crear useState para los campos del formulario.
  // Create useState for form fields.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Crear useState para errores del formulario o de la API.
  // Create useState for form or API errors.
  const [error, setError] = useState<string | null>(null);

  // Crear useState para indicar estado de carga durante el envío.
  // Create useState to indicate loading state during submission.
  const [isLoading, setIsLoading] = useState(false);

  // Obtener la función de navegación / Get the navigation function
  const navigate = useNavigate();

  // Crear manejador para el envío del formulario.
  // Create handler for form submission.

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevenir recarga de página. // Prevent page reload.
    setIsLoading(true); // Indicar que está procesando. // Indicate processing.
    setError(null); // Limpiar errores previos. // Clear previous errors.

    // Validar campos del formulario aquí.
    // Validate form fields here.
    if (!email || !password) {
      setError("Por favor, introduce tu email y contraseña.");
      setIsLoading(false);
      return;
    }

    // Crear objeto con datos del formulario usando la interfaz.
    // Create object with form data using the interface.
    const credentials: LoginData = {
      email,
      password,
    };

    try {
      // Llamar a la función loginUser del servicio.
      // Call the loginUser function from the service.
      const response = await loginUser(credentials);

      // TODO: Guardar el token JWT recibido de forma segura (ej. localStorage).
      // TODO: Securely save the received JWT token (e.g., localStorage).
      console.log("Login exitoso, token:", response.token); // Mostrar token en consola por ahora / show token in console
      // localStorage.setItem('authToken', response.token); // Ejemplo de guardado

      toast.success("¡Login correcto!");

      // Redirigir al usuario a home
      // Redirect user to home
      setTimeout(() => {
        navigate("/"); // Redirigir a Home
      }, 2000);
    } catch (apiError) {
      console.error("Error en login:", apiError);

      let errorMessage = "Error desconocido al iniciar sesión.";

      // Establecer useState de error con el mensaje del error de la API o un mensaje por defecto.
      // Set error useState with the API error message or a default message.
      if (apiError instanceof Error) {
        errorMessage = apiError.message || errorMessage;
      }

      setError(errorMessage);

      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Finalizar estado de carga. // End loading state.
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="loginEmail">Email:</label>
          <input
            type="email"
            id="loginEmail" // Usar ID diferente
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="loginPassword">Contraseña:</label>
          <input
            type="password"
            id="loginPassword" // Usar ID diferente
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Mostrar errores del formulario/API */}
        {/* Show form/API errors */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Botón de envío con estado de carga */}
        {/* Submit button with loading state */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
};
