/**
 * =============================================================================
 * PÁGINA: RegisterUserPage
 * =============================================================================
 *
 * Página de registro de nuevos usuarios.
 * New user registration page.
 *
 * Flujo completo / Complete flow:
 * 1. Usuario llena el formulario / User fills the form
 * 2. Opcionalmente selecciona foto de perfil / Optionally selects profile picture
 * 3. Se validan los datos / Data is validated
 * 4. Se registra el usuario / User is registered
 * 5. Si hay foto, se sube al servidor / If there's a photo, it's uploaded
 * 6. Se autentica automáticamente / User is authenticated automatically
 * 7. Redirección a home / Redirect to home
 *
 * ✅ REFACTORIZADO: Código simplificado usando hooks personalizados
 * ✅ REFACTORED: Simplified code using custom hooks
 * =============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Importar contexto de autenticación / Import authentication context
import { useAuth } from "../context/AuthContext";

// Importar hooks personalizados / Import custom hooks
import { useApiCall } from "../hooks/useApiCall";
import { useProfilePictureUpload } from "../hooks/useProfilePictureUpload";

// Importar componente de preview / Import preview component
import { ImageUploadPreview } from "../components/ImageUploadPreview";

// Importar servicios / Import services
import { registerUser, getUserProfile } from "../services/user-services";
import { getAllGyms } from "../services/gym-services";

// Importar interfaces / Import interfaces
import type { RegisterData } from "../interfaces/user-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";

/**
 * =============================================================================
 * COMPONENTE: RegisterUserPage
 * =============================================================================
 */
export const RegisterUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin, setUser } = useAuth();

  // --- Estados del Formulario / Form States ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ CORREGIDO: homeGymId es requerido, no puede ser undefined
  const [homeGymId, setHomeGymId] = useState<number>(0);

  // --- Estado de Gimnasios / Gyms State ---
  const [gyms, setGyms] = useState<Gym[]>([]);

  // --- Hooks Personalizados / Custom Hooks ---

  // Hook para registrar usuario / Hook for user registration
  const { loading: isRegistering, execute: executeRegister } = useApiCall(
    "Error al registrar el usuario."
  );

  // Hook para cargar gimnasios / Hook for loading gyms
  const { loading: isLoadingGyms, execute: executeLoadGyms } = useApiCall(
    "Error al cargar los gimnasios."
  );

  // ✅ REFACTORIZADO: Hook especializado para foto de perfil
  // ✅ REFACTORED: Specialized hook for profile picture
  const {
    selectedFile,
    previewUrl,
    fileInputRef,
    handleFileChange,
    handleImageClick,
    isUploading,
    uploadImage,
  } = useProfilePictureUpload();

  // --- Efectos / Effects ---

  /**
   * Cargar lista de gimnasios al montar el componente
   * Load gym list when component mounts
   */
  useEffect(() => {
    const loadGyms = async () => {
      try {
        const gymsData = await executeLoadGyms(() => getAllGyms());
        setGyms(gymsData);

        // ✅ AÑADIDO: Si hay gimnasios, seleccionar el primero por defecto
        if (gymsData.length > 0 && homeGymId === 0) {
          setHomeGymId(gymsData[0].id);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("❌ Error al cargar gimnasios:", error);
        }
        toast.error("No se pudieron cargar los gimnasios.");
      }
    };

    loadGyms();
  }, []);

  // --- Validaciones / Validations ---

  /**
   * Validar que todos los campos requeridos estén completos
   * Validate that all required fields are completed
   */
  const validateForm = (): boolean => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      toast.error("Por favor, completa todos los campos obligatorios.");
      return false;
    }

    // ✅ AÑADIDO: Validar que se haya seleccionado un gimnasio
    if (!homeGymId || homeGymId === 0) {
      toast.error("Por favor, selecciona un gimnasio base.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return false;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, ingresa un email válido.");
      return false;
    }

    return true;
  };

  // --- Manejadores / Handlers ---

  /**
   * =============================================================================
   * FUNCIÓN: handleSubmit
   * =============================================================================
   *
   * Maneja el envío del formulario de registro.
   * Handles registration form submission.
   *
   * Flujo / Flow:
   * 1. Validar formulario / Validate form
   * 2. Registrar usuario / Register user
   * 3. Autenticar usuario / Authenticate user
   * 4. Subir foto (si existe) / Upload photo (if exists)
   * 5. Actualizar perfil / Update profile
   * 6. Redirigir / Redirect
   * =============================================================================
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar formulario / Validate form
    if (!validateForm()) return;

    try {
      // 2. Registrar Usuario / Register User
      const registerData: RegisterData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        home_gym_id: homeGymId, // ✅ CORREGIDO: Ahora siempre es number
      };

      if (import.meta.env.DEV) {
        console.log("📝 Registrando usuario:", {
          ...registerData,
          password: "***",
        });
      }

      const registerResponse = await executeRegister(() =>
        registerUser(registerData)
      );

      // Validar que el servidor devolvió un token
      if (!registerResponse.token) {
        if (import.meta.env.DEV) {
          console.error(
            "❌ El servidor no devolvió un token de autenticación."
          );
        }
        throw new Error(
          "No se pudo completar el registro. Por favor, inténtalo de nuevo."
        );
      }

      console.log("✅ Usuario registrado con ID:", registerResponse.userId);

      // 3. Autenticar al usuario / Authenticate user
      await authLogin(registerResponse.token);
      console.log("✅ Usuario autenticado correctamente");

      // 4. Subir Imagen de Perfil (si existe) / Upload Profile Picture (if exists)
      if (selectedFile) {
        console.log("📸 Subiendo imagen de perfil:", selectedFile.name);

        try {
          // Pequeño delay para asegurar que el token esté configurado
          await new Promise((resolve) => setTimeout(resolve, 500));

          // ✅ REFACTORIZADO: Usar función del hook especializado
          const uploadResult = await uploadImage(registerResponse.token);

          console.log("✅ Imagen de perfil subida:", uploadResult.filePath);

          // 5. Actualizar el estado del usuario con la nueva foto
          try {
            const updatedUserData = await getUserProfile(
              registerResponse.token
            );
            setUser(updatedUserData);
            console.log("✅ Perfil actualizado con la imagen en el estado");
          } catch (profileError) {
            if (import.meta.env.DEV) {
              console.warn(
                "⚠️ No se pudo actualizar el perfil tras subir imagen:",
                profileError
              );
            }
          }
        } catch (uploadError) {
          if (import.meta.env.DEV) {
            console.error("⚠️ Error al subir la imagen:", uploadError);
          }
          toast.warning(
            "Tu cuenta se creó correctamente. Podrás añadir tu foto desde el perfil.",
            { duration: 4000 }
          );
        }
      }

      // 6. Mostrar éxito y redirigir / Show success and redirect
      toast.success("¡Bienvenido a GymNomads! Tu cuenta ha sido creada.");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("❌ Error en el registro:", error);
      }
      // El error ya fue manejado por useApiCall y mostrado con toast
    }
  };

  // --- Renderizado / Rendering ---

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Registrar Usuario
      </h2>

      <form onSubmit={handleSubmit}>
        {/* ============================================================
         * SECCIÓN: Foto de Perfil (Opcional)
         * SECTION: Profile Picture (Optional)
         * ============================================================ */}

        {/* ✅ REFACTORIZADO: Componente reutilizable */}
        <ImageUploadPreview
          previewUrl={previewUrl}
          defaultImage="/images/profile/default_avatar.png"
          onClick={handleImageClick}
          altText="Foto de perfil"
          shape="circle"
          size={150}
          showHelpText={true}
          helpText="Haz clic en la imagen para seleccionar una foto (opcional)"
        />

        {/* Input oculto para selección de archivo */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/png, image/jpeg, image/webp, image/jpg"
        />

        {/* ============================================================
         * SECCIÓN: Datos Personales
         * SECTION: Personal Data
         * ============================================================ */}

        {/* Nombre */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="firstName"
            style={{ display: "block", marginBottom: "0.5rem" }}>
            Nombre <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Apellido */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="lastName"
            style={{ display: "block", marginBottom: "0.5rem" }}>
            Apellido <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "0.5rem" }}>
            Email <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Teléfono (opcional) */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="phone"
            style={{ display: "block", marginBottom: "0.5rem" }}>
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* ============================================================
         * SECCIÓN: Seguridad
         * SECTION: Security
         * ============================================================ */}

        {/* Contraseña */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "0.5rem" }}>
            Contraseña <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <small style={{ color: "#666", fontSize: "0.875rem" }}>
            Mínimo 6 caracteres
          </small>
        </div>

        {/* Confirmar Contraseña */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="confirmPassword"
            style={{ display: "block", marginBottom: "0.5rem" }}>
            Confirmar Contraseña <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* ============================================================
         * SECCIÓN: Gimnasio Base (REQUERIDO)
         * SECTION: Home Gym (REQUIRED)
         * ============================================================ */}

        {/* ✅ CORREGIDO: Gimnasio Base es REQUERIDO */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="homeGym"
            style={{ display: "block", marginBottom: "0.5rem" }}>
            Gimnasio Base <span style={{ color: "red" }}>*</span>
          </label>
          <select
            id="homeGym"
            value={homeGymId}
            onChange={(e) => setHomeGymId(Number(e.target.value))}
            disabled={isLoadingGyms}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}>
            <option value={0} disabled>
              -- Seleccionar gimnasio --
            </option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name} - {gym.city}
              </option>
            ))}
          </select>
          {isLoadingGyms && (
            <small style={{ color: "#666", fontSize: "0.875rem" }}>
              Cargando gimnasios...
            </small>
          )}
        </div>

        {/* ============================================================
         * BOTÓN DE ENVÍO
         * SUBMIT BUTTON
         * ============================================================ */}

        <button
          type="submit"
          disabled={
            isRegistering || isUploading || isLoadingGyms || homeGymId === 0
          }
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#fff",
            backgroundColor:
              isRegistering || isUploading || homeGymId === 0
                ? "#999"
                : "#007bff",
            border: "none",
            borderRadius: "4px",
            cursor:
              isRegistering || isUploading || homeGymId === 0
                ? "not-allowed"
                : "pointer",
            transition: "background-color 0.2s",
          }}>
          {isRegistering
            ? "Registrando..."
            : isUploading
            ? "Subiendo imagen..."
            : "Registrarse"}
        </button>

        {/* Enlace a Login */}
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            style={{ color: "#007bff", textDecoration: "none" }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}>
            Inicia sesión aquí
          </a>
        </p>
      </form>
    </div>
  );
};
