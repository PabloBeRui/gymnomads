/**
 * =============================================================================
 * UNIT TEST: useGymsList Hook
 * =============================================================================
 *
 * Pruebas unitarias para el hook personalizado `useGymsList`.
 * Verifica la lógica de carga, filtrado, paginación y actualización de la lista de gimnasios.
 *
 * Unit tests for the `useGymsList` custom hook.
 * Verifies the logic for loading, filtering, pagination, and updating the gym list.
 *
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGymsList } from '@/hooks/useGymsList';
import { useAuth } from '@/context/AuthContext';
import { getAllGyms } from '@/services';
import { sortGymsByRole } from '@/utils';
import { usePagination } from '@/hooks/usePagination';
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
    getAllGyms: vi.fn(),
  };
});
vi.mock('@/utils', () => ({
  sortGymsByRole: vi.fn(),
  handleApiError: vi.fn((err, msg) => msg),
}));
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useGymsList', () => {
  const mockUserAdmin = { role: 'admin' };
  const mockUserNormal = { role: 'user', home_gym_id: 101 };
  const mockGyms = [
    { id: 1, name: 'Gym A', city: 'City X', is_suspended: 0 },
    { id: 2, name: 'Gym B', city: 'City Y', is_suspended: 0 },
    { id: 3, name: 'Gym C', city: 'City X', is_suspended: 0 },
  ];

  beforeEach(() => {
    getAllGyms.mockResolvedValue({ data: mockGyms, total: mockGyms.length });
    sortGymsByRole.mockImplementation((gyms, user) => {
      if (user?.home_gym_id) {
        const homeGym = gyms.find(g => g.id === user.home_gym_id);
        const otherGyms = gyms.filter(g => g.id !== user.home_gym_id);
        return homeGym ? [homeGym, ...otherGyms] : gyms;
      }
      return gyms;
    });
    // Reset pagination mock to default for each test
    (usePagination as Mock).mockReturnValue({
      currentPage: 1,
      itemsPerPage: 6,
      totalItems: 0,
      totalPages: 0,
      setTotalItems: vi.fn(),
      goToPage: vi.fn(),
      changeItemsPerPage: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test case 1: Admin user fetches gyms (server-side pagination)
  it('should fetch gyms for admin user with server-side pagination', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockUserAdmin, token: 'admin-token' });
    
    const { result } = renderHook(() => useGymsList());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 }); // Wait for debounce

    expect(getAllGyms).toHaveBeenCalledWith('admin-token', {
      search: undefined,
      page: 1,
      limit: 6,
      orderBy: 'name_asc',
    });
    expect(result.current.gyms).toEqual(mockGyms);
    expect(result.current.pagination.setTotalItems).toHaveBeenCalledWith(mockGyms.length);
  });

  // Test case 2: Regular user fetches gyms (client-side pagination)
  it('should fetch all gyms and sort for regular user with client-side pagination', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockUserNormal, token: 'user-token' });
    (getAllGyms as Mock).mockResolvedValue({ data: mockGyms, total: mockGyms.length });

    const { result } = renderHook(() => useGymsList());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 }); // Wait for debounce

    expect(getAllGyms).toHaveBeenCalledWith('user-token', {
      search: undefined,
      limit: 1000,
    });
    expect(sortGymsByRole).toHaveBeenCalledWith(mockGyms, mockUserNormal);
    // For client-side, the initial 'gyms' state should be the first page of sorted gyms
    expect(result.current.gyms).toEqual(mockGyms.slice(0, 6)); 
    expect(result.current.pagination.setTotalItems).toHaveBeenCalledWith(mockGyms.length);
  });

  // Test case 3: handleSearchChange
  it('should update searchTerm and reset page on handleSearchChange', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockUserAdmin, token: 'admin-token' });
    const mockGoToPage = vi.fn();
    (usePagination as Mock).mockReturnValue({
      currentPage: 2,
      itemsPerPage: 6,
      totalItems: 10,
      totalPages: 2,
      setTotalItems: vi.fn(),
      goToPage: mockGoToPage,
      changeItemsPerPage: vi.fn(),
    });

    const { result } = renderHook(() => useGymsList());
    
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });
    
    act(() => {
      result.current.handleSearchChange('new search');
    });
    await waitFor(() => {
      expect(result.current.searchTerm).toBe('new search');
      expect(mockGoToPage).toHaveBeenCalledWith(1);
      expect(getAllGyms).toHaveBeenCalledWith('admin-token', expect.objectContaining({ search: 'new search' }));
    }, { timeout: 1000 });
  });

  // Test case 4: Error handling during fetch
  it('should set error state and show toast on fetch failure', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockUserAdmin, token: 'admin-token' });
    (getAllGyms as Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useGymsList());

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });

    expect(result.current.error).toBe("Hubo un problema al cargar los gimnasios.");
    expect(toast.error).toHaveBeenCalledWith("Hubo un problema al cargar los gimnasios.");
    expect(result.current.gyms).toEqual([]);
  });

  // Test case 5: removeGymFromState
  it('should optimistically remove a gym and then re-fetch', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockUserAdmin, token: 'admin-token' });
    const { result } = renderHook(() => useGymsList());

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });
    
    // Initial fetch
    expect(result.current.gyms).toEqual(mockGyms);
    expect(getAllGyms).toHaveBeenCalledTimes(1);

    // Call remove
    act(() => {
      result.current.removeGymFromState(2); // Remove Gym B
    });
    await waitFor(() => {
      expect(result.current.gyms).toEqual([mockGyms[0], mockGyms[2]]);
    }, { timeout: 1000 });
    
    // Re-fetch should be triggered
    await waitFor(() => expect(getAllGyms).toHaveBeenCalledTimes(2), { timeout: 1000 });
    // After re-fetch, state should be consistent (if backend also removed it)
    // Here we mock getAllGyms to return original list again, so it will "re-add" it.
    // In a real scenario, getAllGyms would return the list without id 2.
    // For this test, we just ensure the re-fetch happens.
  });

  // Test case 6: updateGymInState
  it('should optimistically update a gym in state', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockUserNormal, token: 'user-token' });
    (getAllGyms as Mock).mockResolvedValue({ data: mockGyms, total: mockGyms.length });
    
    const { result } = renderHook(() => useGymsList());
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });
    
    // Initial state after client-side pagination slice
    expect(result.current.gyms).toEqual(mockGyms.slice(0, 6)); 
    
    const updatedGym = { ...mockGyms[0], name: 'Updated Gym A', city: 'New City' };
    act(() => {
      result.current.updateGymInState(updatedGym);
    });
    await waitFor(() => {
      expect(result.current.gyms).toEqual([updatedGym, mockGyms[1], mockGyms[2]]); 
    }, { timeout: 1000 }); 
    
    // If not admin, the exposed 'gyms' state (after pagination slice) should reflect the update
    await waitFor(() => {
        expect(result.current.gyms).toEqual([updatedGym, mockGyms[1], mockGyms[2]]);
    }, { timeout: 1000 });
  });
});
