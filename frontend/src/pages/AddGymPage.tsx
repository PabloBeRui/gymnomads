/**
 * =============================================================================
 * PÁGINA: AddGymPage
 * =============================================================================
 *
 * Page para que un administrador añada un nuevo gimnasio.
 * Al crear el gimnasio, automáticamente se crea un manager asociado con
 * datos reales de la persona responsable.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
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
 * Refactored to use React-Bootstrap and SASS Modules.
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

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Form, Button, Alert } from "react-bootstrap";

import { CloseButton } from "../components/ui/CloseButton"; // Importar el botón de cierre // Import the close button

// Importar el módulo SCSS / Import the SCSS module
import styles from "./AddGymPage.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx

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
  const [gymHours, setGymHours] = useState<string>(""); // NUEVO: Estado para el horario del gimnasio

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => { // Actualizado para incluir HTMLTextAreaElement
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
      case "gymHours": // NUEVO: Manejar el estado del horario
        setGymHours(value);
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
    if (gymHours) formData.append("gym_hours", gymHours); // NUEVO: Añadir gym_hours si existe
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
    <div className={styles.pageWrapper} onClick={() => navigate(-1)}>
      <Container className={clsx(styles.container)} onClick={(e) => e.stopPropagation()}>
        <CloseButton
          onClick={() => navigate(-1)}
          className={styles.closeButton}
          color="#FFB700"
          ariaLabel="Volver a la página anterior"
        />
        <h2 className="text-primary pt-3 mb-4 text-center">Añadir Nuevo Gimnasio</h2>

      <Alert variant="warning" className="mb-4">
        <strong>Importante:</strong> Al crear el gimnasio, automáticamente se
        creará un usuario manager con los datos de la persona responsable. El
        email del manager será generado automáticamente a partir del nombre del
        gimnasio (ejemplo: <span className="text-primary">nombregimnasio@gymnomads.com</span>).
      </Alert>

      <Form onSubmit={handleSubmit}>
        {/* ===== SECCIÓN: Datos del Gimnasio ===== */}
        {/* ===== SECTION: Gym Data ===== */}
        <h3 className="text-primary mb-3">Datos del Gimnasio</h3>

        {/* Nombre del Gimnasio / Gym Name */}
        <Form.Group className="mb-3" controlId="name">
          <Form.Label className="text-secondary fw-bold">
            Nombre del Gimnasio: <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            name="name"
            type="text"
            value={name}
            onChange={handleChange}
            required
            placeholder="Ej: María Píta fitness"
          />
        </Form.Group>

        {/* Dirección / Address */}
        <Form.Group className="mb-3" controlId="address">
          <Form.Label className="text-secondary fw-bold">
            Dirección: <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            name="address"
            type="text"
            value={address}
            onChange={handleChange}
            required
            placeholder="Ej: Calle Paseo de ronda 1"
          />
        </Form.Group>

        {/* Ciudad / City */}
        <Form.Group className="mb-3" controlId="city">
          <Form.Label className="text-secondary fw-bold">
            Ciudad: <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            name="city"
            type="text"
            value={city}
            onChange={handleChange}
            required
            placeholder="Ej: La Coruña"
          />
        </Form.Group>

        {/* Latitud / Latitude */}
        <Form.Group className="mb-3" controlId="latitude">
          <Form.Label className="text-secondary fw-bold">
            Latitud: <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            name="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={handleChange}
            required
            placeholder="Ej: 43.371222"
            min={-90}
            max={90}
          />
          <Form.Text className={clsx(styles.helperText, "text-dark")}>
            Debe estar entre -90 y 90
          </Form.Text>
        </Form.Group>

        {/* Longitud / Longitude */}
        <Form.Group className="mb-3" controlId="longitude">
          <Form.Label className="text-secondary fw-bold">
            Longitud: <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            name="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={handleChange}
            required
            placeholder="Ej: -8.396111"
            min={-180}
            max={180}
          />
          <Form.Text className={clsx(styles.helperText, "text-dark")}>
            Debe estar entre -180 y 180
          </Form.Text>
        </Form.Group>

        {/* Horario del Gimnasio / Gym Hours */}
        <Form.Group className="mb-3" controlId="gymHours">
          <Form.Label className="text-secondary fw-bold">
            Horario: <span className="text-secondary fw-normal">(opcional)</span>
          </Form.Label>
          <Form.Control
            name="gymHours"
            as="textarea"
            rows={3}
            value={gymHours}
            onChange={handleChange}
            placeholder="Ej: L-V: 07:00 - 23:00 S: 09:00 - 14:00 D: Cerrado"
          />
          <Form.Text className={clsx(styles.helperText, "text-dark")}>
            Introduce el horario de apertura del gimnasio. Los saltos de línea se respetarán.
          </Form.Text>
        </Form.Group>

        {/* ===== SECCIÓN: Datos del Manager Responsable ===== */}
        {/* ===== SECTION: Responsible Manager Data ===== */}
        <div className={clsx(styles.managerSection, "mt-4")}>
          <h3 className={clsx(styles.sectionTitle, "text-primary", "mb-3")}>
            Manager Responsable
          </h3>
          
          {/* Tarjeta de Email Generado / Generated Email Card */}
          <div className={styles.emailCard}>
            <div className={styles.emailIconContainer}>
              <i className="bi bi-envelope-at"></i>
            </div>
            <div>
              <span className={styles.emailLabel}>Email de Acceso (Autogenerado)</span>
              <div className={styles.generatedEmail}>
                {generateManagerEmail(name)}
              </div>
            </div>
          </div>

          {/* Nombre del Manager / Manager First Name */}
          <Form.Group className="mb-3" controlId="managerFirstName">
            <Form.Label className="text-secondary fw-bold">
              Nombre: <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="managerFirstName"
              type="text"
              value={managerFirstName}
              onChange={handleChange}
              required
              placeholder="Ej: Pablo"
              minLength={2}
            />
            <Form.Text className={clsx(styles.helperText, "text-dark")}>
              Nombre real de la persona responsable del gimnasio
            </Form.Text>
          </Form.Group>

          {/* Apellidos del Manager / Manager Last Name */}
          <Form.Group className="mb-3" controlId="managerLastName">
            <Form.Label className="text-secondary fw-bold">
              Apellidos: <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="managerLastName"
              type="text"
              value={managerLastName}
              onChange={handleChange}
              required
              placeholder="Ej: Bellón Ruibal"
              minLength={2}
            />
          </Form.Group>

          {/* Teléfono del Manager (Opcional) / Manager Phone (Optional) */}
          <Form.Group className="mb-3" controlId="managerPhone">
            <Form.Label className="text-secondary fw-bold">Teléfono(opcional):</Form.Label>
            <Form.Control
              name="managerPhone"
              type="tel"
              value={managerPhone}
              onChange={handleChange}
              placeholder="Ej: +34 666 555 444"
            />
          </Form.Group>

          {/* Contraseña del Manager / Manager Password */}
          <Form.Group className="mb-3" controlId="managerPassword">
            <Form.Label className="text-secondary fw-bold">
              Contraseña: <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="managerPassword"
              type="password"
              value={managerPassword}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
            <Form.Text className={clsx(styles.helperText, "text-dark")}>
              Esta contraseña será utilizada por el manager para acceder al
              sistema
            </Form.Text>
          </Form.Group>

          {/* Confirmar Contraseña del Manager / Confirm Manager Password (← NUEVO) */}
          <Form.Group className="mb-3" controlId="managerPasswordConfirm">
            <Form.Label className="text-secondary fw-bold">
              Confirmar Contraseña: <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="managerPasswordConfirm"
              type="password"
              value={managerPasswordConfirm}
              onChange={handleChange}
              required
              placeholder="Repite la contraseña"
              minLength={6}
            />
            {/* Indicador visual de coincidencia / Visual match indicator */}
            {passwordsMatch() && (
              <small className={clsx(styles.passwordMatch, "text-success")}>
                ✓ Las contraseñas coinciden
              </small>
            )}
            {passwordsMismatch() && (
              <small className={clsx(styles.passwordMismatch, "text-danger")}>
                ✗ Las contraseñas no coinciden
              </small>
            )}
          </Form.Group>
        </div>

        {/* Mostrar error si existe / Show error if exists */}
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="d-flex justify-content-center mt-3">
          {/* Botón de envío / Submit button */}
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}>
            {isSubmitting ? "Creando gimnasio y manager..." : "Crear Gimnasio"}
          </Button>
        </div>
      </Form>

      {/* Nota informativa / Informative note */}
      <Alert variant="info" className="mt-4">
        ℹ️ <strong>Nota:</strong> Las imágenes del gimnasio (logo e imagen
        principal) podrán ser añadidas por el manager desde la página de edición
        una vez creado el gimnasio.
      </Alert>
    </Container>
    </div>
  );
};