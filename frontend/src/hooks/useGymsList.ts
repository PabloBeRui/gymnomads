/**
 * =============================================================================
 * CUSTOM HOOK: useGymsList
 * CUSTOM HOOK: useGymsList
 * =============================================================================
 *
 * Hook personalizado para la gestión de la lógica de obtención, filtrado y paginación
 * de gimnasios. Adapta su comportamiento según el rol del usuario (Admin vs. User/Guest).
 *
 * Custom hook for managing gym fetching, filtering, and pagination logic.
 * Adapts its behavior based on the user's role (Admin vs. User/Guest).
 *
 * Características / Features:
 * - Manejo de estado de carga y errores / Handles loading and error states
 * - Búsqueda y filtrado / Search and filtering
 * - Paginación en cliente o servidor según el rol / Client or server-side pagination based on role
 * - Sincronización con el estado de autenticación del usuario / Synchronizes with user authentication state
 * - Actualizaciones optimistas para acciones de UI (borrar/suspender) / Optimistic updates for UI actions (delete/suspend)
 *
 * @returns Un objeto con el estado actual de los gimnasios, funciones de manejo y utilidades de paginación.
 * @returns An object with the current gym state, handling functions, and pagination utilities.
 *
 * =============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllGyms } from "../services";
import { sortGymsByRole, handleApiError } from "../utils";
import { usePagination } from "./usePagination";
import type { Gym } from "../interfaces";
import { toast } from "sonner";

export const useGymsList = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";

  // Estados del hook / Hook states
  const [gyms, setGyms] = useState<Gym[]>([]); // Lista de gimnasios paginada / Paginated list of gyms
  const [unpaginatedGyms, setUnpaginatedGyms] = useState<Gym[]>([]); // Lista completa para no-admins (paginación en cliente) / Full list for non-admins (client-side pagination)
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga / Loading state
  const [error, setError] = useState<string | null>(null); // Estado de error / Error state
  const [searchTerm, setSearchTerm] = useState<string>(""); // Término de búsqueda / Search term

  // Hook de paginación / Pagination hook
  const pagination = usePagination({ initialItemsPerPage: 6 });
  const { currentPage, itemsPerPage, setTotalItems, goToPage } = pagination;

  /**
   * =============================================================================
   * FUNCIÓN: fetchGyms
   * FUNCTION: fetchGyms
   * =============================================================================
   *
   * Realiza la llamada a la API para obtener la lista de gimnasios.
   * Adapta la lógica de paginación y ordenación según el rol del usuario.
   *
   * Fetches the list of gyms from the API.
   * Adapts pagination and sorting logic based on the user's role.
   *
   * =============================================================================
   */
  const fetchGyms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const commonFilters = { search: searchTerm.trim() || undefined };

      if (isAdmin) {
        // Admin: Paginación en el servidor / Admin: Server-side pagination
        const adminFilters = {
          ...commonFilters,
          page: currentPage,
          limit: itemsPerPage,
          orderBy: "name_asc" as const, // Ordenar por nombre ascendente / Order by name ascending
        };
        const response = await getAllGyms(token ?? undefined, adminFilters);
        setGyms(response.data);
        setTotalItems(response.total);
      } else {
        // User/Guest: Carga todo y paginación en cliente / User/Guest: Fetch all and client-side pagination
        const userFilters = { ...commonFilters, limit: 1000 }; // Límite alto para obtener todos / High limit to get all
        const response = await getAllGyms(token ?? undefined, userFilters);
        const sortedGyms = sortGymsByRole(response.data, user); // Ordenación por rol / Role-based sorting
        setUnpaginatedGyms(sortedGyms);
        setTotalItems(sortedGyms.length);
      }
    } catch (err) {
      const msg = handleApiError(err, "Hubo un problema al cargar los gimnasios.");
      setError(msg);
      toast.error(msg);
      setGyms([]);
      if (!isAdmin) setUnpaginatedGyms([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token, searchTerm, setTotalItems, user, isAdmin ? currentPage : 0, isAdmin ? itemsPerPage : 0]);

  // Efecto para disparar la carga de gimnasios con debounce / Effect to trigger gym loading with debounce
  useEffect(() => {
    const timeoutId = setTimeout(fetchGyms, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchGyms]);

  // Efecto para manejar la paginación en el frontend para no-admins / Effect to handle client-side pagination for non-admins
  useEffect(() => {
    if (!isAdmin) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setGyms(unpaginatedGyms.slice(startIndex, endIndex));
    }
  }, [currentPage, itemsPerPage, unpaginatedGyms, isAdmin]);

  /**
   * =============================================================================
   * FUNCIÓN: handleSearchChange
   * FUNCTION: handleSearchChange
   * =============================================================================
   *
   * Maneja el cambio en el término de búsqueda y reinicia la paginación.
   * Handles search term change and resets pagination.
   *
   * @param term El nuevo término de búsqueda. / The new search term.
   * =============================================================================
   */
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    goToPage(1); // Siempre ir a la primera página con una nueva búsqueda / Always go to the first page with a new search
  };

  /**
   * =============================================================================
   * FUNCIÓN: removeGymFromState
   * FUNCTION: removeGymFromState
   * =============================================================================
   *
   * Elimina un gimnasio del estado local. Diseñado para actualizaciones optimistas.
   * Vuelve a cargar la lista para asegurar la consistencia.
   *
   * Removes a gym from the local state. Designed for optimistic updates.
   * Re-fetches the list to ensure consistency.
   *
   * @param gymId El ID del gimnasio a eliminar. / The ID of the gym to remove.
   * =============================================================================
   */
  const removeGymFromState = (gymId: number) => {
      // Filtrar el gimnasio eliminado del estado local para actualización optimista / Filter out the deleted gym from local state for optimistic update
      setGyms(prev => prev.filter(gym => gym.id !== gymId));
      if (!isAdmin) {
          setUnpaginatedGyms(prev => prev.filter(gym => gym.id !== gymId));
      }
      // Re-fetch para asegurar la consistencia y actualizar los totales de paginación / Re-fetch to ensure consistency and update pagination totals
      fetchGyms(); 
  };

  /**
   * =============================================================================
   * FUNCIÓN: updateGymInState
   * FUNCTION: updateGymInState
   * =============================================================================
   *
   * Actualiza un gimnasio existente en el estado local. Diseñado para actualizaciones optimistas.
   *
   * Updates an existing gym in the local state. Designed for optimistic updates.
   *
   * @param updatedGym El objeto Gym actualizado. / The updated Gym object.
   * =============================================================================
   */
  const updateGymInState = (updatedGym: Gym) => {
      setGyms(prev => prev.map(g => g.id === updatedGym.id ? updatedGym : g));
      if (!isAdmin) {
          setUnpaginatedGyms(prev => prev.map(g => g.id === updatedGym.id ? updatedGym : g));
      }
  };

  return {
    gyms,
    isLoading,
    error,
    searchTerm,
    handleSearchChange,
    pagination,
    refreshGyms: fetchGyms, // Permite refrescar la lista manualmente / Allows manual list refresh
    removeGymFromState,
    updateGymInState
  };
};
