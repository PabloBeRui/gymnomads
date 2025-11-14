import { useState, useMemo } from 'react';

/**
 * =============================================================================
 * HOOK: usePagination
 * =============================================================================
 *
 * Hook personalizado para gestionar la lógica de la paginación.
 *
 * Custom hook to manage pagination logic.
 *
 * =============================================================================
 */

interface PaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
}

export const usePagination = ({
  initialPage = 1,
  initialItemsPerPage = 10,
}: PaginationOptions = {}) => {
  // =============================================================================
  // Estado
  // State
  // =============================================================================
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  // =============================================================================
  // Cálculos Memoizados
  // Memoized Calculations
  // =============================================================================

  // Calcular el número total de páginas
  // Calculate the total number of pages
  const totalPages = useMemo(() => {
    if (totalItems === 0) return 1;
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  // =============================================================================
  // Manejadores de Eventos
  // Event Handlers
  // =============================================================================

  // Ir a la página siguiente
  // Go to the next page
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Ir a la página anterior
  // Go to the previous page
  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Ir a una página específica
  // Go to a specific page
  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  // Cambiar el número de elementos por página
  // Change the number of items per page
  const changeItemsPerPage = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Resetear a la primera página
  };

  // =============================================================================
  // Retorno del Hook
  // Hook Return
  // =============================================================================
  return {
    // Estado
    // State
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,

    // Setters
    // Setters
    setTotalItems,
    setCurrentPage,
    
    // Manejadores
    // Handlers
    nextPage,
    prevPage,
    goToPage,
    changeItemsPerPage,
  };
};
