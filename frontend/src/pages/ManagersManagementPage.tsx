/**
 * =============================================================================
 * PÁGINA: ManagersManagementPage
 * =============================================================================
 *
 * Página para gestionar y visualizar gerentes (managers) registrados.
 * - Solo Admin: puede ver todos los managers y filtrar por búsqueda global.
 * - Permite ver y editar información de managers (nombre, apellidos, teléfono).
 *
 * IMPORTANTE: Los managers NO se pueden eliminar directamente desde esta página.
 * Solo se eliminan al eliminar el gimnasio asociado (acción en CASCADE).
 * Para eliminar un manager, ir a la página de gestión de gimnasios.
 *
 * Page to manage and view registered managers.
 * - Admin only: can see all managers and filter by global search.
 * - Allows viewing and editing manager information (name, last name, phone).
 *
 * IMPORTANT: Managers CANNOT be deleted directly from this page.
 * They are only deleted when the associated gym is deleted (CASCADE action).
 * To delete a manager, go to the gym management page.
 *
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllManagers, updateManager } from "../services/user-services";
import type {
  ManagerWithGym,
  UpdateManagerData,
} from "../interfaces/user-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { ManagerDetailsModal } from "../components/ManagerDetailsModal";

/* =============================================================================
   ESTILOS (inline)
   STYLES (inline)
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
    flex: "1 1 300px",
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
    width: "100%",
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
  clickableRow: {
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  warningBox: {
    padding: "15px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeeba",
    borderRadius: "8px",
    marginBottom: "20px",
    color: "#856404",
  },
};

/* =============================================================================
   COMPONENTE: ManagersManagementPage
   COMPONENT: ManagersManagementPage
   ============================================================================= */
export const ManagersManagementPage = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";

  // Estados del componente / Component states
  const [managers, setManagers] = useState<ManagerWithGym[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de filtro único / Single filter state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Estados para modal de detalles / States for details modal
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedManager, setSelectedManager] = useState<ManagerWithGym | null>(
    null
  );

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
      // Obtener todos los managers con búsqueda global
      // Get all managers with global search
      const filters = {
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

  // Efecto con debounce para cargar managers cuando cambie el filtro
  // Effect with debounce to load managers when filter changes
  useEffect(() => {
    // Debounce de 500ms para no saturar el backend
    // 500ms debounce to avoid overwhelming the backend
    const timeoutId = setTimeout(() => {
      fetchManagers();
    }, 500);

    // Limpiar timeout si el filtro cambia antes de que se ejecute
    // Clear timeout if filter changes before execution
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Se ejecuta cuando cambia el filtro / Runs when filter changes

  // Limpiar filtro / Clear filter
  const handleClearFilter = () => {
    setSearchTerm("");
  };

  // Calcular estadísticas / Calculate statistics
  const totalManagers = managers.length;

  // Manejar click en fila para ver detalles / Handle row click to view details
  const handleRowClick = (manager: ManagerWithGym) => {
    setSelectedManager(manager);
    setShowDetailsModal(true);
  };

  // Manejar guardado de cambios en manager / Handle manager changes save
  const handleSaveManager = async (
    managerId: number,
    updatedData: UpdateManagerData
  ) => {
    if (!token) {
      toast.error("No estás autenticado.");
      return;
    }

    try {
      // Actualizar manager en el backend
      // Update manager in backend
      const response = await updateManager(token, managerId, updatedData);

      // Mostrar mensaje de éxito
      // Show success message
      toast.success(response.message || "Manager actualizado correctamente.");

      // Actualizar la lista local de managers
      // Update local managers list
      setManagers((prev) =>
        prev.map((m) => (m.id === managerId ? response.user : m))
      );

      // Actualizar el manager seleccionado en el modal
      // Update selected manager in modal
      setSelectedManager(response.user);

      if (import.meta.env.DEV) {
        console.log("Manager actualizado:", response.user);
      }
    } catch (err) {
      const msg = handleApiError(err, "Error al actualizar el manager.");
      toast.error(msg);
      if (import.meta.env.DEV) {
        console.error("Error actualizando manager:", msg);
      }
      // Re-lanzar el error para que el modal lo maneje
      // Re-throw the error for the modal to handle
      throw err;
    }
  };

  // Cerrar modal de detalles / Close details modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedManager(null);
  };

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
          Visualiza, edita y filtra todos los gerentes registrados en la
          plataforma. Haz click en una fila para ver y editar detalles completos
          (incluido email y teléfono).
        </p>
      </div>

      {/* Advertencia sobre eliminación / Warning about deletion */}
      <div style={styles.warningBox}>
        <strong>ℹ️ Nota importante:</strong> Los managers no se pueden eliminar
        directamente desde esta página. Para eliminar un manager, debes eliminar
        el gimnasio asociado desde la página de gestión de gimnasios.
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

      {/* Filtro único / Single filter */}
      <div style={styles.filtersContainer}>
        {/* Búsqueda global / Global search */}
        <div style={styles.filterGroup}>
          <label htmlFor="searchFilter" style={styles.label}>
            Buscar Manager
          </label>
          <input
            id="searchFilter"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellidos, gimnasio o ciudad..."
            style={styles.input}
          />
          <small style={{ color: "#6c757d", fontSize: "0.85em" }}>
            La búsqueda filtra por todos los campos visibles
          </small>
        </div>

        {/* Botón de limpiar filtro / Clear filter button */}
        {searchTerm && (
          <button
            onClick={handleClearFilter}
            style={styles.clearButton}
            disabled={isLoading}>
            Limpiar Búsqueda
          </button>
        )}
      </div>

      {/* Tabla de managers / Managers table */}
      {managers.length === 0 ? (
        <div style={styles.emptyState}>
          {searchTerm ? (
            // Si hay búsqueda activa / If search is active
            <>
              <p>🔍 No se encontraron managers con el criterio de búsqueda.</p>
              <button
                onClick={handleClearFilter}
                style={{
                  ...styles.clearButton,
                  marginTop: "15px",
                  cursor: "pointer",
                }}>
                Limpiar búsqueda
              </button>
            </>
          ) : (
            // Si no hay búsqueda / If no search
            <p>📭 Aún no hay managers registrados.</p>
          )}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Manager</th>
                <th style={styles.th}>Gimnasio</th>
                <th style={styles.th}>Ciudad</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr
                  key={manager.id}
                  style={styles.clickableRow}
                  onClick={() => handleRowClick(manager)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title="Click para ver detalles completos (email, teléfono, etc.)">
                  <td style={styles.td}>
                    {manager.first_name} {manager.last_name}
                  </td>
                  <td style={styles.td}>{manager.gym_name}</td>
                  <td style={styles.td}>{manager.gym_city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles del manager / Manager details modal */}
      <ManagerDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        manager={selectedManager}
        onSave={handleSaveManager}
      />
    </div>
  );
};
