/**
 * =============================================================================
 * UNIT TEST: useUsersManagement Hook
 * =============================================================================
 *
 * Pruebas unitarias para el hook personalizado `useUsersManagement`.
 * Verifica la lógica de carga, filtrado, paginación y eliminación de usuarios.
 *
 * Unit tests for the `useUsersManagement` custom hook.
 * Verifies the logic for loading, filtering, pagination, and user deletion.
 *
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUsersManagement } from '@/hooks/useUsersManagement';
import { useAuth } from '@/context/AuthContext';
import {
  getAllUsers,
  getUsersByGym,
  deleteUser,
  getAllGyms,
} from '@/services';
import { usePagination } from '@/hooks/usePagination';
import { handleApiError } from '@/utils';
import { toast } from 'sonner';

// Mock all external dependencies
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/hooks/usePagination', () => ({
  usePagination: vi.fn(() => ({
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 0,
    totalPages: 0,
    setTotalItems: vi.fn(),
    goToPage: vi.fn(),
    changeItemsPerPage: vi.fn(),
  })),
}));
vi.mock('@/services', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/services')>();
  return {
    ...mod,
    getAllUsers: vi.fn(),
    getUsersByGym: vi.fn(),
    deleteUser: vi.fn(),
    getAllGyms: vi.fn(),
  };
});
vi.mock('@/hooks', () => ({
  usePagination: vi.fn(() => ({
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 0,
    totalPages: 0,
    setTotalItems: vi.fn(),
    goToPage: vi.fn(),
    changeItemsPerPage: vi.fn(),
  })),
}));
vi.mock('@/utils', () => ({
  handleApiError: vi.fn((err, msg) => msg),
}));
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useUsersManagement', () => {
  const mockAdminUser = { role: 'admin' };
  const mockManagerUser = { role: 'manager', home_gym_id: 1 };
  const mockToken = 'test-token';
  const mockUsers = [
    { id: 1, first_name: 'User 1', email: 'user1@example.com', role: 'user' },
    { id: 2, first_name: 'User 2', email: 'user2@example.com', role: 'user' },
  ];
  const mockGyms = [
    { id: 1, name: 'Gym 1', city: 'City A' },
    { id: 2, name: 'Gym 2', city: 'City B' },
  ];

  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockAdminUser, token: mockToken });
    getAllUsers.mockResolvedValue({ data: mockUsers, total: mockUsers.length });
    getUsersByGym.mockResolvedValue({ data: mockUsers, total: mockUsers.length });
    deleteUser.mockResolvedValue({ message: 'User deleted' });
    getAllGyms.mockResolvedValue({ data: mockGyms, total: mockGyms.length });
    (usePagination as Mock).mockReturnValue({
      currentPage: 1,
      itemsPerPage: 6,
      totalItems: mockUsers.length,
      totalPages: Math.ceil(mockUsers.length / 6),
      setTotalItems: vi.fn(),
      goToPage: vi.fn(),
      changeItemsPerPage: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch users for admin user on mount', async () => {
    const { result } = renderHook(() => useUsersManagement());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });

    expect(getAllUsers).toHaveBeenCalledWith(mockToken, expect.objectContaining({
      page: 1,
      limit: 6,
      search: undefined,
    }));
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });

  it('should fetch users for manager user on mount', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockManagerUser, token: mockToken });
    const { result } = renderHook(() => useUsersManagement());

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });

    expect(getUsersByGym).toHaveBeenCalledWith(mockToken, mockManagerUser.home_gym_id, expect.objectContaining({
      page: 1,
      limit: 6,
    }));
    expect(result.current.users).toEqual(mockUsers);
  });

  it('should filter users by search term', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    const mockGoToPage = vi.fn();
    (usePagination as Mock).mockReturnValue({
        currentPage: 2, itemsPerPage: 6, totalItems: 10, totalPages: 2,
        setTotalItems: vi.fn(), goToPage: mockGoToPage, changeItemsPerPage: vi.fn(),
    });

    const { result } = renderHook(() => useUsersManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });

    act(() => {
      result.current.setSearchTerm('User 1');
    });
    expect(mockGoToPage).toHaveBeenCalledWith(1);
    await waitFor(() => expect(getAllUsers).toHaveBeenCalledWith(mockToken, expect.objectContaining({ search: 'User 1' })), { timeout: 1000 });
  });

  it('should delete a user and refresh the list', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    const { result } = renderHook(() => useUsersManagement());

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });
    
    // Mock getAllUsers to return one less user after deletion
    (getAllUsers as Mock).mockResolvedValueOnce({ data: [mockUsers[1]], total: 1 });

    let success;
    await act(async () => {
      success = await result.current.deleteUser(mockUsers[0].id); // Delete User 1
    });

    expect(success).toBe(true);
    expect(deleteUser).toHaveBeenCalledWith(mockToken, mockUsers[0].id);
    expect(toast.success).toHaveBeenCalledWith('Usuario eliminado correctamente.');
    expect(getAllUsers).toHaveBeenCalledTimes(2); // Initial fetch + refresh after delete
  });

  it('should handle delete user error', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    (deleteUser as Mock).mockRejectedValue(new Error('Delete failed'));
    
    const { result } = renderHook(() => useUsersManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });

    let success;
    await act(async () => {
      success = await result.current.deleteUser(mockUsers[0].id);
    });
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Error al eliminar el usuario.');
    expect(deleteUser).toHaveBeenCalledTimes(1);
  });

  it('should fetch gyms for admin filter dropdown', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    const { result } = renderHook(() => useUsersManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });
    expect(getAllGyms).toHaveBeenCalledWith(mockToken, { limit: 1000 });
    expect(result.current.gyms).toEqual(mockGyms);
  });

  it('should filter gym options locally by gymSearchTerm', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    (getAllGyms as Mock).mockResolvedValue({ data: mockGyms, total: mockGyms.length });
    
        (getAllGyms as Mock).mockResolvedValueOnce({ data: mockGyms, total: mockGyms.length }); // Mock getAllGyms specifically for this test case
        
        const { result } = renderHook(() => useUsersManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
    // ONLY wait for result.current.gyms to be populated
    await waitFor(() => expect(result.current.gyms).toEqual(mockGyms), { timeout: 3000 }); 
    act(() => {
      result.current.setGymSearchTerm('Gym 1');
    });
    await waitFor(() => expect(result.current.gyms).toEqual([{ id: 1, name: 'Gym 1', city: 'City A' }]), { timeout: 1000 });
  });
});
