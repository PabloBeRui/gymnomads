/**
 * =============================================================================
 * PÁGINA: AddGymPage
 * =============================================================================
 *
 * Página para que un administrador añada un nuevo gimnasio.
 * Al crear el gimnasio, automáticamente se crea un manager asociado.
 *
 * Page for an administrator to add a new gym.
 * When creating a gym, a manager is automatically created.
 *
 * =============================================================================
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Importar contexto / Import context
import { useAuth } from "../context/AuthContext";

// Importar hooks personalizados / Import custom hooks
import { useApiCall } from "../hooks/useApiCall";

// Importar servicios / Import services
import { createGym, getAllGyms } from "../services/gym-services";

// Importar utilidades / Import utilities
import { handleApiError } from "../utils/error-handler";

// Tipos / Types
import type { CreateGymManagerResponse } from "../interfaces/gym-interfaces";

/**
 * =============================================================================
 * ESTILOS
 * =============================================================================
 */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "20px auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  errorText: {
    color: "red",
    fontSize: "0.9em",
    marginTop: "10px",
  },
  infoText: {
    color: "#666",
    fontSize: "0.9em",
    fontStyle: "italic",
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
  warningText: {
    color: "#856404",
    fontSize: "0.9em",
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeeba",
    borderRadius: "4px",
  },
};

/**
 * =============================================================================
 * COMPONENTE: AddGymPage
 * =============================================================================
 */
export const AddGymPage = () => {
  // --- Hooks de Enrutamiento / Routing Hooks ---
  const navigate = useNavigate();
  const { token } = useAuth();

  // --- Estados de Formulario / Form States ---
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // --- Estado de Error Local / Local Error State ---
  const [error, setError] = useState<string | null>(null);

  // --- Hook de API / API Hook ---
  const { loading: isSubmitting, execute: executeCreateGym } =
    useApiCall<CreateGymManagerResponse>("Error al crear el gimnasio.");

  // --- Manejadores / Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "city":
        setCity(value);
        break;
      case "latitude":
        setLatitude(value);
        break;
      case "longitude":
        setLongitude(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "phone":
        setPhone(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    // VALIDACIÓN 1: Campos obligatorios / Required fields
    if (!name || !address || !city || !latitude || !longitude || !password) {
      const errorMsg =
        "Todos los campos obligatorios deben completarse (nombre, dirección, ciudad, coordenadas y contraseña del manager).";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // VALIDACIÓN 2: Coordenadas válidas / Valid coordinates
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lonNum)) {
      const errorMsg = "Latitud y Longitud deben ser números válidos.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (latNum < -90 || latNum > 90) {
      const errorMsg = "La latitud debe estar entre -90 y 90.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (lonNum < -180 || lonNum > 180) {
      const errorMsg = "La longitud debe estar entre -180 y 180.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // VALIDACIÓN 3: Contraseña mínima / Minimum password length
    if (password.length < 6) {
      const errorMsg =
        "La contraseña del manager debe tener al menos 6 caracteres.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // VALIDACIÓN 4: Comprobar que no exista un gimnasio con el mismo nombre
    // Validation 4: Check that a gym with the same name doesn't exist
    try {
      const existingGyms = await getAllGyms();
      const gymExists = existingGyms.some(
        (gym) => gym.name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (gymExists) {
        const errorMsg =
          "Ya existe un gimnasio con ese nombre. Por favor, elige otro nombre.";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    } catch (err) {
      const errorMsg = "Error al verificar gimnasios existentes.";
      setError(errorMsg);
      toast.error(errorMsg);
      if (import.meta.env.DEV) {
        console.error("Error checking existing gyms:", err);
      }
      return;
    }

    // VALIDACIÓN 5: Token de autenticación / Authentication token
    if (!token) {
      const errorMsg =
        "No se está autenticado. Por favor, iniciar sesión de nuevo.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Crear FormData con todos los campos / Create FormData with all fields
    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("latitude", String(latNum));
    formData.append("longitude", String(lonNum));
    formData.append("password", password);
    if (phone) formData.append("phone", phone); // Teléfono opcional / Optional phone

    try {
      // Ejecutar creación de gimnasio + manager / Execute gym + manager creation
      const response = await executeCreateGym(() => createGym(formData, token));

      // Mostrar mensaje de éxito con email del manager / Show success message with manager email
      toast.success(
        `¡Gimnasio creado con éxito! Manager: ${response.managerEmail}`
      );

      // Navegar a la lista de gimnasios / Navigate to gyms list
      navigate("/gyms");
    } catch (err) {
      const processedErrorMessage = handleApiError(
        err,
        "Ocurrió un error al añadir el gimnasio."
      );
      toast.error(processedErrorMessage);
      setError(processedErrorMessage);

      if (import.meta.env.DEV) {
        console.error("Error creating gym:", err);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Añadir Nuevo Gimnasio</h2>

      <p style={styles.warningText}>
        ⚠️ <strong>Importante:</strong> Al crear el gimnasio, automáticamente se
        creará un usuario manager asociado. El email del manager será generado
        automáticamente a partir del nombre del gimnasio (ejemplo:
        nombregimnasio@gymnomads.com).
      </p>

      <form onSubmit={handleSubmit}>
        {/* Nombre del Gimnasio / Gym Name */}
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            Nombre del Gimnasio: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="name"
            id="name"
            type="text"
            value={name}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="Ej: CrossFit Madrid Centro"
          />
        </div>

        {/* Dirección / Address */}
        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.label}>
            Dirección: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="address"
            id="address"
            type="text"
            value={address}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="Ej: Calle Gran Vía 123"
          />
        </div>

        {/* Ciudad / City */}
        <div style={styles.formGroup}>
          <label htmlFor="city" style={styles.label}>
            Ciudad: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="city"
            id="city"
            type="text"
            value={city}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="Ej: Madrid"
          />
        </div>

        {/* Latitud / Latitude */}
        <div style={styles.formGroup}>
          <label htmlFor="latitude" style={styles.label}>
            Latitud: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="latitude"
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="Ej: 40.416775"
            min={-90}
            max={90}
          />
          <small style={{ color: "#666", fontSize: "0.85em" }}>
            Debe estar entre -90 y 90
          </small>
        </div>

        {/* Longitud / Longitude */}
        <div style={styles.formGroup}>
          <label htmlFor="longitude" style={styles.label}>
            Longitud: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="longitude"
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="Ej: -3.70379"
            min={-180}
            max={180}
          />
          <small style={{ color: "#666", fontSize: "0.85em" }}>
            Debe estar entre -180 y 180
          </small>
        </div>

        {/* Contraseña del Manager / Manager Password */}
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>
            Contraseña del Manager: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="password"
            id="password"
            type="password"
            value={password}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="Mínimo 6 caracteres"
            minLength={6}
          />
          <small style={{ color: "#666", fontSize: "0.85em" }}>
            Esta contraseña será utilizada por el manager para acceder al
            sistema
          </small>
        </div>

        {/* Teléfono del Manager (Opcional) / Manager Phone (Optional) */}
        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>
            Teléfono del Manager (opcional):
          </label>
          <input
            name="phone"
            id="phone"
            type="tel"
            value={phone}
            onChange={handleChange}
            style={styles.input}
            placeholder="Ej: +34 600 000 000"
          />
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Creando gimnasio y manager..." : "Crear Gimnasio"}
        </button>
      </form>

      <p style={styles.infoText}>
        ℹ️ Nota: Las imágenes del gimnasio (logo e imagen principal) deben ser
        gestionadas por el manager desde la página de edición una vez creado el
        gimnasio.
      </p>
    </div>
  );
};
