import { useEffect, useState } from "react";

// Notificaciones sonner / sonner notifications
import { toast } from "sonner";

// Importar la interfaz Gym para el desplegable (¡necesitaremos obtener los gimnasios!)
// Import the Gym interface for the dropdown (we'll need to fetch gyms!)
import type { Gym } from "../interfaces/gym-interfaces";
import { getAllGyms } from "../services/gym-services";
import { registerUser } from "../services/user-services";

export const RegisterForm = () => {
  // Crear useStates para cada campo del formulario.
  // Create useStates for each form field.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [homeGymId, setHomeGymId] = useState<number | "">(""); //"" - false
  // TODO const [profilePicture, setProfilePicture] = useState<File | null>(null); // Para la subida de archivos / upload files

  // useState para almacenar la lista de gimnasios (para el desplegable).
  // useState to store the list of gyms (for the dropdown).
  const [gymList, setGymList] = useState<Gym[]>([]);
  //  Crear useState para errores del formulario o de la API.
  //  Create useState for form or API errors.
  const [error, setError] = useState<string | null>(null);
  //  Crear useState para indicar estado de carga durante el envío.
  // Create useState to indicate loading state during submission.
  const [isLoading, setIsLoading] = useState(false);
  // UseState para errores específicos de la carga de gimnasios
  // useState for errors specific to loading gyms
  const [gymLoadError, setGymLoadError] = useState<string | null>(null);

  //  useEffect para cargar la lista de gimnasios al usar select.
  //  useEffect to load the list of gyms using select.

  useEffect(() => {
    const loadGymsForSelect = async () => {
      try {
        setGymLoadError(null); // Limpiar error previo de carga de gimnasios / clean previous load error
        const gymData = await getAllGyms();
        setGymList(gymData);
      } catch (err) {
        console.error("Error loading gyms for select:", err);
        if (err instanceof Error) {
          setGymLoadError(
            err.message ||
              "No se pudieron cargar los gimnasios para el desplegable."
          );
        } else {
          setGymLoadError("Error desconocido al cargar gimnasios.");
        }
      }
    };
    loadGymsForSelect();
  }, []); // Array vacío única ejecución al montar / empty array unique load on mount

  // Crear manejador para el envío del formulario.
  // Create handler for form submission.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevenir recarga de página. // Prevent page reload.
    setIsLoading(true); // Indicar que estamos procesando. // Indicate processing.
    setError(null); // Limpiar errores previos. // Clear previous errors.

    //Validar campos del formulario aquí.
    // Validate form fields here.
    if (!firstName || !lastName || !email || !password || !homeGymId) {
      setError("Por favor, completa todos los campos obligatorios.");
      setIsLoading(false);
      return;
    }

    // Crear objeto con datos del formulario.
    //  Create object with form data.
    const formData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      phone: phone || null, // Envia null si está vacío // send null if empty
      home_gym_id: homeGymId,
      // profile_picture: lo manejaremos después
    };

    try {
      // Llamar a la función registerUser del servicio con los datos del formulario.
      // Call the registerUser function from the service with the form data.
      await registerUser(formData);

      // Mostrar notificacion  de éxito
      // Show success notification.
      toast.success("¡Usuario registrado con éxito!");

      // TODO: Redirigir al usuario al inicio.
    } catch (apiError) {
      console.error("Error en registro:", apiError);

      toast.error("Error al registrar el usuario");
      // Establecer useState de error con el mensaje del error de la API o un mensaje por defecto.
      // Set error useState with the API error message or a default message.
      if (apiError instanceof Error) {
        setError(apiError.message || "Error al registrar. Inténtalo de nuevo.");
      } else {
        // Establecer useState de error con un mensaje genérico si el error no es un objeto Error estándar.
        // Set error useState with a generic message if the error is not a standard Error object.
        setError("Error desconocido al registrar. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false); // Finalizar estado de carga. // End loading state.
    }
  };

  return (
    <div>
      <h2>Formulario de Registro</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">Nombre:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required // Marcar como obligatorio en HTML5
          />
        </div>
        <div>
          <label htmlFor="lastName">Apellidos:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">Teléfono (Opcional):</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="homeGymId">Gimnasio asociado:</label>
          <select
            id="homeGymId"
            value={homeGymId}
            onChange={(e) => setHomeGymId(Number(e.target.value) || "")} // Convertir a número o '' - false
            required
            // Deshabilitar si aún no se han cargado los gimnasios
            //  Disable if gyms haven't loaded yet
            disabled={gymList.length === 0 && !gymLoadError}>
            <option value="">-- Selecciona un gimnasio --</option>
            {/* TODO: Mapear gymList para crear las opciones */}
            {/* Map gymList to create the options */}
            {gymList.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.city} - {gym.name}
              </option>
            ))}
          </select>
        </div>

        {/* //TODO: Input para foto de perfil (type="file") */}
        {/* Mostrar error si la carga de gimnasios falla */}
        {/* Show error if loading gyms fails */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {/*  Deshabilitar botón si hay error cargando gyms o si está cargando envío */}
        {/* Disable button if there's a gym load error or if submitting */}
        <button
          type="submit"
          disabled={isLoading || !!gymLoadError || gymList.length === 0}>
          {isLoading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
};
