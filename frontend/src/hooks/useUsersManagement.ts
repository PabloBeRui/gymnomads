/**
 * =============================================================================
 * CUSTOM HOOK: useUsersManagement
 * =============================================================================
 *
 * Hook personalizado para gestionar la lógica de la página de administración de usuarios.
 * Centraliza el estado, filtros, paginación y llamadas a la API (fetch y delete).
 *
 * Custom hook to manage the logic of the users management page.
 * Centralizes state, filters, pagination, and API calls (fetch and delete).
 *
 * =============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAllUsers,
  getUsersByGym,
  deleteUser,
  type GetAllUsersFilters,
  type GetUsersByGymFilters,
  getAllGyms,
} from "../services";
import type { UserWithGym, GymUser, Gym } from "../interfaces";
import { handleApiError } from "../utils";
import { usePagination } from "./usePagination";
import { toast } from "sonner";

export const useUsersManagement = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  // --- Estados de Datos ---
  const [users, setUsers] = useState<(UserWithGym | GymUser)[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]); // Para el filtro de gimnasios (solo admin)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // --- Estados de Filtros ---
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [gymSearchTerm, setGymSearchTerm] = useState<string>("");

  // --- Hook de Paginación ---
  const pagination = usePagination();
  const { currentPage, itemsPerPage, setTotalItems, goToPage } = pagination;

  // Cargar lista de gimnasios (Solo Admin) para el filtro
  useEffect(() => {
    if (!isAdmin || !token) return;

    const fetchGyms = async () => {
      try {
        const gymsData = await getAllGyms(token, { limit: 1000 });
        const validGyms = Array.isArray(gymsData.data) ? gymsData.data : [];
        setGyms(validGyms);
      } catch (err) {
        const msg = handleApiError(err, "Error al cargar gimnasios.");
        console.error(msg);
      }
    };

    fetchGyms();
  }, [isAdmin, token]);

  // Función principal de carga de usuarios
  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError("No estás autenticado.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      let response;
      if (isAdmin) {
        const gymIdAsNumber = Number(selectedGymId);
        const filters: GetAllUsersFilters = {
          search: searchTerm.trim() || undefined,
          page: currentPage,
          limit: itemsPerPage,
        };
        if (selectedGymId === "deleted") {
          filters.gym_status = "deleted";
        } else if (gymIdAsNumber > 0) {
          filters.gym_id = gymIdAsNumber;
          filters.gym_status = "active";
        }
        response = await getAllUsers(token, filters);
      } else if (isManager && user?.home_gym_id) {
        const filters: GetUsersByGymFilters = {
          search: searchTerm.trim() || undefined,
          page: currentPage,
          limit: itemsPerPage,
        };
        response = await getUsersByGym(token, user.home_gym_id, filters);
      } else {
        throw new Error("No tienes permisos para ver esta página.");
      }

      const validData = Array.isArray(response.data) ? response.data : [];
      setUsers(validData);
      setTotalItems(response.total || 0);
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar los usuarios.");
      setError(msg);
      toast.error("No se pudieron cargar los usuarios.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    token,
    isAdmin,
    isManager,
    user?.home_gym_id,
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedGymId,
    setTotalItems,
  ]);

  // Efecto de Debounce para recargar usuarios al cambiar filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  // Handler para eliminar usuario
  const deleteUserAction = async (userId: number): Promise<boolean> => {
    if (!token) {
      toast.error("No estás autenticado.");
      return false;
    }
    setIsDeleting(true);
    try {
      await deleteUser(token, userId);
      toast.success("Usuario eliminado correctamente.");
      await fetchUsers(); // Recargar la lista
      return true;
    } catch (err) {
      const msg = handleApiError(err, "Error al eliminar el usuario.");
      toast.error(msg);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Handlers para filtros
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    goToPage(1);
  };

  const handleGymFilterChange = (gymId: string) => {
    setSelectedGymId(gymId);
    goToPage(1);
  };

  // Filtrado local de la lista de gimnasios para el dropdown (Admin)
  const filteredGymOptions = gyms.filter(
    (gym) =>
      gym.name.toLowerCase().includes(gymSearchTerm.toLowerCase()) ||
      gym.city.toLowerCase().includes(gymSearchTerm.toLowerCase())
  );

  return {
    // Data
    users,
    gyms: filteredGymOptions,
    isLoading,
    error,
    isDeleting,

    // Filter States
    selectedGymId,
    searchTerm,
    gymSearchTerm,

    // Filter Setters
    setSelectedGymId: handleGymFilterChange,
    setSearchTerm: handleSearchChange,
    setGymSearchTerm,

    // Pagination
    pagination,

    // Actions
    refreshUsers: fetchUsers,
    deleteUser: deleteUserAction,
  };
};
