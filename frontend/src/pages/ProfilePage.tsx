/**
 * =============================================================================
 * PÁGINA: ProfilePage
 * PAGE:     ProfilePage
 * =============================================================================
 *
 * Página contenedora del perfil del usuario. Gestiona el estado global del perfil,
 * la carga de datos adicionales (gimnasio), y alterna entre la vista de lectura
 * (ProfileView) y la vista de edición (ProfileEditForm).
 *
 * Container page for user profile. Manages global profile state,
 * additional data fetching (gym), and switches between read-only view (ProfileView)
 * and edit view (ProfileEditForm).
 *
 * =============================================================================
 */

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

// Importar componentes de Bootstrap
import { Container, Row, Col } from "react-bootstrap";

// Importar contexto
import { useAuth } from "../context/AuthContext";

// Importar hooks personalizados
import { useApiCall, useImageUpload } from "../hooks";

// Importar componentes
import { ChangePasswordModal } from "../components/modals";
import { CloseButton } from "../components/ui";
import { ProfileView, ProfileEditForm } from "../components/profile"; // Nuevos componentes

// Importar servicios
import {
  getGymById,
  updateUserProfile,
  uploadProfilePicture,
} from "../services";

// Importar interfaces
import type {
  UpdateUserData,
  User,
  UploadProfilePictureResponse,
  UpdateProfileResponse,
} from "../interfaces";

// Importar utilidades
import { handleApiError } from "../utils";

// Importar estilos
import styles from "./ProfilePage.module.scss";

export const ProfilePage: React.FC = () => {
  // --- Context / Auth ---
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();

  // --- Estados locales para datos de Gimnasio ---
  const [gymName, setGymName] = useState<string | null>(null);
  const [gymLogoUrl, setGymLogoUrl] = useState<string | null>(null);
  const [gymFetchError, setGymFetchError] = useState<string | null>(null);

  // --- Estados locales para Edición ---
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFirstName, setEditFirstName] = useState<string>("");
  const [editLastName, setEditLastName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");

  // --- Estado para el modal de contraseña ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  // Hook para acciones de guardado/actualización
  const {
    loading: isSaving,
    error: editError,
    execute,
  } = useApiCall("Error al guardar el perfil.");

  // Hook useImageUpload
  const profileImageUpload = useImageUpload({
    maxSizeMB: 5,
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    errorMessages: {
      invalidType: "La foto de perfil debe ser PNG, JPG, JPEG o WEBP",
      maxSize: "La foto de perfil no debe superar los 5MB",
    },
  });

  // Fallback de la URL base del backend
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;

  /* ===========================================================================
     Efectos (Sincronización de datos)
     =========================================================================== */

  // Sincronizar campos editables cuando cambian los datos del usuario
  useEffect(() => {
    if (user) {
      setEditFirstName(user.first_name || "");
      setEditLastName(user.last_name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  // Obtener el nombre del gimnasio si el usuario tiene home_gym_id
  useEffect(() => {
    const fetchGym = async () => {
      if (!user?.home_gym_id) return;
      try {
        setGymFetchError(null);
        const g = await getGymById(user.home_gym_id);
        setGymName(g.name || null);
        setGymLogoUrl(g.logo_url || null);
      } catch (err) {
        const msg = handleApiError(
          err,
          "No se pudo cargar el nombre del gimnasio."
        );
        setGymFetchError(msg);
        setGymName(null);
        setGymLogoUrl(null);
      }
    };
    fetchGym();
  }, [user?.home_gym_id]);

  // Inicializar preview de imagen
  useEffect(() => {
    if (!user?.profile_picture) return;

    const pic = user.profile_picture;
    const normalized =
      typeof pic === "string" && !/^https?:\/\//i.test(pic)
        ? `${backendBaseUrl}/${pic.replace(/^\/+/, "")}`
        : pic;

    profileImageUpload.setPreviewUrl(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.profile_picture]);

  /* ===========================================================================
     Manejadores: editar, cancelar, guardar
     =========================================================================== */
  const handleEditClick = () => {
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
    setIsEditing(true);
    
    // Reiniciar imagen
    profileImageUpload.clearImage();
    if (user?.profile_picture) {
        // Re-setear preview original si existe
        const pic = user.profile_picture;
            const normalized =
              typeof pic === "string" && !/^https?:\/\//i.test(pic)
            ? `${backendBaseUrl}/${pic.replace(/^\/+/, "")}`
            : pic;
        profileImageUpload.setPreviewUrl(normalized);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    profileImageUpload.clearImage();
    // Restaurar preview original
    if (user?.profile_picture) {
        const pic = user.profile_picture;
        const normalized = typeof pic === "string" && !/^https?:\/\//i.test(pic)
            ? `${backendBaseUrl}/${pic.replace(/^\/+/, "")}`
            : pic;
        profileImageUpload.setPreviewUrl(normalized);
    }
    // Restaurar campos
    setEditFirstName(user?.first_name || "");
    setEditLastName(user?.last_name || "");
    setEditPhone(user?.phone || "");
  };

  const handleSaveClick = async () => {
    if (!editFirstName || !editLastName) {
      toast.error("El nombre y los apellidos son obligatorios.");
      return;
    }
    if (!token) {
      toast.error("No autenticado.");
      return;
    }

    let newImageUrl: string | null = user?.profile_picture || null;

    try {
      // 1) Subir imagen si existe
      if (profileImageUpload.selectedFile) {
        const uploadResp = await execute<UploadProfilePictureResponse>(() =>
          uploadProfilePicture(token, profileImageUpload.selectedFile!)
        );
        const path = (uploadResp.filePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
        newImageUrl = `${backendBaseUrl}/${path}`;
        toast.success(uploadResp.message || "Foto de perfil actualizada.");
      }

      // 2) Actualizar perfil
      const payload: UpdateUserData = {
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
      };
      const updateResp = await execute<UpdateProfileResponse>(() =>
        updateUserProfile(token, payload)
      );

      if (!profileImageUpload.selectedFile) {
        toast.success(updateResp.message || "Perfil actualizado con éxito.");
      }

      // 3) Actualizar contexto
      const updatedUser: User = {
        ...user!,
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || null,
        profile_picture: newImageUrl || null,
      };
      setUser(updatedUser);

      // 4) Finalizar
      setIsEditing(false);
      profileImageUpload.clearImage();
      if (newImageUrl) profileImageUpload.setPreviewUrl(newImageUrl);

    } catch (err) {
      const msg = handleApiError(err, "Error al guardar el perfil.");
      toast.error(msg);
    }
  };

  /* ===========================================================================
     Render Principal
     =========================================================================== */
  if (!user) {
    return (
      <Container className="page-container-narrow">
        <p className={clsx(styles.errorText, "text-danger")}>
          Error: No se pudieron cargar los datos del usuario.
        </p>
      </Container>
    );
  }

  return (
    <Container className={clsx("py-5", "position-relative")}>
      <CloseButton
        onClick={() => navigate(-1)}
        className={styles.closeButton}
        color="#FFB700"
        ariaLabel="Volver a la página anterior"
      />
      <Row className="justify-content-center">
        <Col md={10} lg={8} xl={7}>
          <h2 className="text-center mb-5 fw-bold text-primary">Mi Perfil</h2>

          {!isEditing ? (
            <ProfileView
              user={user}
              gymName={gymName}
              gymLogoUrl={gymLogoUrl}
              gymFetchError={gymFetchError}
              backendBaseUrl={backendBaseUrl}
              onEditClick={handleEditClick}
              onChangePasswordClick={() => setIsPasswordModalOpen(true)}
            />
          ) : (
            <ProfileEditForm
              user={user}
              firstName={editFirstName}
              setFirstName={setEditFirstName}
              lastName={editLastName}
              setLastName={setEditLastName}
              phone={editPhone}
              setPhone={setEditPhone}
              // Image props
              previewUrl={profileImageUpload.previewUrl}
              fileInputRef={profileImageUpload.fileInputRef}
              handleFileChange={profileImageUpload.handleFileChange}
              handleImageClick={profileImageUpload.handleImageClick}
              selectedFile={profileImageUpload.selectedFile}
              // Control props
              isSaving={isSaving}
              onSave={handleSaveClick}
              onCancel={handleCancelClick}
            />
          )
          }
        </Col>
      </Row>

      {/* Mensajes de error de edición */}
      {isEditing && editError && (
        <div className="alert alert-danger mt-3" role="alert">
          {editError}
        </div>
      )}

      {/* Modal de Contraseña */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </Container>
  );
};