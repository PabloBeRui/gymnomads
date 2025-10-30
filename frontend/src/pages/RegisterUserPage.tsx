// Importar hooks de React / Import React hooks
import { useState, useRef, useEffect } from "react";
// Importar hook de navegación / Import navigation hook
import { useNavigate } from "react-router-dom";
// Importar el hook de autenticación / Import the authentication hook
import { useAuth } from "../context/AuthContext";
// Importar el hook personalizado para manejar llamadas API / Import the custom hook to handle API calls
import { useApiCall } from "../hooks/useApiCall";

// Importar interfaces / Import interfaces
import type {
  RegisterData,
  RegisterResponse,
  UploadProfilePictureResponse,
} from "../interfaces/user-interfaces";

// Importar servicios / Import services
import {
  registerUser,
  uploadProfilePicture,
  getUserProfile,
} from "../services/user-services";
import { getAllGyms } from "../services/gym-services";

// Importar tipos de gimnasio / Import gym types
import type { Gym } from "../interfaces/gym-interfaces";

// Importar notificaciones / Import notifications
import { toast } from "sonner";

export const RegisterUserPage = () => {
  // Obtener la función de navegación / Get the navigation function
  const navigate = useNavigate();
  // Obtener funciones del contexto de autenticación / Get functions from authentication context
  const { login: authLogin, setUser } = useAuth();

  // --- Estados del Formulario / Form States ---
  // Crear useStates para los campos del formulario / Create useStates for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [homeGymId, setHomeGymId] = useState<number | null>(null);

  // --- Estados para Subida de Imagen / States for Image Upload ---
  // Crear useState para el archivo de imagen seleccionado / Create useState for selected image file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Crear useState para la URL de vista previa / Create useState for preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Crear useRef para el input de archivo oculto / Create useRef for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Estados para Lista de Gimnasios / States for Gyms List ---
  // Crear useState para almacenar la lista de gimnasios / Create useState to store gyms list
  const [gyms, setGyms] = useState<Gym[]>([]);

  // Usar el hook personalizado para manejar llamadas API de registro / Use custom hook to handle registration API calls
  const {
    loading: isRegistering,
    error: registerError,
    execute: executeRegister,
  } = useApiCall<RegisterResponse>("Error al registrar el usuario.");

  // Usar el hook personalizado para manejar llamadas API de carga de gimnasios / Use custom hook to handle gyms loading API calls
  const {
    loading: isLoadingGyms,
    error: gymsError,
    execute: executeGetGyms,
  } = useApiCall<Gym[]>("Error al cargar la lista de gimnasios.");

  // Usar el hook personalizado para manejar llamadas API de subida de imagen / Use custom hook to handle image upload API calls
  const { loading: isUploadingImage, execute: executeUploadImage } =
    useApiCall<UploadProfilePictureResponse>("Error al subir la imagen.");

  // --- useEffect para cargar la lista de gimnasios al montar el componente / useEffect to load gyms list on component mount ---
  useEffect(() => {
    const loadGyms = async () => {
      try {
        const gymsList = await executeGetGyms(() => getAllGyms());
        setGyms(gymsList);
      } catch (error) {
        // Log del error completo solo en desarrollo / Full error log only in development
        if (import.meta.env.DEV) {
          console.error("Error en la carga de gimnasios:", error);
        }
        // Mostrar mensaje amigable al usuario / Show user-friendly message
        toast.error("No se pudieron cargar los gimnasios. Por favor, recarga la página.");
      }
    };
    loadGyms();
    // No añadir executeGetGyms, loop infinito / Don't add executeGetGyms, infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Manejadores de Imagen / Image Handlers ---

  // Definir función para manejar clic en el área de imagen / Define function to handle image area click
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Definir función para manejar la selección de archivo / Define function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Obtener el archivo seleccionado / Get the selected file
    const file = e.target.files?.[0];

    if (file) {
      // Validar tipo de archivo / Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Por favor, selecciona una imagen válida (PNG, JPG, JPEG o WEBP)"
        );
        return;
      }

      // Validar tamaño máximo (5MB) / Validate max size (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }

      // Guardar el archivo seleccionado / Save the selected file
      setSelectedFile(file);

      // Crear URL de vista previa para mostrar la imagen / Create preview URL to display the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Log en desarrollo / Log in development
      if (import.meta.env.DEV) {
        console.log(
          "📸 Imagen seleccionada:",
          file.name,
          `(${(file.size / 1024).toFixed(2)} KB)`
        );
      }
    }
  };

  // Definir función para manejar el envío del formulario / Define function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obligatorios / Validate required fields
    if (!firstName || !lastName || !email || !password || !homeGymId) {
      toast.error("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Validar que las contraseñas coincidan / Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    // Validar longitud mínima de contraseña / Validate minimum password length
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      // --- 1. Registrar Usuario / Register User ---
      const registerData: RegisterData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        home_gym_id: homeGymId,
      };

      const registerResponse = await executeRegister(() =>
        registerUser(registerData)
      );

      // Validar que el servidor devolvió un token / Validate that server returned a token
      if (!registerResponse.token) {
        // Log técnico solo en desarrollo / Technical log only in development
        console.error("❌ El servidor no devolvió un token de autenticación.");
        throw new Error("No se pudo completar el registro. Por favor, inténtalo de nuevo.");
      }

      console.log("✅ Usuario registrado con ID:", registerResponse.userId);

      // --- 2. Autenticar al usuario / Authenticate user ---
      await authLogin(registerResponse.token);
      console.log("✅ Usuario autenticado correctamente");

      // --- 3. Subir Imagen de Perfil (si existe) / Upload Profile Picture (if exists) ---
      if (selectedFile) {
        console.log("📸 Subiendo imagen de perfil:", selectedFile.name);

        try {
          // Pequeño delay para asegurar que el token esté configurado
          // Small delay to ensure token is configured
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Subir la imagen de perfil / Upload profile picture
          const uploadResult = await executeUploadImage(() =>
            uploadProfilePicture(registerResponse.token, selectedFile)
          );

          console.log("✅ Imagen de perfil subida:", uploadResult.filePath);

          // Actualizar el estado del usuario con los datos más recientes (incluyendo la foto)
          // Update user state with the latest data (including the photo)
          try {
            const updatedUserData = await getUserProfile(
              registerResponse.token
            );
            setUser(updatedUserData);
            console.log("✅ Perfil actualizado con la imagen en el estado");
          } catch (profileError) {
            // Log técnico solo en desarrollo / Technical log only in development
            console.warn(
              "⚠️ No se pudo actualizar el perfil tras subir imagen:",
              profileError
            );
          }
        } catch (uploadError) {
          // No bloquear el registro si falla la imagen
          // Don't block registration if image fails
          // Log técnico en desarrollo / Technical log in development
          if (import.meta.env.DEV) {
            console.error("⚠️ Error al subir la imagen:", uploadError);
          }
          // Mensaje amigable al usuario / User-friendly message
          toast.warning(
            "Tu cuenta se creó correctamente. Podrás añadir tu foto desde el perfil.",
            { duration: 4000 }
          );
        }
      }

      // --- 4. Mostrar éxito y redirigir / Show success and redirect ---
      toast.success("¡Bienvenido a GymNomads! Tu cuenta ha sido creada.");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      // Log técnico solo en desarrollo / Technical log only in development
      if (import.meta.env.DEV) {
        console.error("❌ Error en el registro:", error);
      }
      // Mensaje amigable para el usuario / User-friendly message
      toast.error("No se pudo completar el registro. Por favor, inténtalo de nuevo.");
    }
  };

  // Determinar qué imagen mostrar / Determine which image to show
  const displayImageUrl = previewUrl || "/images/profile/default_avatar.png";

  // Renderizar formulario de registro / Render registration form
  return (
    <div>
      <h2>Registrar Usuario</h2>
      <form onSubmit={handleSubmit}>
        {/* --- Imagen de Perfil / Profile Picture --- */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Foto de Perfil (Opcional):</label>
          <div
            onClick={handleImageClick}
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              overflow: "hidden",
              cursor: "pointer",
              border: "2px dashed #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "0.5rem",
            }}>
            <img
              src={displayImageUrl}
              alt="Vista previa"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/png, image/jpeg, image/webp, image/jpg"
          />
          <small>Haz clic en la imagen para seleccionar una foto</small>
        </div>

        {/* --- Campos del Formulario / Form Fields --- */}
        <div>
          <label htmlFor="firstName">Nombre: *</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isRegistering || isUploadingImage}
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label htmlFor="lastName">Apellidos: *</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isRegistering || isUploadingImage}
            placeholder="Tus apellidos"
          />
        </div>

        <div>
          <label htmlFor="email">Email: *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isRegistering || isUploadingImage}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña: *</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isRegistering || isUploadingImage}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirmar Contraseña: *</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isRegistering || isUploadingImage}
            placeholder="Repite tu contraseña"
          />
        </div>

        <div>
          <label htmlFor="phone">Teléfono:</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isRegistering || isUploadingImage}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label htmlFor="homeGymId">Gimnasio Principal: *</label>
          <select
            id="homeGymId"
            value={homeGymId || ""}
            onChange={(e) => setHomeGymId(Number(e.target.value))}
            required
            disabled={isRegistering || isUploadingImage || isLoadingGyms}>
            <option value="">
              {isLoadingGyms
                ? "Cargando gimnasios..."
                : "Selecciona un gimnasio"}
            </option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>
          {gymsError && <small style={{ color: "red" }}>{gymsError}</small>}
        </div>

        {/* --- Mostrar Errores / Show Errors --- */}
        {registerError && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>{registerError}</p>
        )}

        {/* --- Botón de Envío / Submit Button --- */}
        <button
          type="submit"
          disabled={isRegistering || isUploadingImage || isLoadingGyms}>
          {isRegistering
            ? "Registrando..."
            : isUploadingImage
            ? "Subiendo imagen..."
            : "Registrarse"}
        </button>
      </form>

      {/* --- Enlace a Login / Link to Login --- */}
      <p>
        ¿Ya tienes cuenta?{" "}
        <button
          onClick={() => navigate("/login")}
          disabled={isRegistering || isUploadingImage}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
          }}>
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
};