/**
 * =============================================================================
 * COMPONENTE: SortableTable
 * COMPONENT: SortableTable
 * =============================================================================
 *
 * Componente de tabla reutilizable y genérico que incluye lógica de ordenación.
 * Utiliza el hook `useSorting` para manejar el estado de la ordenación.
 * Recibe `data` y `columns` como props para renderizar la tabla.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Reusable and generic table component that includes sorting logic.
 * It uses the `useSorting` hook to manage the sorting state.
 * It receives `data` and `columns` as props to render the table.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import React from "react";
import { useSorting } from "../../hooks/useSorting";

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Table } from "react-bootstrap";
import styles from "./SortableTable.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

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
    <div className={styles.tableContainer}>
      <Table hover responsive className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key as string}
                className={clsx(styles.th, "text-primary")}
                onClick={() => requestSort(col.key)}
                title={`Ordenar por ${col.header}`}>
                {col.header}
                <span className={styles.sortIndicator}>
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
              className={clsx({ [styles.clickableRow]: onRowClick })}
              onClick={() => onRowClick?.(item)}>
              {columns.map((col) => (
                <td key={`${item.id}-${col.key as string}`} className={styles.td}>
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
      </Table>
    </div>
  );
};