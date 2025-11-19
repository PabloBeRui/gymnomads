import React from 'react';

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Pagination, Form } from "react-bootstrap";
import styles from "./PaginationControls.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

/**
 * =============================================================================
 * COMPONENTE: PaginationControls
 * COMPONENT: PaginationControls
 * =============================================================================
 *
 * Componente reutilizable para la interfaz de paginación.
 * Muestra botones para navegar entre páginas y un selector para cambiar
 * la cantidad de elementos por página.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Reusable component for the pagination interface.
 * Displays buttons to navigate between pages and a selector to change
 * the number of items per page.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  // =============================================================================
  // Lógica de Renderizado de Números de Página
  // Page Number Rendering Logic
  // =============================================================================
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const ellipsis = '...';

    if (totalPages <= maxPagesToShow + 2) {
      // Mostrar todos los números si no hay muchos
      // Show all numbers if there aren't many
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Lógica con elipsis para muchas páginas
      // Ellipsis logic for many pages
      pageNumbers.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage < maxPagesToShow - 1) {
        start = 2;
        end = maxPagesToShow - 1;
      } else if (currentPage > totalPages - (maxPagesToShow - 2)) {
        start = totalPages - (maxPagesToShow - 2);
        end = totalPages - 1;
      }

      if (start > 2) {
        pageNumbers.push(ellipsis);
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages - 1) {
        pageNumbers.push(ellipsis);
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  // =============================================================================
  // Renderizado del Componente
  // Component Rendering
  // =============================================================================
  return (
    <div className={styles.paginationContainer}>
      <div className={styles.selectorContainer}>
        <Form.Label htmlFor="items-per-page" className={clsx("me-2", "text-dark")}>Mostrar:</Form.Label>
        <Form.Select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="w-auto"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </Form.Select>
      </div>

      <Pagination className={styles.pageButtonsContainer}>
        <Pagination.Prev
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Pagination.Prev>

        {pageNumbers.map((num, index) =>
          typeof num === 'number' ? (
            <Pagination.Item
              key={index}
              active={currentPage === num}
              onClick={() => onPageChange(num)}
            >
              {num}
            </Pagination.Item>
          ) : (
            <Pagination.Ellipsis key={index} />
          )
        )}

        <Pagination.Next
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </Pagination.Next>
      </Pagination>
    </div>
  );
};