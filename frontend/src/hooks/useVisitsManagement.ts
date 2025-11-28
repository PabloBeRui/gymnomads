/**
 * =============================================================================
 * CUSTOM HOOK: useVisitsManagement
 * =============================================================================
 *
 * Hook personalizado para gestionar la lógica de la página de administración de visitas.
 * Centraliza el estado, filtros, paginación y llamadas a la API.
 *
 * Custom hook to manage the logic of the visits management page.
 * Centralizes state, filters, pagination, and API calls.
 *
 * =============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAllVisits,
  getManagerGymVisits,
  getManagerOutgoingVisits,
  getAllGyms,
} from "../services";
import type { VisitWithDetails, VisitsFilters, Gym } from "../interfaces";
import { handleApiError } from "../utils";
import { usePagination } from "./usePagination";
import { toast } from "sonner";

export const useVisitsManagement = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  // --- Estados de Datos ---
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]); // Para el filtro de gimnasios (solo admin)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de Filtros y Vistas ---
  const [managerVisitView, setManagerVisitView] = useState<"received" | "sent">(
    "received"
  );
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [gymSearchTerm, setGymSearchTerm] = useState<string>("");

  // --- Hook de Paginación ---
  const pagination = usePagination();
  const { currentPage, itemsPerPage, setTotalItems, goToPage } = pagination;

  // Cargar lista de gimnasios (Solo Admin)
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
        // No bloqueamos la UI si falla la carga de la lista de gimnasios para el filtro
      }
    };

    fetchGyms();
  }, [isAdmin, token]);

  // Función principal de carga de visitas
  const fetchVisits = useCallback(async () => {
    if (!token) {
      setError("No estás autenticado.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      let response;
      const baseFilters: VisitsFilters = {
        page: currentPage,
        limit: itemsPerPage,
        user_search: userSearch.trim() || undefined,
      };

      if (isAdmin) {
        const gymIdAsNumber = Number(selectedGymId);
        const adminFilters: VisitsFilters = { ...baseFilters };

        if (selectedGymId === "deleted") {
          adminFilters.gym_status = "deleted";
        } else if (gymIdAsNumber > 0) {
          adminFilters.gym_id = gymIdAsNumber;
          adminFilters.gym_status = "active";
        }
        response = await getAllVisits(token, adminFilters);
      } else if (isManager) {
        if (managerVisitView === "received") {
          response = await getManagerGymVisits(token, baseFilters);
        } else {
          response = await getManagerOutgoingVisits(token, baseFilters);
        }
      } else {
        throw new Error("No tienes permisos para ver esta página.");
      }

      const validVisits = Array.isArray(response.data) ? response.data : [];
      setVisits(validVisits);
      setTotalItems(response.total || 0);
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar las visitas.");
      setError(msg);
      toast.error("No se pudieron cargar las visitas.");
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    token,
    isAdmin,
    isManager,
    currentPage,
    itemsPerPage,
    userSearch,
    selectedGymId,
    managerVisitView,
    setTotalItems,
  ]);

  // Efecto de Debounce para recargar visitas al cambiar filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVisits();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchVisits]); // fetchVisits ya incluye todas las dependencias necesarias en su useCallback

  // Handlers para filtros
  const handleUserSearchChange = (term: string) => {
    setUserSearch(term);
    goToPage(1);
  };

  const handleGymFilterChange = (gymId: string) => {
    setSelectedGymId(gymId);
    goToPage(1);
  };

  const handleManagerViewChange = (view: "received" | "sent") => {
    setManagerVisitView(view);
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
    visits,
    gyms: filteredGymOptions, // Devolvemos la lista ya filtrada por término de búsqueda local
    isLoading,
    error,

    // Filter States
    managerVisitView,
    selectedGymId,
    userSearch,
    gymSearchTerm,

    // Filter Setters (Handlers)
    setManagerVisitView: handleManagerViewChange,
    setSelectedGymId: handleGymFilterChange,
    setUserSearch: handleUserSearchChange,
    setGymSearchTerm,

    // Pagination
    pagination,

    // Actions
    refreshVisits: fetchVisits,
  };
};
