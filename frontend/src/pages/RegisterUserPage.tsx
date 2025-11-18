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
import { useApiCall } from "../hooks/useApiCall";
import { useImageUpload } from "../hooks/useImageUpload";
import { ImageUploadPreview } from "../components/ImageUploadPreview";
import {
    registerUser,
    getUserProfile,
    uploadProfilePicture,
} from "../services/user-services";
import { getAllGyms } from "../services/gym-services";
import type {
    RegisterData,
    UploadProfilePictureResponse,
} from "../interfaces/user-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Spinner,
} from "react-bootstrap";

// Importar el módulo SCSS para mantener la consistencia, aunque esté vacío.
// Import the SCSS module for consistency, even if it's empty.
import "./RegisterUserPage.module.scss";

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
    const { loading: isRegistering, execute: executeRegister } =
        useApiCall("Error al registrar el usuario.");

    // Hook para la carga de la lista de gimnasios.
    // Hook for loading the list of gyms.
    const { loading: isLoadingGyms, execute: executeLoadGyms } =
        useApiCall("Error al cargar los gimnasios.");

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
                if (import.meta.env.DEV) console.error("⚠️ Error cargando gimnasios: ", err);
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
            if (import.meta.env.DEV) console.error("⚠️ Error en el proceso de registro: ", err);
        }
    };

    // Variable booleana para deshabilitar el botón mientras se registra o se sube la imagen.
    // Boolean variable to disable the button while registering or uploading the image.
    const isSubmitting = isRegistering || isUploading;

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={7} xl={6}>
                    <Card>
                        <Card.Body className="p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h2 className="h3 fw-bold">Crear una cuenta</h2>
                                <p className="text-muted">
                                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                                </p>
                            </div>
                            <Form onSubmit={handleRegister}>
                                {/* Sección para la subida de imagen de perfil */}
                                {/* Profile picture upload section */}
                                <div className="text-center mb-4">
                                    <Form.Label htmlFor="profile-pic-upload">
                                        Foto de perfil (opcional)
                                    </Form.Label>
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
                                        size={120}
                                        showHelpText
                                        helpText="Haz clic para seleccionar"
                                    />
                                </div>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="firstName">
                                            <Form.Label>Nombre</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="lastName">
                                            <Form.Label>Apellidos</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="password">
                                            <Form.Label>Contraseña</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="confirmPassword">
                                            <Form.Label>Confirmar Contraseña</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(e.target.value)
                                                }
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="phone">
                                    <Form.Label>Teléfono (Opcional)</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="homeGymId">
                                    <Form.Label>Tu Gimnasio de Origen</Form.Label>
                                    {/* Muestra un spinner mientras se cargan los gimnasios */}
                                    {/* Shows a spinner while gyms are loading */}
                                    {isLoadingGyms ? (
                                        <div className="text-center">
                                            <Spinner animation="border" size="sm" />
                                            <span className="ms-2">Cargando gimnasios...</span>
                                        </div>
                                    ) : (
                                        <Form.Select
                                            value={homeGymId}
                                            onChange={(e) => setHomeGymId(Number(e.target.value))}
                                            required
                                        >
                                            {gyms.map((g) => (
                                                <option key={g.id} value={g.id}>
                                                    {g.name} ({g.city})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </Form.Group>

                                {/* Botón de envío principal */}
                                {/* Main submit button */}
                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={isSubmitting}
                                        size="lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                                <span className="ms-2">Registrando...</span>
                                            </>
                                        ) : (
                                            "Crear Cuenta"
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
