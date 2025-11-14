
/**
 * =============================================================================
 * HOOK: useSorting
 * =============================================================================
 *
 * Este hook gestiona la lógica de ordenación para un array de datos.
 * Recibe una lista de elementos y una configuración inicial de ordenación.
 * Devuelve la lista ordenada, una función para solicitar una nueva ordenación,
 * y la configuración de ordenación actual.
 *
 * This hook manages the sorting logic for an array of data.
 * It receives a list of items and an initial sort configuration.
 * It returns the sorted list, a function to request a new sort,
 *and the current sort configuration.

 * =============================================================================
 */


import { useState, useMemo } from "react";

// Define el tipo para la configuración de ordenación.
// Defines the type for the sort configuration.
type SortDirection = "ascending" | "descending";

interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

// Define la interfaz para el valor de retorno del hook.
// Defines the interface for the hook's return value.
interface UseSortingReturn<T> {
  sortedItems: T[];
  requestSort: (key: keyof T) => void;
  sortConfig: SortConfig<T> | null;
}

/**
 * Hook personalizado para ordenar un array de objetos.
 * Custom hook for sorting an array of objects.
 * @param items - El array de datos a ordenar. / The data array to sort.
 * @param initialConfig - La configuración inicial de ordenación (opcional). / The initial sort configuration (optional).
 * @returns Un objeto con los datos ordenados y funciones para gestionar la ordenación. / An object with the sorted data and functions to manage sorting.
 */

export const useSorting = <T>(
  items: T[],
  initialConfig: SortConfig<T> | null = null
): UseSortingReturn<T> => {
  // Estado para almacenar la configuración de ordenación actual.
  // State to store the current sort configuration.
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    initialConfig
  );

  // `useMemo` para ordenar los datos solo cuando los `items` o `sortConfig` cambian.
  // `useMemo` to sort data only when `items` or `sortConfig` change.
  const sortedItems = useMemo(() => {
    // Crear una copia de los items para no mutar el array original.
    // Create a copy of the items to avoid mutating the original array.
    const sortableItems = [...items];

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Manejar valores nulos o indefinidos para que siempre aparezcan al final.
        // Handle null or undefined values so they always appear at the end.
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Lógica de comparación.
        // Comparison logic.
        if (typeof aValue === "string" && typeof bValue === "string") {
          // Comparación de cadenas de texto sensible a la localización.
          // Locale-sensitive string comparison.
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          // Comparación numérica o de otros tipos.
          // Numeric or other types of comparison.
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });
    }

    return sortableItems;
  }, [items, sortConfig]);

  /**
   * Función para solicitar un cambio en la ordenación.
   * Function to request a change in sorting.
   * Si se solicita la misma clave, invierte la dirección. Si no, establece una nueva clave.
   * If the same key is requested, it inverts the direction. Otherwise, it sets a new key.
   */
  const requestSort = (key: keyof T) => {
    let direction: SortDirection = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return { sortedItems, requestSort, sortConfig };
};
