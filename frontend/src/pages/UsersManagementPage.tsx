/**
 * =============================================================================
 * PÁGINA: UsersManagementPage
 * =============================================================================
 *
 * Página para gestionar y visualizar usuarios registrados en gimnasios.
 * - Admin: puede ver todos los usuarios y filtrar por gimnasio y búsqueda.
 * - Manager: solo ve usuarios de su gimnasio, puede filtrar por búsqueda.
 *
 * Page to manage and view registered gym users.
 * - Admin: can see all users and filter by gym and search.
 * - Manager: only sees users from their gym, can filter by search.
 *
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// ---Importar deleteUser /  Import deleteUser ---
import {
  getAllUsers,
  getUsersByGym,
  deleteUser,
} from "../services/user-services";
import { getAllGyms } from "../services/gym-services";
import type { UserWithGym, GymUser } from "../interfaces/user-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
//  Importar componentes de UI /  Import UI components ---
import { Avatar } from "../components/Avatar";
import { UserDetailModal } from "../components/userDetailModal";

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
  select: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "200px",
    backgroundColor: "white",
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
  // --- NUEVO: Estilo para filas clickeables / NEW: Style for clickable rows ---
  clickableRow: {
    cursor: "pointer",
    transition: "background-color 0.2s",
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
    color: "#28a745",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#6c757d",
    marginTop: "5px",
  },
  gymSearchInput: {
    padding: "8px",
    fontSize: "0.9rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "200px",
    marginBottom: "5px",
  },
  noResultsText: {
    color: "#dc3545",
    fontSize: "0.85rem",
    marginTop: "5px",
  },
};

/* =============================================================================
   COMPONENTE: UsersManagementPage
   COMPONENT: UsersManagementPage
   ============================================================================= */
export const UsersManagementPage = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  // Estados del componente / Component states
  const [users, setUsers] = useState<(UserWithGym | GymUser)[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros / Filter states
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [gymSearchTerm, setGymSearchTerm] = useState<string>("");

  // --- NUEVO: Estados para el modal / NEW: States for modal ---
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<
    UserWithGym | GymUser | null
  >(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Cargar gimnasios (solo para admin) / Load gyms (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchGyms = async () => {
      try {
        const gymsData = await getAllGyms();
        setGyms(gymsData);
      } catch (err) {
        const msg = handleApiError(err, "Error al cargar gimnasios.");
        toast.error("No se pudieron cargar los gimnasios.");
        if (import.meta.env.DEV) {
          console.error("Error al cargar gimnasios:", msg);
        }
      }
    };

    fetchGyms();
  }, [isAdmin]);

  // Filtrar gimnasios según el término de búsqueda / Filter gyms by search term
  const filteredGyms = gyms.filter(
    (gym) =>
      gym.name.toLowerCase().includes(gymSearchTerm.toLowerCase()) ||
      gym.city.toLowerCase().includes(gymSearchTerm.toLowerCase())
  );

  // Cargar usuarios / Load users
  const fetchUsers = async () => {
    if (!token) {
      setError("No estás autenticado.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      let usersData: (UserWithGym | GymUser)[];

      if (isAdmin) {
        // Admin: obtener todos los usuarios con filtros opcionales
        // Admin: get all users with optional filters
        const filters = {
          gym_id: selectedGymId ? Number(selectedGymId) : undefined,
          search: searchTerm.trim() || undefined,
        };
        usersData = await getAllUsers(token, filters);
      } else if (isManager && user?.home_gym_id) {
        // Manager: obtener solo usuarios de su gimnasio
        // Manager: get only users from their gym
        const filters = {
          search: searchTerm.trim() || undefined,
        };
        usersData = await getUsersByGym(token, user.home_gym_id, filters);
      } else {
        throw new Error("No tienes permisos para ver esta página.");
      }

      setUsers(usersData);
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar los usuarios.");
      setError(msg);
      toast.error("No se pudieron cargar los usuarios.");
      if (import.meta.env.DEV) {
        console.error("Error al cargar usuarios:", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto con debounce para cargar usuarios cuando cambien los filtros
  // Effect with debounce to load users when filters change
  useEffect(() => {
    // Debounce de 500ms para no saturar el backend
    // 500ms debounce to avoid overwhelming the backend
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500);

    // Limpiar timeout si los filtros cambian antes de que se ejecute
    // Clear timeout if filters change before execution
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGymId, searchTerm]); // Se ejecuta cuando cambian los filtros / Runs when filters change

  // Limpiar filtros / Clear filters
  const handleClearFilters = () => {
    setSelectedGymId("");
    setSearchTerm("");
    setGymSearchTerm("");
  };

  // Formatear fecha para mostrar / Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // --- NUEVO: Lógica del Modal / NEW: Modal Logic ---

  // Abrir el modal con el usuario seleccionado
  // Open the modal with the selected user
  const handleRowClick = (user: UserWithGym | GymUser) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Cerrar el modal y limpiar la selección
  // Close the modal and clear selection
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  // Manejar la eliminación del usuario (se pasa al modal)
  // Handle user deletion (passed to modal)
  const handleDeleteUser = async (userId: number) => {
    if (!token) {
      toast.error("No estás autenticado.");
      return;
    }

    setIsDeleting(true);
    try {
      // Llamar al servicio de eliminación
      // Call delete service
      await deleteUser(token, userId);
      toast.success("Usuario eliminado correctamente.");

      // Actualizar estado local (optimista)
      // Update local state (optimistic)
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    } catch (err) {
      const msg = handleApiError(err, "Error al eliminar el usuario.");
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };
  // --- FIN NUEVA LÓGICA ---

  // Calcular estadísticas / Calculate statistics
  const totalUsers = users.length;

  // Render loading
  if (isLoading && users.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <p>Cargando usuarios...</p>
        {/* TODO: Spinner */}
      </div>
    );
  }

  // Render error
  if (error && users.length === 0) {
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
        <h1 style={styles.title}>
          {isAdmin ? "Gestión de Usuarios" : "Usuarios de mi Gimnasio"}
        </h1>
        <p style={styles.subtitle}>
          {isAdmin
            ? "Visualiza y filtra todos los usuarios registrados en la plataforma."
            : "Visualiza y filtra los usuarios registrados en tu gimnasio."}
        </p>
      </div>

      {/* Estadísticas / Statistics */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{totalUsers}</div>
          <div style={styles.statLabel}>
            {isLoading ? "Cargando..." : "Total de Usuarios"}
          </div>
        </div>
      </div>

      {/* Filtros / Filters */}
      <div style={styles.filtersContainer}>
        {/* Filtro por gimnasio (solo admin) / Gym filter (admin only) */}
        {isAdmin && (
          <div style={styles.filterGroup}>
            <label htmlFor="gymFilter" style={styles.label}>
              Filtrar por Gimnasio
            </label>

            {/* Input de búsqueda para filtrar el dropdown */}
            {/* Search input to filter the dropdown */}
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o ciudad..."
              value={gymSearchTerm}
              onChange={(e) => setGymSearchTerm(e.target.value)}
              style={styles.gymSearchInput}
            />

            {/* Dropdown con gimnasios filtrados */}
            {/* Dropdown with filtered gyms */}
            <select
              id="gymFilter"
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              style={styles.select}>
              <option value="">
                Todos los gimnasios ({filteredGyms.length})
              </option>
              {filteredGyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name} - {gym.city}
                </option>
              ))}
            </select>

            {/* Mensaje si no hay resultados en la búsqueda de gimnasios */}
            {/* Message if no results in gym search */}
            {gymSearchTerm && filteredGyms.length === 0 && (
              <small style={styles.noResultsText}>
                No se encontraron gimnasios
              </small>
            )}
          </div>
        )}

        {/* Filtro por búsqueda de usuario (común para admin y manager) */}
        {/* User search filter (common for admin and manager) */}
        <div style={styles.filterGroup}>
          <label htmlFor="searchFilter" style={styles.label}>
            Buscar Usuario
          </label>
          <input
            id="searchFilter"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nombre o email..."
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

      {/* Tabla de usuarios / Users table */}
      {users.length === 0 ? (
        <div style={styles.emptyState}>
          {searchTerm || selectedGymId ? (
            // Si hay filtros activos / If filters are active
            <>
              <p>🔍 No se encontraron usuarios con los filtros aplicados.</p>
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
            <p>📭 Aún no hay usuarios registrados.</p>
          )}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            {/* --- MODIFICADO: Cabecera de tabla / MODIFIED: Table header --- */}
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                {isAdmin && <th style={styles.th}>Gimnasio</th>}
                <th style={styles.th}>Fecha de Registro</th>
              </tr>
            </thead>
            {/* --- FIN MODIFICADO --- */}

            {/* --- MODIFICADO: Cuerpo de tabla / MODIFIED: Table body --- */}
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={styles.clickableRow} // <-- NUEVO: Estilo clickeable
                  onClick={() => handleRowClick(u)} // <-- NUEVO: Abre modal
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title={`Ver detalles de ${u.first_name} ${u.last_name}`}>
                  {/* Columna: Avatar + Nombre */}
                  {/* Column: Avatar + Name */}
                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}>
                      <Avatar
                        src={u.profile_picture}
                        firstName={u.first_name}
                        lastName={u.last_name}
                        size={35}
                      />
                      <span>
                        {u.first_name} {u.last_name}
                      </span>
                    </div>
                  </td>

                  {/* Columna: Gimnasio (con logo, solo Admin) */}
                  {/* Column: Gym (with logo, Admin only) */}
                  {isAdmin && "gym_name" in u && (
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}>
                        <Avatar
                          src={(u as UserWithGym).logo_url}
                          firstName={u.gym_name}
                          lastName=""
                          size={35}
                        />
                        <span>{u.gym_name}</span>
                      </div>
                    </td>
                  )}

                  {/* Columna: Fecha de Registro */}
                  {/* Column: Registration Date */}
                  <td style={styles.td}>{formatDate(u.registered_at)}</td>
                </tr>
              ))}
            </tbody>
            {/* --- FIN MODIFICADO --- */}
          </table>
        </div>
      )}

      {/* --- NUEVO: Renderizar el modal / NEW: Render the modal --- */}
      <UserDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        user={selectedUser as UserWithGym | null} // Asegurar el tipo / Ensure type
        onDelete={handleDeleteUser}
        isDeleting={isDeleting}
      />
    </div>
  );
};
