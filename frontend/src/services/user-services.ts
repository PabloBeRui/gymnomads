// Importar axios para realizar peticiones HTTP.
// Import axios for making HTTP requests.
import axios from "axios";

// Importar el manejador de errores centralizado.
// Import the centralized error handler.
import { handleApiError } from "../utils/error-handler";

// Interfaz para los datos de registro .
// Registration data interface

// Importar interfaces necesarias / Import necessary interfaces
import type {
  RegisterData,
  RegisterResponse,
  LoginData,
  LoginResponse,
  User,
  UpdateUserData,
} from "../interfaces/user-interfaces";

// Definir la URL base de la API.
// Define the base API URL.

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ========================================
 * API CALL: Registrar un nuevo usuario
 * API CALL: Register a new user
 * ======================================== */

// Recibe los datos del formulario (RegisterData) y devuelve la respuesta del backend.
// Receives form data (RegisterData) and returns the backend response.

export const registerUser = async (
  userData: RegisterData
): Promise<RegisterResponse> => {
  try {
    // petición POST al endpoint '/users/register' enviando los datos.
    // POST request to the '/users/register' endpoint sending the data.
    const response = await axios.post<RegisterResponse>(
      `${API_URL}/users/register`,
      userData
    );
    // Devolver los datos recibidos en la respuesta del servidor.
    // Return the data received in the server response.
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado con un mensaje por defecto específico para registro.
    // Use the centralized handler with a default message specific to registration.
    const errorMessage = handleApiError(
      error,
      "Error al intentar registrar el usuario. Inténtalo de nuevo"
    );
    // Lanzar un nuevo error con el mensaje procesado.
    // Throw a new error with the processed message.
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Iniciar sesión de usuario
 * API CALL: Log in user
 * ======================================== */

// Recibe credenciales (LoginData) y devuelve la respuesta del backend (LoginResponse).
// Receives credentials (LoginData) and returns the backend response (LoginResponse).
export const loginUser = async (
  credentials: LoginData
): Promise<LoginResponse> => {
  try {
    // Realizar petición POST al endpoint '/users/login' enviando las credenciales.
    // Perform a POST request to the '/users/login' endpoint sending the credentials.
    const response = await axios.post<LoginResponse>(
      `${API_URL}/users/login`,
      credentials
    );

    // Devolver los datos recibidos (mensaje y token).
    // Return the received data (message and token).
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado con un mensaje por defecto específico para login.
    // Use the centralized handler with a default message specific to login.
    const errorMessage = handleApiError(
      error,
      "Error al iniciar sesión. Comprueba tus credenciales."
    );
    // Lanzar un nuevo error con el mensaje procesado.
    // Throw a new error with the processed message.
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Obtener perfil del usuario autenticado
 * API CALL: Get authenticated user profile
 * ======================================== */

// Recibe el token JWT y devuelve los datos del usuario (respuesta del backend).
// Receives the JWT token and returns the user data (backend response).

export const getUserProfile = async (token: string): Promise<User> => {
  try {
    // Realizar petición GET al endpoint '/users/profile'.
    // Perform a GET request to the '/users/profile' endpoint.

    // Incluir el token en la cabecera 'Authorization' para rutas protegidas.
    // Include the token in the 'Authorization' header for protected routes.

    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`, // Formato estándar Bearer token
      },
    });

    // Devolver los datos del usuario recibidos en la respuesta.
    // Return the user data received in the response.
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado con un mensaje por defecto específico para obtener perfil.
    // Use the centralized handler with a default message specific to getting the profile.
    const errorMessage = handleApiError(
      error,
      "Error al obtener el perfil del usuario."
    );
    // Lanzar un nuevo error con el mensaje procesado.
    // Throw a new error with the processed message.
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Actualizar perfil de usuario autenticado
 * API CALL: Update authenticated user profile
 * ======================================== */

// Recibe el token y los datos a actualizar (UpdateUserData). Devuelve un mensaje de éxito.
// Receives the token and the data to update (UpdateUserData). Returns a success message.
export const updateUserProfile = async (
  token: string,
  userData: UpdateUserData
): Promise<{ message: string }> => {
  // Comprobar si hay token.
  // Check if token exists.
  if (!token) {
    throw new Error("No se proporcionó token de autenticación.");
  }
  try {
    // Realizar petición PUT al endpoint '/users/profile'.
    // Perform a PUT request to the '/users/profile' endpoint.
    // Incluir token en cabecera y datos en el cuerpo.
    // Include token in header and data in the body.
    const response = await axios.put<{ message: string }>(
      `${API_URL}/users/profile`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Devolver la respuesta del servidor (ej. mensaje de éxito).
    // Return the server response (e.g., success message).
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado.
    // Use the centralized handler.
    const errorMessage = handleApiError(
      error,
      "Error al actualizar el perfil."
    );
    // Lanzar error procesado.
    // Throw processed error.
    throw new Error(errorMessage);
  }
};



/* ========================================
 * API CALL: Subir/Actualizar foto de perfil
 * API CALL: Upload/Update profile picture
 * ======================================== */
// Subir la foto de perfil.
// Upload the profile picture.
// Recibe el token y el archivo (File). Devuelve la respuesta del backend.
// Receives the token and the file (File). Returns the backend response.
export const uploadProfilePicture = async (
  token: string,
  file: File
): Promise<{ message: string; filePath: string }> => {
  // Comprobar si hay token.
  // Check if token exists.
  if (!token) {
    throw new Error('No se proporcionó token de autenticación.');
  }
  // Comprobar si hay archivo.
  // Check if file exists.
  if (!file) {
    throw new Error('No se seleccionó ningún archivo.');
  }

  // 1. Crear un objeto FormData.
  // 1. Create a FormData object.
  // FormData es necesario para enviar archivos (multipart/form-data).
  // FormData is necessary to send files (multipart/form-data).
  const formData = new FormData();
  
  // 2. Añadir el archivo al FormData.
  // 2. Add the file to the FormData.
  // El nombre del campo ("profilePicture") DEBE coincidir con el esperado por Multer en el backend.
  // The field name ("profilePicture") MUST match the one expected by Multer in the backend.
  // En tu 'user-routes.js', usas: createUploadHandler(profilePictureUploader, "profilePicture")
  formData.append('profilePicture', file); 
  

  try {
    // 3. Realizar petición POST al endpoint '/users/profile/picture'.
    // 3. Perform POST request to the '/users/profile/picture' endpoint.
    const response = await axios.post<{ message: string; filePath: string }>(
      `${API_URL}/users/profile/picture`,
      formData, // Enviar formData como cuerpo de la petición / Send formData as the request body
      {
        headers: {
          // 4. Enviar el token de autenticación.
          // 4. Send the authentication token.
          Authorization: `Bearer ${token}`,
          // 5. IMPORTANTE: Indicar el tipo de contenido.
          // 5. IMPORTANT: Indicate the content type.
          // Axios suele hacer esto automáticamente al enviar FormData, pero es bueno saberlo.
          // Axios usually does this automatically when sending FormData, but it's good to know.
          'Content-Type': 'multipart/form-data', 
        },
      }
    );

    // Devolver la respuesta del servidor (ej. mensaje y nueva ruta del archivo).
    // Return the server response (e.g., message and new file path).
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado.
    // Use the centralized handler.
    const errorMessage = handleApiError(error, 'Error al subir la foto de perfil.');
    // Lanzar error procesado.
    // Throw processed error.
    throw new Error(errorMessage);
  }
};