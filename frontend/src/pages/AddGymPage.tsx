/**
 * =============================================================================
 * PÁGINA: AddGymPage
 * =============================================================================
 *
 * Page para que un administrador añada un nuevo gimnasio.
 * Al crear el gimnasio, automáticamente se crea un manager asociado con
 * datos reales de la persona responsable.
 *
 * MEJORAS IMPLEMENTADAS:
 * - Validación de confirmación de contraseña del manager
 * - Preview del email generado automáticamente
 * - Validación de nombres mínimos (2 caracteres)
 * - Separación visual clara entre datos del gym y del manager
 *
 * Page for an administrator to add a new gym.
 * When creating a gym, a manager is automatically created with real data
 * of the responsible person.
 *
 * IMPLEMENTED IMPROVEMENTS:
 * - Manager password confirmation validation
 * - Auto-generated email preview
 * - Minimum name validation (2 characters)
 * - Clear visual separation between gym and manager data
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
import { createGym } from "../services/gym-services";

// Importar utilidades / Import utilities
import { handleApiError } from "../utils/error-handler";

// Tipos / Types
import type { CreateGymManagerResponse } from "../interfaces/gym-interfaces";

/**
 * =============================================================================
 * ESTILOS
 * STYLES
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
  managerSection: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "2px solid #007bff",
  },
  sectionTitle: {
    marginTop: 0,
    color: "#007bff",
  },
  emailPreview: {
    fontSize: "0.9em",
    color: "#666",
    marginBottom: "15px",
  },
  helperText: {
    color: "#666",
    fontSize: "0.85em",
  },
  passwordMatch: {
    color: "#28a745",
    fontSize: "0.85em",
    marginTop: "5px",
  },
  passwordMismatch: {
    color: "#dc3545",
    fontSize: "0.85em",
    marginTop: "5px",
  },
};

/**
 * =============================================================================
 * COMPONENTE: AddGymPage
 * COMPONENT: AddGymPage
 * =============================================================================
 */
export const AddGymPage = () => {
  // --- Hooks de Enrutamiento / Routing Hooks ---
  const navigate = useNavigate();
  const { token } = useAuth();

  // --- Estados de Formulario del Gimnasio / Gym Form States ---
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  // --- Estados del Manager / Manager States ---
  const [managerFirstName, setManagerFirstName] = useState<string>("");
  const [managerLastName, setManagerLastName] = useState<string>("");
  const [managerPhone, setManagerPhone] = useState<string>("");
  const [managerPassword, setManagerPassword] = useState<string>("");
  const [managerPasswordConfirm, setManagerPasswordConfirm] =
    useState<string>(""); // ← NUEVO: Confirmación de contraseña

  // --- Estado de Error Local / Local Error State ---
  const [error, setError] = useState<string | null>(null);

  // --- Hook de API / API Hook ---
  const { loading: isSubmitting, execute: executeCreateGym } =
    useApiCall<CreateGymManagerResponse>("Error al crear el gimnasio.");

  /**
   * Genera el email del manager basado en el nombre del gimnasio
   * Generates the manager email based on the gym name
   */
  const generateManagerEmail = (gymName: string): string => {
    if (!gymName) return "nombregimnasio@gymnomads.com";

    return (
      gymName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar acentos / Remove accents
        .replace(/\s+/g, "") // Quitar espacios / Remove spaces
        .replace(/[^a-z0-9]/g, "") + // Solo letras y números / Only letters and numbers
      "@gymnomads.com"
    );
  };

  /**
   * Verifica si las contraseñas coinciden
   * Checks if passwords match
   */
  const passwordsMatch = (): boolean => {
    return (
      managerPassword.length > 0 &&
      managerPasswordConfirm.length > 0 &&
      managerPassword === managerPasswordConfirm
    );
  };

  /**
   * Verifica si hay un error de contraseñas (escritas pero no coinciden)
   * Checks if there's a password error (written but don't match)
   */
  const passwordsMismatch = (): boolean => {
    return (
      managerPasswordConfirm.length > 0 &&
      managerPassword !== managerPasswordConfirm
    );
  };

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
      case "managerFirstName":
        setManagerFirstName(value);
        break;
      case "managerLastName":
        setManagerLastName(value);
        break;
      case "managerPhone":
        setManagerPhone(value);
        break;
      case "managerPassword":
        setManagerPassword(value);
        break;
      case "managerPasswordConfirm": // ← NUEVO
        setManagerPasswordConfirm(value);
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
    if (
      !name ||
      !address ||
      !city ||
      !latitude ||
      !longitude ||
      !managerFirstName ||
      !managerLastName ||
      !managerPassword ||
      !managerPasswordConfirm // ← NUEVO
    ) {
      const errorMsg =
        "Todos los campos obligatorios deben completarse (nombre del gimnasio, dirección, ciudad, coordenadas y datos del manager).";
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

    // VALIDACIÓN 3: Nombres del manager / Manager names validation
    if (managerFirstName.trim().length < 2) {
      const errorMsg =
        "El nombre del manager debe tener al menos 2 caracteres.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (managerLastName.trim().length < 2) {
      const errorMsg =
        "Los apellidos del manager deben tener al menos 2 caracteres.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // VALIDACIÓN 4: Contraseña mínima / Minimum password length
    if (managerPassword.length < 6) {
      const errorMsg =
        "La contraseña del manager debe tener al menos 6 caracteres.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // VALIDACIÓN 5: Contraseñas coinciden / Passwords match (← NUEVO)
    if (managerPassword !== managerPasswordConfirm) {
      const errorMsg = "Las contraseñas no coinciden.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // VALIDACIÓN 6: Token de autenticación / Authentication token
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
    formData.append("manager_first_name", managerFirstName);
    formData.append("manager_last_name", managerLastName);
    formData.append("manager_password", managerPassword);
    if (managerPhone) formData.append("manager_phone", managerPhone);

    try {
      // Ejecutar creación de gimnasio + manager / Execute gym + manager creation
      const response = await executeCreateGym(() => createGym(formData, token));

      // Mostrar mensaje de éxito con email del manager / Show success message with manager email
      toast.success(
        `¡Gimnasio "${name}" creado con éxito! Manager: ${managerFirstName} ${managerLastName} (${response.managerEmail})`
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
        creará un usuario manager con los datos de la persona responsable. El
        email del manager será generado automáticamente a partir del nombre del
        gimnasio (ejemplo: nombregimnasio@gymnomads.com).
      </p>

      <form onSubmit={handleSubmit}>
        {/* ===== SECCIÓN: Datos del Gimnasio ===== */}
        {/* ===== SECTION: Gym Data ===== */}

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
          <small style={styles.helperText}>Debe estar entre -90 y 90</small>
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
          <small style={styles.helperText}>Debe estar entre -180 y 180</small>
        </div>

        {/* ===== SECCIÓN: Datos del Manager Responsable ===== */}
        {/* ===== SECTION: Responsible Manager Data ===== */}
        <div style={styles.managerSection}>
          <h3 style={styles.sectionTitle}>👤 Datos del Manager Responsable</h3>
          <p style={styles.emailPreview}>
            Email: <strong>{generateManagerEmail(name)}</strong>
          </p>

          {/* Nombre del Manager / Manager First Name */}
          <div style={styles.formGroup}>
            <label htmlFor="managerFirstName" style={styles.label}>
              Nombre: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="managerFirstName"
              id="managerFirstName"
              type="text"
              value={managerFirstName}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Ej: Pablo"
              minLength={2}
            />
            <small style={styles.helperText}>
              Nombre real de la persona responsable del gimnasio
            </small>
          </div>

          {/* Apellidos del Manager / Manager Last Name */}
          <div style={styles.formGroup}>
            <label htmlFor="managerLastName" style={styles.label}>
              Apellidos: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="managerLastName"
              id="managerLastName"
              type="text"
              value={managerLastName}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Ej: Bernabéu Ruiz"
              minLength={2}
            />
          </div>

          {/* Teléfono del Manager (Opcional) / Manager Phone (Optional) */}
          <div style={styles.formGroup}>
            <label htmlFor="managerPhone" style={styles.label}>
              Teléfono(opcional):
            </label>
            <input
              name="managerPhone"
              id="managerPhone"
              type="tel"
              value={managerPhone}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ej: +34 666 555 444"
            />
          </div>

          {/* Contraseña del Manager / Manager Password */}
          <div style={styles.formGroup}>
            <label htmlFor="managerPassword" style={styles.label}>
              Contraseña: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="managerPassword"
              id="managerPassword"
              type="password"
              value={managerPassword}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
            <small style={styles.helperText}>
              Esta contraseña será utilizada por el manager para acceder al
              sistema
            </small>
          </div>

          {/* Confirmar Contraseña del Manager / Confirm Manager Password (← NUEVO) */}
          <div style={styles.formGroup}>
            <label htmlFor="managerPasswordConfirm" style={styles.label}>
              Confirmar Contraseña: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="managerPasswordConfirm"
              id="managerPasswordConfirm"
              type="password"
              value={managerPasswordConfirm}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Repite la contraseña"
              minLength={6}
            />
            {/* Indicador visual de coincidencia / Visual match indicator */}
            {passwordsMatch() && (
              <small style={styles.passwordMatch}>
                ✓ Las contraseñas coinciden
              </small>
            )}
            {passwordsMismatch() && (
              <small style={styles.passwordMismatch}>
                ✗ Las contraseñas no coinciden
              </small>
            )}
          </div>
        </div>

        {/* Mostrar error si existe / Show error if exists */}
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Botón de envío / Submit button */}
        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Creando gimnasio y manager..." : "Crear Gimnasio"}
        </button>
      </form>

      {/* Nota informativa / Informative note */}
      <p style={styles.infoText}>
        ℹ️ <strong>Nota:</strong> Las imágenes del gimnasio (logo e imagen
        principal) podrán ser añadidas por el manager desde la página de edición
        una vez creado el gimnasio.
      </p>
    </div>
  );
};
