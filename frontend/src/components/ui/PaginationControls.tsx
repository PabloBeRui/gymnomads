import React from 'react';

/**
 * =============================================================================
 * COMPONENTE: PaginationControls
 * =============================================================================
 *
 * Componente reutilizable para la interfaz de paginación.
 * Muestra botones para navegar entre páginas y un selector para cambiar
 * la cantidad de elementos por página.
 *
 * Reusable component for the pagination interface.
 * Displays buttons to navigate between pages and a selector to change
 * the number of items per page.
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

const pageButtonStyle: React.CSSProperties = {
  margin: '0 4px',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#fff',
  cursor: 'pointer',
  minWidth: '40px',
  textAlign: 'center',
};

const activePageButtonStyle: React.CSSProperties = {
  ...pageButtonStyle,
  background: '#337ab7',
  color: '#fff',
  borderColor: '#337ab7',
  fontWeight: 'bold',
};

const disabledPageButtonStyle: React.CSSProperties = {
  ...pageButtonStyle,
  cursor: 'not-allowed',
  opacity: 0.5,
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 0',
  flexWrap: 'wrap',
  gap: '16px',
};

const pageButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const selectorContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

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
    <div style={containerStyle}>
      <div style={selectorContainerStyle}>
        <label htmlFor="items-per-page">Mostrar:</label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div style={pageButtonsContainerStyle}>
        <button
          style={currentPage === 1 ? disabledPageButtonStyle : pageButtonStyle}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        {pageNumbers.map((num, index) =>
          typeof num === 'number' ? (
            <button
              key={index}
              style={currentPage === num ? activePageButtonStyle : pageButtonStyle}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          ) : (
            <span key={index} style={{ ...pageButtonStyle, border: 'none', cursor: 'default' }}>
              {num}
            </span>
          )
        )}

        <button
          style={currentPage === totalPages ? disabledPageButtonStyle : pageButtonStyle}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
