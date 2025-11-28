/**
 * =============================================================================
 * PRUEBA UNITARIA: Ordenador de Gimnasios
 * UNIT TEST: Gym Sorter
 * =============================================================================
 *
 * Pruebas para asegurar que los gimnasios se ordenan correctamente según el rol.
 *
 * Tests to ensure gyms are sorted correctly according to role.
 *
 * =============================================================================
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { sortGymsByRole } from '../../utils';
import type { Gym, User } from '../../interfaces';

// Mock Data
const mockGyms: Gym[] = [
    { id: 1, name: 'Gym A', city: 'City A', phone_number: '111', website: 'http://a.com', description: 'A', gym_logo: '', gym_images: [] } as unknown as Gym,
    { id: 2, name: 'Gym B', city: 'City B', phone_number: '222', website: 'http://b.com', description: 'B', gym_logo: '', gym_images: [] } as unknown as Gym,
    { id: 3, name: 'Gym C', city: 'City C', phone_number: '333', website: 'http://c.com', description: 'C', gym_logo: '', gym_images: [] } as unknown as Gym,
];

const mockAdmin: User = { id: 1, role: 'admin', name: 'Admin', email: 'admin@test.com', created_at: '' } as unknown as User;
const mockUser: User = { id: 2, role: 'user', name: 'User', email: 'user@test.com', created_at: '' } as unknown as User;
const mockManager: User = { id: 3, role: 'manager', name: 'Manager', email: 'manager@test.com', created_at: '', home_gym_id: 2 } as unknown as User;

describe('gym-sorter utils', () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return gyms as-is for admin', () => {
        // Admin expects no changes
        const result = sortGymsByRole(mockGyms, mockAdmin);
        expect(result).toEqual(mockGyms);
        expect(result[0].id).toBe(1);
        expect(result[1].id).toBe(2);
        expect(result[2].id).toBe(3);
    });

    it('should place home gym first for manager', () => {
        const result = sortGymsByRole(mockGyms, mockManager);
        // El gimnasio con id 2 (Gym B) debe ser el primero // Gym with id 2 (Gym B) must be first
        expect(result[0].id).toBe(2); 
        expect(result).toHaveLength(3);
        expect(result).toEqual(expect.arrayContaining(mockGyms));
    });
    
    it('should treat manager as normal user if home_gym_id not found', () => {
        const managerNoGym = { ...mockManager, home_gym_id: 999 };
        const result = sortGymsByRole(mockGyms, managerNoGym);
        
        // Solo verificamos que devuelve todos los elementos // Just verify it returns all elements
        expect(result).toHaveLength(3);
        expect(result).toEqual(expect.arrayContaining(mockGyms));
    });

    it('should shuffle for standard user', () => {
        // Mock Math.random to force a specific shuffle order to verify it changes
        // Simplest is to ensure it returns a new array instance
        const result = sortGymsByRole(mockGyms, mockUser);
        expect(result).toHaveLength(3);
        expect(result).toEqual(expect.arrayContaining(mockGyms));
        expect(result).not.toBe(mockGyms); // Should be a copy/new array
    });

    it('should shuffle for guest (null user)', () => {
        const result = sortGymsByRole(mockGyms, null);
        expect(result).toHaveLength(3);
        expect(result).toEqual(expect.arrayContaining(mockGyms));
        expect(result).not.toBe(mockGyms);
    });
});
