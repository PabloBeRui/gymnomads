/**
 * =============================================================================
 * COMPONENTE: SortableTable
 * =============================================================================
 *
 * Componente de tabla reutilizable y genérico que incluye lógica de ordenación.
 * Utiliza el hook `useSorting` para manejar el estado de la ordenación.
 * Recibe `data` y `columns` como props para renderizar la tabla.
 *
 * Reusable and generic table component that includes sorting logic.
 * It uses the `useSorting` hook to manage the sorting state.
 * It receives `data` and `columns` as props to render the table.
 *
 * =============================================================================
 */

import React from "react";
import { useSorting } from "../../hooks/useSorting";

// Interfaz para la definición de las columnas.
// Interface for column definitions.
export interface ColumnDefinition<T> {
  key: keyof T;
  header: string;
  // Función de renderizado opcional para celdas con contenido complejo.
  // Optional render function for cells with complex content.
  render?: (item: T) => React.ReactNode;
}

// Props para el componente SortableTable.
// Props for the SortableTable component.
interface SortableTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  // Configuración para la ordenación inicial.
  // Configuration for the initial sort.
  initialSortConfig: { key: keyof T; direction: "ascending" | "descending" };
  // Manejador opcional para el clic en una fila.
  // Optional handler for row clicks.
  onRowClick?: (item: T) => void;
}

// Estilos para la tabla 
// Styles for the table 
const styles: { [key: string]: React.CSSProperties } = {
  tableContainer: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
    fontWeight: "bold",
    color: "#495057",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #dee2e6",
  },
  clickableRow: {
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  sortIndicator: {
    marginLeft: "8px",
    fontSize: "0.9em",
  },
};

/**
 * Componente genérico para renderizar una tabla con ordenación.
 * Generic component to render a table with sorting.
 */
export const SortableTable = <T extends { id: number | string }>({
  data,
  columns,
  initialSortConfig,
  onRowClick,
}: SortableTableProps<T>) => {
  // Usar el hook de ordenación.
  // Use the sorting hook.
  const { sortedItems, requestSort, sortConfig } = useSorting(
    data,
    initialSortConfig
  );

  // Función para obtener el indicador de ordenación para una columna.
  // Function to get the sort indicator for a column.
  const getSortIndicator = (key: keyof T) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? "🔼" : "🔽";
  };

  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key as string}
                style={styles.th}
                onClick={() => requestSort(col.key)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e9ecef")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8f9fa")
                }
                title={`Ordenar por ${col.header}`}>
                {col.header}
                <span style={styles.sortIndicator}>
                  {getSortIndicator(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <tr
              key={item.id}
              style={onRowClick ? styles.clickableRow : {}}
              onClick={() => onRowClick?.(item)}
              onMouseEnter={(e) => {
                if (onRowClick)
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                if (onRowClick)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}>
              {columns.map((col) => (
                <td key={`${item.id}-${col.key as string}`} style={styles.td}>
                  {/* Usar la función de renderizado si existe, si no, mostrar el valor directamente. */}
                  {/* Use the render function if it exists, otherwise display the value directly. */}
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
