/**
 * =============================================================================
 * PÁGINA: AddGymPage
 * =============================================================================
 *
 * Página para que un administrador añada un nuevo gimnasio.
 * Page for an administrator to add a new gym.
 *
 * NOTA: El administrador NO puede subir imágenes del gimnasio.
 * NOTE: The administrator CANNOT upload gym images.
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

// Tipos
import type { Gym } from "../interfaces/gym-interfaces";

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

  // --- Estado de Error Local / Local Error State ---
  const [error, setError] = useState<string | null>(null);

  // --- Hook de API / API Hook ---
  const { loading: isSubmitting, execute: executeCreateGym } = useApiCall<Gym>(
    "Error al crear el gimnasio."
  );

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
      default:
        break;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    // VALIDACIONES
    if (!name || !address || !city || !latitude || !longitude) {
      const errorMsg = "Todos los campos son obligatorios.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

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

    if (!token) {
      const errorMsg =
        "No se está autenticado. Por favor, iniciar sesión de nuevo.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("latitude", String(latNum));
    formData.append("longitude", String(lonNum));

    try {
      // esperar la creación (capturará errores en el catch)
      await executeCreateGym(() => createGym(formData, token));

      // éxito: mostrar toast y navegar siempre a /gyms
      toast.success("¡Gimnasio añadido con éxito!");
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

      <p style={styles.infoText}>
        ℹ️ Nota: El administrador no puede subir imágenes del gimnasio. Las
        imágenes (logo e imagen principal) deben ser gestionadas por el manager
        del gimnasio desde la página de edición.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            Nombre: <span style={{ color: "red" }}>*</span>
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

        {error && <p style={styles.errorText}>{error}</p>}

        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Añadiendo..." : "Añadir Gimnasio"}
        </button>
      </form>
    </div>
  );
};
