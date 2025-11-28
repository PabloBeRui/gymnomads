/**
 * =============================================================================
 * COMPONENTE: RegisterUserPage
 * COMPONENT:  RegisterUserPage
 * =============================================================================
 *
 * Descripción: Página de registro para nuevos usuarios. Permite al usuario
 * introducir sus datos, seleccionar un gimnasio de origen y, opcionalmente,
 * subir una foto de perfil.
 *
 * Description: Registration page for new users. It allows the user to enter
 * their details, select a home gym, and optionally upload a profile picture.
 *
 * =============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useApiCall, useImageUpload } from "../hooks";
import { ImageUploadPreview } from "../components/ui";
import {
  registerUser,
  getUserProfile,
  uploadProfilePicture,
  getAllGyms,
} from "../services";
import type {
  RegisterData,
  UploadProfilePictureResponse,
  Gym,
} from "../interfaces";
import { Form, Button, Spinner } from "react-bootstrap";

// Importar el módulo SCSS para mantener la consistencia, aunque esté vacío.
// Import the SCSS module for consistency, even if it's empty.
import styles from "./RegisterUserPage.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx
import { CloseButton } from "../components/ui";

export const RegisterUserPage: React.FC = () => {
  // Hooks de navegación y contexto de autenticación.
  // Navigation and authentication context hooks.
  const navigate = useNavigate();
  const { login: authLogin, setUser } = useAuth();

  // Estados para los campos del formulario.
  // States for the form fields.
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [homeGymId, setHomeGymId] = useState<number>(0);
  const [gyms, setGyms] = useState<Gym[]>([]);

  // Hook para gestionar la llamada a la API de registro, incluyendo estados de carga/error.
  // Hook to manage the registration API call, including loading/error states.
  const { loading: isRegistering, execute: executeRegister } = useApiCall(
    "Error al registrar el usuario."
  );

  // Hook para la carga de la lista de gimnasios.
  // Hook for loading the list of gyms.
  const { loading: isLoadingGyms, execute: executeLoadGyms } = useApiCall(
    "Error al cargar los gimnasios."
  );

  // Hook personalizado para la lógica de subida de imagen de perfil.
  // Custom hook for the profile picture upload logic.
  const {
    selectedFile,
    previewUrl,
    fileInputRef,
    handleFileChange,
    handleImageClick,
    isUploading,
    uploadImage,
  } = useImageUpload<[string], UploadProfilePictureResponse>(
    {
      maxSizeMB: 5,
      allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      errorMessages: {
        invalidType: "La foto debe ser PNG, JPG, JPEG o WEBP.",
        maxSize: "La foto no debe superar los 5MB.",
      },
    },
    // Función que se ejecutará para subir el archivo. Recibe el archivo y los argumentos adicionales (token).
    // Function that will be executed to upload the file. It receives the file and additional arguments (token).
    async (file: File, token: string) =>
      (await uploadProfilePicture(token, file)) as UploadProfilePictureResponse,
    "Error al subir la foto de perfil."
  );

  // Efecto para cargar la lista de gimnasios cuando el componente se monta.
  // Effect to load the list of gyms when the component mounts.
  useEffect(() => {
    const loadGyms = async () => {
      try {
        // Llama a la API para obtener todos los gimnasios con un límite alto.
        // Call the API to get all gyms with a high limit.
        const response = await executeLoadGyms(() =>
          getAllGyms(undefined, { limit: 1000 })
        );
        // Valida que la respuesta sea un array antes de establecer el estado.
        // Validates that the response is an array before setting the state.
        const gymsData = Array.isArray(response.data) ? response.data : [];
        setGyms(gymsData);
        // Si hay gimnasios y no se ha seleccionado ninguno, selecciona el primero por defecto.
        // If there are gyms and none has been selected, select the first one by default.
        if (gymsData.length > 0 && homeGymId === 0) {
          setHomeGymId(gymsData[0].id);
        }
      } catch (err) {
        // El hook useApiCall ya gestiona el toast de error.
        // The useApiCall hook already handles the error toast.
        if (import.meta.env.DEV)
          console.error("⚠️ Error cargando gimnasios: ", err);
        setGyms([]); // Asegura que `gyms` siga siendo un array en caso de error. / Ensures `gyms` remains an array on error.
      }
    };
    loadGyms();
    // Las dependencias están vacías para que solo se ejecute una vez al montar.
    // Dependencies are empty so it only runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para manejar el envío del formulario de registro.
  // Function to handle the registration form submission.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario. / Prevents the default form behavior.

    // Validaciones básicas de los campos.
    // Basic field validations.
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Todos los campos obligatorios deben ser completados.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      // 1. Construir el payload con los datos del formulario.
      // 1. Build the payload with the form data.
      const registerPayload: RegisterData = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
        home_gym_id: homeGymId,
      };
      // 2. Ejecutar el registro de usuario, que devuelve un token.
      // 2. Execute the user registration, which returns a token.
      const registration = await executeRegister(() =>
        registerUser(registerPayload)
      );
      // 3. Si se seleccionó un archivo, subirlo usando el token obtenido.
      // 3. If a file was selected, upload it using the obtained token.
      if (selectedFile) {
        await uploadImage(registration.token);
      }
      // 4. Obtener el perfil completo del usuario con el token.
      // 4. Get the full user profile with the token.
      const profile = await getUserProfile(registration.token);
      // 5. Actualizar el estado de usuario en el contexto de autenticación.
      // 5. Update the user state in the authentication context.
      setUser(profile);
      // 6. Iniciar sesión localmente para establecer el token en el almacenamiento.
      // 6. Log in locally to set the token in storage.
      if (authLogin) {
        authLogin(registration.token);
      }
      // 7. Notificar al usuario y redirigir a su perfil.
      // 7. Notify the user and redirect to their profile.
      toast.success("¡Registro completado con éxito!");
      navigate("/profile");
    } catch (err) {
      // El hook `useApiCall` ya muestra un toast en caso de error.
      // The `useApiCall` hook already shows a toast on error.
      if (import.meta.env.DEV)
        console.error("⚠️ Error en el proceso de registro: ", err);
    }
  };

  // Variable booleana para deshabilitar el botón mientras se registra o se sube la imagen.
  // Boolean variable to disable the button while registering or uploading the image.
  const isSubmitting = isRegistering || isUploading;

  const handleBackdropClick = () => {
    navigate(-1);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.registerContainer} onClick={handleContainerClick}>
        <CloseButton
          onClick={() => navigate(-1)}
          className={styles.closeButton}
          color="#FFB700"
          ariaLabel="Volver a la página anterior"
        />
        <div className={styles.splitLayout}>
          {/* Sección Izquierda: Imagen e Inspiración */}
          <div className={styles.imageSection}>
            <img
              src="/images/register-user-page/register-user-page.png"
              alt="Entrenamiento en GymNomads"
              className={styles.registerImage}
            />
            <div className={styles.imageOverlay}>
              <h2>Únete al Movimiento</h2>
              <p>
                Crea tu cuenta y accede a una red española de gimnasios con un
                solo pase.
              </p>
            </div>
          </div>

          {/* Sección Derecha: Formulario */}
          <div className={styles.formSection}>
            <h2 className={styles.title}>Crear Cuenta</h2>
            <p className={styles.subtitle}>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className={styles.linkText}>
                Inicia sesión
              </Link>
            </p>

            <Form onSubmit={handleRegister}>
              {/* Sección para la subida de imagen de perfil */}
              <Form.Group className="mb-4 text-center" controlId="profilePic">
                <input
                  id="profile-pic-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                />
                <ImageUploadPreview
                  previewUrl={previewUrl}
                  defaultImage="/images/profile/default-avatar.png"
                  onClick={handleImageClick}
                  altText="Foto de perfil"
                  shape="circle"
                  size={100}
                  showHelpText
                  helpText="Subir foto"
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label className={styles.formLabel}>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className={styles.formControl}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label className={styles.formLabel}>
                      Apellidos
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className={styles.formControl}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label className={styles.formLabel}>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.formControl}
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label className={styles.formLabel}>
                      Contraseña
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={styles.formControl}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label className={styles.formLabel}>
                      Confirmar
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={styles.formControl}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3" controlId="phone">
                    <Form.Label className={styles.formLabel}>
                      Teléfono (Opcional)
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={styles.formControl}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-4" controlId="homeGymId">
                    <Form.Label className={styles.formLabel}>
                      Gimnasio de Origen
                    </Form.Label>
                    {isLoadingGyms ? (
                      <div className="text-center py-2">
                        <Spinner
                          animation="border"
                          size="sm"
                          variant="primary"
                        />
                      </div>
                    ) : (
                      <Form.Select
                        value={homeGymId}
                        onChange={(e) => setHomeGymId(Number(e.target.value))}
                        required
                        className={styles.formControl}>
                        {gyms.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.city})
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Form.Group>
                </div>
              </div>

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
                      variant="dark"
                    />
                    Registrando...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
