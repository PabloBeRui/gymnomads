import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllManagers, updateManager } from "../services/user-services";
import type {
  ManagerWithGym,
  UpdateManagerData,
} from "../interfaces/user-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { ManagerDetailsModal } from "../components/modals/ManagerDetailsModal";
import { Avatar } from "../components/Avatar";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../components/ui/PaginationControls";

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

  // Hook de paginación / Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setTotalItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination();

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
      const filters = {
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage,
      };
      const response = await getAllManagers(token, filters);
      setManagers(response.data);
      setTotalItems(response.total);
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
    const timeoutId = setTimeout(() => {
      fetchManagers();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentPage, itemsPerPage]);

  // Limpiar filtro / Clear filter
  const handleClearFilter = () => {
    setSearchTerm("");
    goToPage(1);
  };

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
      const response = await updateManager(token, managerId, updatedData);
      toast.success(response.message || "Manager actualizado correctamente.");
      setManagers((prev) =>
        prev.map((m) => (m.id === managerId ? response.user : m))
      );
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
          <div style={styles.statNumber}>{totalItems}</div>
          <div style={styles.statLabel}>
            {isLoading ? "Cargando..." : "Total de Managers"}
          </div>
        </div>
      </div>

      {/* Filtro único / Single filter */}
      <div style={styles.filtersContainer}>
        <div style={styles.filterGroup}>
          <label htmlFor="searchFilter" style={styles.label}>
            Buscar Manager
          </label>
          <input
            id="searchFilter"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Manager, Gimnasio, Ciudad"
            style={styles.input}
          />
          <small style={{ color: "#6c757d", fontSize: "0.85em" }}>
            La búsqueda filtra por todos los campos visibles
          </small>
        </div>

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
            <p>📭 Aún no hay managers registrados.</p>
          )}
        </div>
      ) : (
        <>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Manager</th>
                  <th style={styles.th}>Gimnasio</th>
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}>
                        <Avatar
                          src={manager.profile_picture}
                          firstName={manager.first_name}
                          lastName={manager.last_name}
                          size={35}
                        />
                        <span>
                          {manager.first_name} {manager.last_name}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}>
                        <Avatar
                          src={manager.logo_url}
                          firstName={manager.gym_name}
                          lastName=""
                          size={35}
                        />
                        <span>{manager.gym_name}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            onItemsPerPageChange={changeItemsPerPage}
          />
        </>
      )}

      <ManagerDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        manager={selectedManager}
        onSave={handleSaveManager}
      />
    </div>
  );
};
