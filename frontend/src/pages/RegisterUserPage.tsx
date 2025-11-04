/**
 * =============================================================================
 * PÁGINA: RegisterUserPage
 * =============================================================================
 *
 * Página para registro de usuarios con subida opcional de foto de perfil.
 * Page for user registration with optional profile picture upload.
 *
 * Uso:
 * - Rellena los campos, opcionalmente selecciona foto de perfil y pulsa Registrar.
 * - On submit: registerUser(...) y, si hay foto seleccionada, uploadImage(token).
 *
 *
 * =============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Contexto de autenticación / Auth context
import { useAuth } from "../context/AuthContext";

// Hooks reutilizables / Reusable hooks
import { useApiCall } from "../hooks/useApiCall";
import { useImageUpload } from "../hooks/useImageUpload";

// Componentes / Components
import { ImageUploadPreview } from "../components/ImageUploadPreview";

// Servicios / Services
import {
  registerUser,
  getUserProfile,
  uploadProfilePicture,
} from "../services/user-services";
import { getAllGyms } from "../services/gym-services";

// Tipos / Types
import type {
  RegisterData,
  UploadProfilePictureResponse,
} from "../interfaces/user-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";

/**
 * =============================================================================
 * COMPONENTE: RegisterUserPage
 * =============================================================================
 *
 * - Gestiona formulario de registro y subida opcional de foto de perfil.
 * - Handles registration form and optional profile picture upload.
 * =============================================================================
 */

export const RegisterUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin, setUser } = useAuth();

  // --- Form state / Estado del formulario ---
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>(""); // usado en el payload de registro / used in registration payload
  const [homeGymId, setHomeGymId] = useState<number>(0);

  // --- Gyms list (para seleccionar homeGym) / Lista de gimnasios para seleccionar homeGym ---
  const [gyms, setGyms] = useState<Gym[]>([]);

  // --- Hooks / Hooks ---
  const { loading: isRegistering, execute: executeRegister } = useApiCall(
    "Error al registrar el usuario."
  );
  const { loading: isLoadingGyms, execute: executeLoadGyms } = useApiCall(
    "Error al cargar los gimnasios."
  );

  /**
   * useImageUpload para foto de perfil:
   * - UploadArgs = [string] (token)
   * - UploadResult = UploadProfilePictureResponse (según interfaces)
   *
   * Typed: uploadImage(token)
   */
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
        invalidType: "La foto de perfil debe ser PNG, JPG, JPEG o WEBP",
        maxSize: "La foto de perfil no debe superar los 5MB",
      },
    },
    // uploadFn: (file, token) => uploadProfilePicture(token, file)
    async (file: File, token: string) =>
      (await uploadProfilePicture(token, file)) as UploadProfilePictureResponse,
    "Error al subir la foto de perfil."
  );

  // --- Efecto: cargar lista de gimnasios al montar / Load gyms on mount ---
  useEffect(() => {
    const loadGyms = async () => {
      try {
        const gymsData = await executeLoadGyms(() => getAllGyms());
        setGyms(gymsData);

        // Seleccionar primer gimnasio por defecto si existe / Select first gym by default if any
        if (gymsData.length > 0 && homeGymId === 0) {
          setHomeGymId(gymsData[0].id);
        }
      } catch (err) {
        // useApiCall ya muestra toast en caso de error / useApiCall already shows toast on error
        if (import.meta.env.DEV) {
          console.error("⚠️ Error: ", err);
        }
      }
    };
    loadGyms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handler: registro / Register handler ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones cliente / Client-side validations
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Todos los campos obligatorios deben completarse.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      const registerPayload: RegisterData = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
        home_gym_id: homeGymId,
      };

      // Registrar usuario (devuelve token + posiblemente datos de usuario)
      const registration = await executeRegister(() =>
        registerUser(registerPayload)
      );

      // Si hay foto seleccionada, subirla con el token devuelto
      if (selectedFile) {
        await uploadImage(registration.token);
      }

      // Intentar obtener perfil completo y establecer en el contexto
      try {
        const profile = await getUserProfile(registration.token);
        setUser(profile);
      } catch {
        // best-effort: si falla no bloqueamos el flujo
      }

      // Hacer login local con token si existe la función / local login if available
      if (authLogin) {
        authLogin(registration.token);
      }

      toast.success("Registro completado.");
      navigate("/");
    } catch (err) {
      // useApiCall toast
      if (import.meta.env.DEV) {
        console.error("⚠️ Error: ", err);
      }
      toast.error("Error al registrar.");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "20px auto" }}>
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: 8 }}>
          <label>Nombre</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Apellidos</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Contraseña</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Confirmar contraseña</label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Teléfono (opcional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
          />
        </div>

        {/* Selección de gimnasio / Home gym selection */}
        <div style={{ marginBottom: 12 }}>
          <label>Tu Gimnasio</label>
          {isLoadingGyms ? (
            <div>Loading gyms...</div>
          ) : (
            <select
              value={homeGymId}
              onChange={(e) => setHomeGymId(Number(e.target.value))}>
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.city})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Foto de perfil / Profile picture */}
        <div style={{ marginTop: 12 }}>
          <label>Foto de perfil (opcional)</label>
          <input
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
            helpText="Haz clic para seleccionar foto / Click to select photo"
          />
        </div>

        <button
          type="submit"
          disabled={isRegistering || isUploading}
          style={{ marginTop: 12 }}>
          {isRegistering || isUploading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
};
