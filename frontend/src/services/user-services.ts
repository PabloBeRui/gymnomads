// Importar axios para realizar peticiones HTTP.
// Import axios for making HTTP requests.
import axios from "axios";

// Importar el manejador de errores centralizado.
// Import the centralized error handler.
import { handleApiError } from "../utils/error-handler";

// Importar interfaces necesarias / Import necessary interfaces
import type {
  RegisterData,
  RegisterResponse,
  LoginData,
  LoginResponse,
  User,
  UpdateUserData,
  GymUser,
  ManagerWithGym,
  UserWithGym,
  UpdateManagerData,
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
    throw new Error("No se proporcionó token de autenticación.");
  }
  // Comprobar si hay archivo.
  // Check if file exists.
  if (!file) {
    throw new Error("No se seleccionó ningún archivo.");
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
  formData.append("profilePicture", file);

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
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Devolver la respuesta del servidor (ej. mensaje y nueva ruta del archivo).
    // Return the server response (e.g., message and new file path).
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado.
    // Use the centralized handler.
    const errorMessage = handleApiError(
      error,
      "Error al subir la foto de perfil."
    );
    // Lanzar error procesado.
    // Throw processed error.
    throw new Error(errorMessage);
  }
};

/* ========================================
 * FUNCIONES PARA GESTIÓN DE USUARIOS (Admin/Manager)
 * FUNCTIONS FOR USER MANAGEMENT (Admin/Manager)
 * ======================================== */

/* ========================================
 * API CALL: Obtener todos los usuarios con filtros (Admin)
 * API CALL: Get all users with filters (Admin)
 * ======================================== */

// Interfaz para los filtros opcionales de getAllUsers
// Interface for optional filters of getAllUsers
interface GetAllUsersFilters {
  gym_id?: number;
  search?: string;
}

// Obtener todos los usuarios con role='user' (solo Admin)
// Get all users with role='user' (Admin only)
export const getAllUsers = async (
  token: string,
  filters?: GetAllUsersFilters
): Promise<UserWithGym[]> => {
  // Comprobar si hay token
  // Check if token exists
  if (!token) {
    throw new Error("No se proporcionó token de autenticación.");
  }

  try {
    // Construir query params si hay filtros
    // Build query params if filters exist
    const params = new URLSearchParams();
    if (filters?.gym_id) {
      params.append("gym_id", filters.gym_id.toString());
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    // Realizar petición GET al endpoint '/users' con filtros opcionales
    // Perform GET request to '/users' endpoint with optional filters
    const url = `${API_URL}/users${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await axios.get<UserWithGym[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Devolver la lista de usuarios
    // Return the list of users
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "Error al obtener la lista de usuarios."
    );
    // Lanzar error procesado
    // Throw processed error
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Obtener todos los managers con filtros (Admin)
 * API CALL: Get all managers with filters (Admin)
 * ======================================== */

// Interfaz para los filtros opcionales de getAllManagers
// Interface for optional filters of getAllManagers
interface GetAllManagersFilters {
  city?: string;
  search?: string;
}

// Obtener todos los managers con role='manager' (solo Admin)
// Get all managers with role='manager' (Admin only)
export const getAllManagers = async (
  token: string,
  filters?: GetAllManagersFilters
): Promise<ManagerWithGym[]> => {
  // Comprobar si hay token
  // Check if token exists
  if (!token) {
    throw new Error("No se proporcionó token de autenticación.");
  }

  try {
    // Construir query params si hay filtros
    // Build query params if filters exist
    const params = new URLSearchParams();
    if (filters?.city) {
      params.append("city", filters.city);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    // Realizar petición GET al endpoint '/users/managers' con filtros opcionales
    // Perform GET request to '/users/managers' endpoint with optional filters
    const url = `${API_URL}/users/managers${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await axios.get<ManagerWithGym[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Devolver la lista de managers
    // Return the list of managers
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "Error al obtener la lista de managers."
    );
    // Lanzar error procesado
    // Throw processed error
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Obtener usuarios de un gimnasio específico (Admin/Manager)
 * API CALL: Get users from a specific gym (Admin/Manager)
 * ======================================== */

// Interfaz para los filtros opcionales de getUsersByGym
// Interface for optional filters of getUsersByGym
interface GetUsersByGymFilters {
  search?: string;
}

// Obtener usuarios de un gimnasio específico (Admin puede ver cualquier gym, Manager solo el suyo)
// Get users from a specific gym (Admin can see any gym, Manager only theirs)
export const getUsersByGym = async (
  token: string,
  gymId: number,
  filters?: GetUsersByGymFilters
): Promise<GymUser[]> => {
  // Comprobar si hay token
  // Check if token exists
  if (!token) {
    throw new Error("No se proporcionó token de autenticación.");
  }

  try {
    // Construir query params si hay filtros
    // Build query params if filters exist
    const params = new URLSearchParams();
    if (filters?.search) {
      params.append("search", filters.search);
    }

    // Realizar petición GET al endpoint '/gyms/:gymId/users' con filtros opcionales
    // Perform GET request to '/gyms/:gymId/users' endpoint with optional filters
    const url = `${API_URL}/gyms/${gymId}/users${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await axios.get<GymUser[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Devolver la lista de usuarios del gimnasio
    // Return the list of gym users
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "Error al obtener los usuarios del gimnasio."
    );
    // Lanzar error procesado
    // Throw processed error
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Actualizar datos de un manager (Admin)
 * API CALL: Update manager data (Admin)
 * ======================================== */

// Actualizar información de un manager (nombre, apellidos, teléfono)
// Update manager information (first name, last name, phone)
// NOTA: El email NO se puede actualizar (está vinculado al gimnasio)
// NOTE: Email CANNOT be updated (it's linked to the gym)
export const updateManager = async (
  token: string,
  userId: number,
  managerData: UpdateManagerData
): Promise<{ message: string; user: ManagerWithGym }> => {
  // Comprobar si hay token
  // Check if token exists
  if (!token) {
    throw new Error("No se proporcionó token de autenticación.");
  }

  try {
    // Realizar petición PUT al endpoint '/users/:id'
    // Perform PUT request to '/users/:id' endpoint
    const response = await axios.put<{ message: string; user: ManagerWithGym }>(
      `${API_URL}/users/${userId}`,
      managerData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Devolver la respuesta del servidor (mensaje y usuario actualizado)
    // Return the server response (message and updated user)
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(
      error,
      "Error al actualizar los datos del manager."
    );
    // Lanzar error procesado
    // Throw processed error
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Eliminar un manager (Admin)
 * API CALL: Delete a manager (Admin)
 * ======================================== */

// Eliminar un manager por ID (solo Admin)
// Delete a manager by ID (Admin only)
// NOTA: Esto eliminará el usuario manager de la base de datos
// NOTE: This will delete the manager user from the database
export const deleteManager = async (
  token: string,
  userId: number
): Promise<{ message: string }> => {
  // Comprobar si hay token
  // Check if token exists
  if (!token) {
    throw new Error("No se proporcionó token de autenticación.");
  }

  try {
    // Realizar petición DELETE al endpoint '/users/:id'
    // Perform DELETE request to '/users/:id' endpoint
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Devolver la respuesta del servidor
    // Return the server response
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(error, "Error al eliminar el manager.");
    // Lanzar error procesado
    // Throw processed error
    throw new Error(errorMessage);
  }
};

/* ========================================
 * API CALL: Eliminar un usuario (Admin/Manager)
 * API CALL: Delete a user (Admin/Manager)
 * ======================================== */

// Eliminar un usuario por ID (Admin o Manager de su gym)
// Delete a user by ID (Admin or Manager of their gym)
export const deleteUser = async (
  token: string,
  userId: number
): Promise<{ message: string }> => {
  // Comprobar si hay token
  // Check if token exists
  if (!token) {
    throw new Error("No se proporcionó token de autenticación.");
  }

  try {
    // Realizar petición DELETE al endpoint '/users/:id'
    // Perform DELETE request to '/users/:id' endpoint
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Devolver la respuesta del servidor (en este caso, 204 No Content no devuelve body,
    // pero nuestro controller de admin sí, así que lo maneja)
    // Return the server response
    return response.data;
  } catch (error) {
    // Usar el manejador centralizado
    // Use the centralized handler
    const errorMessage = handleApiError(error, "Error al eliminar el usuario.");
    // Lanzar error procesado
    // Throw processed error
    throw new Error(errorMessage);
  }
};
