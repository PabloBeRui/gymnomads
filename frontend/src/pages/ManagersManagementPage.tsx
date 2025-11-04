/**
 * =============================================================================
 * PÁGINA: ManagersManagementPage
 * =============================================================================
 *
 * Página para gestionar y visualizar gerentes (managers) registrados.
 * - Solo Admin: puede ver todos los managers y filtrar por ciudad y búsqueda.
 *
 * Page to manage and view registered managers.
 * - Admin only: can see all managers and filter by city and search.
 *
 * NOTA: Los managers tienen como first_name y last_name el nombre del gimnasio,
 * por lo que no se muestran en esta vista (son redundantes con gym_name).
 * El identificador real del manager es su email.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllManagers } from "../services/user-services";
import type { ManagerWithGym } from "../interfaces/user-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";

/* =============================================================================
   ESTILOS (inline)
   ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
  },
  filtersContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#495057",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "200px",
  },
  clearButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
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
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #dee2e6",
  },
  loadingContainer: {
    padding: "40px",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    padding: "20px",
    textAlign: "center",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#6c757d",
    fontSize: "1.1rem",
  },
  statsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 200px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#007bff",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#6c757d",
    marginTop: "5px",
  },
};

/* =============================================================================
   COMPONENTE: ManagersManagementPage
   ============================================================================= */
export const ManagersManagementPage = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";

  // Estados del componente / Component states
  const [managers, setManagers] = useState<ManagerWithGym[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros / Filter states
  const [cityFilter, setCityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Cargar managers / Load managers
  const fetchManagers = async () => {
    if (!token) {
      setError("No estás autenticado.");
      setIsLoading(false);
      return;
    }

    if (!isAdmin) {
      setError("No tienes permisos para ver esta página.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Obtener todos los managers con filtros opcionales
      // Get all managers with optional filters
      const filters = {
        city: cityFilter.trim() || undefined,
        search: searchTerm.trim() || undefined,
      };
      const managersData = await getAllManagers(token, filters);
      setManagers(managersData);
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar los managers.");
      setError(msg);
      toast.error("No se pudieron cargar los managers.");
      if (import.meta.env.DEV) {
        console.error("Error al cargar managers:", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto con debounce para cargar managers cuando cambien los filtros
  // Effect with debounce to load managers when filters change
  useEffect(() => {
    // Debounce de 500ms para no saturar el backend
    // 500ms debounce to avoid overwhelming the backend
    const timeoutId = setTimeout(() => {
      fetchManagers();
    }, 500);

    // Limpiar timeout si los filtros cambian antes de que se ejecute
    // Clear timeout if filters change before execution
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, searchTerm]); // Se ejecuta cuando cambian los filtros / Runs when filters change

  // Limpiar filtros / Clear filters
  const handleClearFilters = () => {
    setCityFilter("");
    setSearchTerm("");
  };

  // Calcular estadísticas / Calculate statistics
  const totalManagers = managers.length;

  // Render loading
  if (isLoading && managers.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <p>Cargando managers...</p>
        {/* TODO: Spinner */}
      </div>
    );
  }

  // Render error
  if (error && managers.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  // Render principal / Main render
  return (
    <div style={styles.container}>
      {/* Encabezado / Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de Managers</h1>
        <p style={styles.subtitle}>
          Visualiza y filtra todos los gerentes registrados en la plataforma.
        </p>
      </div>

      {/* Estadísticas / Statistics */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{totalManagers}</div>
          <div style={styles.statLabel}>
            {isLoading ? "Cargando..." : "Total de Managers"}
          </div>
        </div>
      </div>

      {/* Filtros / Filters */}
      <div style={styles.filtersContainer}>
        {/* Filtro por ciudad / City filter */}
        <div style={styles.filterGroup}>
          <label htmlFor="cityFilter" style={styles.label}>
            Filtrar por Ciudad
          </label>
          <input
            id="cityFilter"
            type="text"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Ej: Madrid, Barcelona..."
            style={styles.input}
          />
        </div>

        {/* Filtro por búsqueda / Search filter */}
        <div style={styles.filterGroup}>
          <label htmlFor="searchFilter" style={styles.label}>
            Buscar Manager
          </label>
          <input
            id="searchFilter"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Email o nombre de gimnasio..."
            style={styles.input}
          />
        </div>

        {/* Botón de limpiar filtros / Clear filters button */}
        <button
          onClick={handleClearFilters}
          style={styles.clearButton}
          disabled={isLoading}>
          Limpiar Filtros
        </button>
      </div>

      {/* Tabla de managers / Managers table */}
      {managers.length === 0 ? (
        <div style={styles.emptyState}>
          {searchTerm || cityFilter ? (
            // Si hay filtros activos / If filters are active
            <>
              <p>🔍 No se encontraron managers con los filtros aplicados.</p>
              <button
                onClick={handleClearFilters}
                style={{
                  ...styles.clearButton,
                  marginTop: "15px",
                  cursor: "pointer",
                }}>
                Limpiar filtros
              </button>
            </>
          ) : (
            // Si no hay filtros / If no filters
            <p>📭 Aún no hay managers registrados.</p>
          )}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Teléfono</th>
                <th style={styles.th}>Gimnasio</th>
                <th style={styles.th}>Ciudad</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager.id}>
                  <td style={styles.td}>{manager.email}</td>
                  <td style={styles.td}>{manager.phone || "N/A"}</td>
                  <td style={styles.td}>{manager.gym_name}</td>
                  <td style={styles.td}>{manager.gym_city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};