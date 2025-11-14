import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAllUsers,
  getUsersByGym,
  deleteUser,
  type GetAllUsersFilters,
  type GetUsersByGymFilters,
} from "../services/user-services";
import { getAllGyms } from "../services/gym-services";
import type { UserWithGym, GymUser } from "../interfaces/user-interfaces";
import type { Gym } from "../interfaces/gym-interfaces";
import { toast } from "sonner";
import { handleApiError } from "../utils/error-handler";
import { Avatar } from "../components/Avatar";
import { UserDetailModal } from "../components/modals/UserDetailModal";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../components/ui/PaginationControls";
import {
  SortableTable,
  type ColumnDefinition,
} from "../components/ui/SortableTable";

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

  // Estados de filtros / Filter states
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [gymSearchTerm, setGymSearchTerm] = useState<string>("");

  // Estados para el modal / States for modal
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<
    UserWithGym | GymUser | null
  >(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Cargar gimnasios (solo para admin) / Load gyms (admin only)
  useEffect(() => {
    if (!isAdmin || !token) return;

    const fetchGyms = async () => {
      try {
        // Pedir una cantidad alta para asegurar que traemos todos para el filtro
        // Request a high amount to ensure we fetch all for the filter
        const gymsData = await getAllGyms(token, { limit: 1000 });
        // Validar que gymsData.data es un array / Validar que gymsData.data es un array
        const validGymsData = Array.isArray(gymsData.data) ? gymsData.data : [];
        setGyms(validGymsData);
      } catch (err) {
        const msg = handleApiError(err, "Error al cargar gimnasios.");
        toast.error("No se pudieron cargar los gimnasios.");
        // Ensure gyms is always an array / Asegurar que gyms siempre es un array
        setGyms([]);
        if (import.meta.env.DEV) {
          console.error("Error al cargar gimnasios:", msg);
        }
      }
    };

    fetchGyms();
  }, [isAdmin, token]);

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
      let response;

      if (isAdmin) {
        const gymIdAsNumber = Number(selectedGymId);
        const filters: GetAllUsersFilters = {
          search: searchTerm.trim() || undefined,
          page: currentPage,
          limit: itemsPerPage,
        };

        if (selectedGymId === "deleted") {
          filters.gym_status = "deleted";
        } else if (gymIdAsNumber > 0) {
          filters.gym_id = gymIdAsNumber;
          filters.gym_status = "active";
        }

        response = await getAllUsers(token, filters);
      } else if (isManager && user?.home_gym_id) {
        const filters: GetUsersByGymFilters = {
          search: searchTerm.trim() || undefined,
          page: currentPage,
          limit: itemsPerPage,
        };
        response = await getUsersByGym(token, user.home_gym_id, filters);
      } else {
        throw new Error("No tienes permisos para ver esta página.");
      }

      // Validate that response.data is an array / Validar que response.data es un array
      const validData = Array.isArray(response.data) ? response.data : [];
      setUsers(validData);
      setTotalItems(response.total || 0);
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar los usuarios.");
      setError(msg);
      toast.error("No se pudieron cargar los usuarios.");
      // Ensure users is always an array / Asegurar que users siempre es un array
      setUsers([]);
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
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGymId, searchTerm, currentPage, itemsPerPage]);

  // Limpiar filtros / Clear filters
  const handleClearFilters = () => {
    setSelectedGymId("");
    setSearchTerm("");
    setGymSearchTerm("");
    goToPage(1);
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

  // --- Lógica del Modal /  Modal Logic ---

  const handleRowClick = (user: UserWithGym | GymUser) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!token) {
      toast.error("No estás autenticado.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(token, userId);
      toast.success("Usuario eliminado correctamente.");
      // Refrescar la lista de usuarios en la página actual
      fetchUsers();
    } catch (err) {
      const msg = handleApiError(err, "Error al eliminar el usuario.");
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      handleCloseModal();
    }
  };

  // --- Definición de columnas para la tabla ---
  // --- Column definitions for the table ---
  const userColumns: ColumnDefinition<UserWithGym | GymUser>[] = [
    {
      key: "first_name",
      header: "Nombre",
      render: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
      ),
    },
    // Añadir columnas condicionalmente / Conditionally add columns
    ...(isAdmin
      ? [
          {
            key: "gym_name" as keyof (UserWithGym | GymUser),
            header: "Gimnasio",
            render: (u: UserWithGym | GymUser) => {
              const userWithGym = u as UserWithGym;
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                  <Avatar
                    src={userWithGym.logo_url}
                    firstName={userWithGym.gym_name}
                    lastName=""
                    size={35}
                  />
                  <span>
                    {userWithGym.gym_name}
                    {userWithGym.is_gym_deleted && " (Eliminado)"}
                  </span>
                </div>
              );
            },
          },
        ]
      : [
          {
            key: "registered_at" as keyof (UserWithGym | GymUser),
            header: "Fecha de Registro",
            render: (u: UserWithGym | GymUser) => formatDate(u.registered_at),
          },
        ]),
  ];

  // Render loading
  if (isLoading && users.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <p>Cargando usuarios...</p>
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
          <div style={styles.statNumber}>{totalItems}</div>
          <div style={styles.statLabel}>
            {isLoading ? "Cargando..." : "Total de Usuarios"}
          </div>
        </div>
      </div>

      {/* Filtros / Filters */}
      <div style={styles.filtersContainer}>
        {isAdmin && (
          <div style={styles.filterGroup}>
            <label htmlFor="gymFilter" style={styles.label}>
              Filtrar por Gimnasio
            </label>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o ciudad..."
              value={gymSearchTerm}
              onChange={(e) => setGymSearchTerm(e.target.value)}
              style={styles.gymSearchInput}
            />
            <select
              id="gymFilter"
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              style={styles.select}>
              <option value="">Todos los Usuarios</option>
              <option
                value="deleted"
                style={{ backgroundColor: "#ffebee", color: "#c62828" }}>
                Usuarios de Gimnasios Eliminados
              </option>
              {filteredGyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name} - {gym.city}
                </option>
              ))}
            </select>
            {gymSearchTerm && filteredGyms.length === 0 && (
              <small style={styles.noResultsText}>
                No se encontraron gimnasios
              </small>
            )}
          </div>
        )}

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
            <p>📭 Aún no hay usuarios registrados.</p>
          )}
        </div>
      ) : (
        <>
          <SortableTable
            data={users}
            columns={userColumns}
            initialSortConfig={{ key: "first_name", direction: "ascending" }}
            onRowClick={handleRowClick}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            onItemsPerPageChange={changeItemsPerPage}
          />
        </>
      )}

      <UserDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        user={selectedUser as UserWithGym | null}
        onDelete={handleDeleteUser}
        isDeleting={isDeleting}
      />
    </div>
  );
};
