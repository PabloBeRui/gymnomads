/**
 * =============================================================================
 * UNIT TEST: useVisitsManagement Hook
 * =============================================================================
 *
 * Pruebas unitarias para el hook personalizado `useVisitsManagement`.
 * Verifica la lógica de carga, filtrado, paginación y manejo de vistas de visitas.
 *
 * Unit tests for the `useVisitsManagement` custom hook.
 * Verifies the logic for loading, filtering, pagination, and visit view management.
 *
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useVisitsManagement } from '@/hooks/useVisitsManagement';
import { useAuth } from '@/context/AuthContext';
import {
  getAllVisits,
  getManagerGymVisits,
  getManagerOutgoingVisits,
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
    getAllVisits: vi.fn(),
    getManagerGymVisits: vi.fn(),
    getManagerOutgoingVisits: vi.fn(),
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

describe('useVisitsManagement', () => {
  const mockAdminUser = { role: 'admin' };
  const mockManagerUser = { role: 'manager', home_gym_id: 1 };
  const mockToken = 'test-token';
  const mockVisits = [
    { id: 1, gym_name: 'Gym A', user_name: 'User 1', visit_date: '2023-01-01T10:00:00Z' },
    { id: 2, gym_name: 'Gym B', user_name: 'User 2', visit_date: '2023-01-02T11:00:00Z' },
  ];
  const mockGyms = [
    { id: 1, name: 'Gym 1', city: 'City A' },
    { id: 2, name: 'Gym 2', city: 'City B' },
  ];

  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockAdminUser, token: mockToken });
    getAllVisits.mockResolvedValue({ data: mockVisits, total: mockVisits.length });
    getManagerGymVisits.mockResolvedValue({ data: mockVisits, total: mockVisits.length });
    getManagerOutgoingVisits.mockResolvedValue({ data: mockVisits, total: mockVisits.length });
    getAllGyms.mockResolvedValue({ data: mockGyms, total: mockGyms.length });
    (handleApiError as Mock).mockImplementation((err, msg) => msg);
    (usePagination as Mock).mockReturnValue({
      currentPage: 1,
      itemsPerPage: 6,
      totalItems: mockVisits.length,
      totalPages: Math.ceil(mockVisits.length / 6),
      setTotalItems: vi.fn(),
      goToPage: vi.fn(),
      changeItemsPerPage: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch visits for admin user on mount', async () => {
    const { result } = renderHook(() => useVisitsManagement());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });

    expect(getAllVisits).toHaveBeenCalledWith(mockToken, expect.objectContaining({
      page: 1,
      limit: 6,
      user_search: undefined,
    }));
    expect(result.current.visits).toEqual(mockVisits);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.setTotalItems).toHaveBeenCalledWith(mockVisits.length);
  });

  it('should fetch visits for manager user (received view)', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockManagerUser, token: mockToken });
    const { result } = renderHook(() => useVisitsManagement());

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });

    expect(getManagerGymVisits).toHaveBeenCalledWith(mockToken, expect.objectContaining({
      page: 1,
      limit: 6,
    }));
    expect(result.current.visits).toEqual(mockVisits);
    expect(result.current.managerVisitView).toBe('received');
  });

  it('should switch to "sent" view for manager and fetch outgoing visits', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockManagerUser, token: mockToken });
    const { result } = renderHook(() => useVisitsManagement());

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });
    
    // Simulate changing view
    act(() => {
      result.current.setManagerVisitView('sent');
    });
    await waitFor(() => expect(result.current.managerVisitView).toBe('sent'));

    // Debounce wait
    await waitFor(() => expect(getManagerOutgoingVisits).toHaveBeenCalledWith(mockToken, expect.any(Object)), { timeout: 1000 });
    expect(getManagerOutgoingVisits).toHaveBeenCalledTimes(1);
    expect(result.current.visits).toEqual(mockVisits);
  });

  it('should filter visits by user search term', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    const mockGoToPage = vi.fn();
    (usePagination as Mock).mockReturnValue({
        currentPage: 2, itemsPerPage: 6, totalItems: 10, totalPages: 2,
        setTotalItems: vi.fn(), goToPage: mockGoToPage, changeItemsPerPage: vi.fn(),
    });

    const { result } = renderHook(() => useVisitsManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });

    act(() => {
      result.current.setUserSearch('User 1');
    });
    expect(mockGoToPage).toHaveBeenCalledWith(1);
    await waitFor(() => expect(getAllVisits).toHaveBeenCalledWith(mockToken, expect.objectContaining({ user_search: 'User 1' })), { timeout: 1000 });
  });

  it('should filter visits by gym ID (admin)', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    const { result } = renderHook(() => useVisitsManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });

    act(() => {
      result.current.setSelectedGymId('1');
    });
    await waitFor(() => expect(getAllVisits).toHaveBeenCalledWith(mockToken, expect.objectContaining({ gym_id: 1 })), { timeout: 1000 });
  });

  it('should handle fetch errors gracefully', async () => {
    (getAllVisits as Mock).mockRejectedValue(new Error('Network error'));
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    const { result } = renderHook(() => useVisitsManagement());

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 1000 });
    
    expect(result.current.error).toBe('Error al cargar las visitas.');
    expect(toast.error).toHaveBeenCalledWith('No se pudieron cargar las visitas.');
    expect(result.current.visits).toEqual([]);
  });

  it('should fetch gyms for admin filter dropdown', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    const { result } = renderHook(() => useVisitsManagement());
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
    expect(getAllGyms).toHaveBeenCalledWith(mockToken, { limit: 1000 });
    expect(result.current.gyms).toEqual(mockGyms);
  });

  it('should filter gym options locally by gymSearchTerm', async () => {
    (useAuth as Mock).mockReturnValue({ user: mockAdminUser, token: mockToken });
    (getAllGyms as Mock).mockResolvedValue({ data: mockGyms, total: mockGyms.length }); // Mock again for clarity
    
        (getAllGyms as Mock).mockResolvedValueOnce({ data: mockGyms, total: mockGyms.length }); // Mock getAllGyms specifically for this test case
        
        const { result } = renderHook(() => useVisitsManagement());
            await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
            // ONLY wait for result.current.gyms to be populated
            await waitFor(() => expect(result.current.gyms).toEqual(mockGyms), { timeout: 3000 });     // Then proceed with the filtering test
    act(() => {
      result.current.setGymSearchTerm('Gym 1');
    });
    await waitFor(() => expect(result.current.gyms).toEqual([{ id: 1, name: 'Gym 1', city: 'City A' }]), { timeout: 1000 });
  });
});
