/**
 * =============================================================================
 * PRUEBA DE INTEGRACIÓN: Página de Login
 * INTEGRATION TEST: Login Page
 * =============================================================================
 *
 * Pruebas de integración para la página de inicio de sesión simulando API y Contexto.
 *
 * Integration tests for the login page mocking API and Context.
 *
 * =============================================================================
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { LoginPage } from '../../pages/LoginPage';
import { useAuth } from '../../context/AuthContext';
import { useApiCall } from '../../hooks';
import { toast } from 'sonner';

// Mocks
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../hooks', () => ({
    useApiCall: vi.fn(),
    useEmail: vi.fn(), // Añadir otros hooks si se usan en la página, aunque no estén mockeados aquí
    useImageUpload: vi.fn(),
    useMediaQuery: vi.fn(),
    usePagination: vi.fn(),
    useSorting: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock de componente Spinner
vi.mock('../../components/ui/Spinner', () => ({
    default: () => <div data-testid="spinner">Spinner</div>,
}));

describe('LoginPage', () => {
    const mockAuthLogin = vi.fn();
    const mockExecute = vi.fn();
    const mockResetError = vi.fn();
    
    beforeEach(() => {
        (useAuth as Mock).mockReturnValue({
            login: mockAuthLogin,
        });

        (useApiCall as Mock).mockReturnValue({
            loading: false,
            error: null,
            execute: mockExecute,
            resetError: mockResetError,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render login form', () => {
        render(<LoginPage />);
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    it('should show validation error toast if fields are empty', () => {
        render(<LoginPage />);
        const form = screen.getByRole('form', { name: /Formulario de inicio de sesión/i });
        
        // Disparar submit directamente para probar la validación lógica (bypass HTML5 required)
        // Fire submit directly to test logical validation (bypassing HTML5 required)
        fireEvent.submit(form);
        
        expect(toast.error).toHaveBeenCalledWith("Por favor, completa todos los campos.");
    });

    it('should call execute and login on valid submission', async () => {
        // Setup successful API response
        mockExecute.mockResolvedValue({ token: 'fake-token', message: 'Welcome' });
        
        render(<LoginPage />);
        
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
        
        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalled();
        });
        
        await waitFor(() => {
             expect(mockAuthLogin).toHaveBeenCalledWith('fake-token');
        });
    });

    it('should display loading state', () => {
        (useApiCall as Mock).mockReturnValue({
            loading: true,
            error: null,
            execute: mockExecute,
            resetError: mockResetError,
        });

        render(<LoginPage />);
        
        expect(screen.getByRole('button', { name: /Iniciando sesión.../i })).toBeDisabled();
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should display error alert when api call fails', () => {
        (useApiCall as Mock).mockReturnValue({
            loading: false,
            error: "Invalid credentials",
            execute: mockExecute,
            resetError: mockResetError,
        });

        render(<LoginPage />);
        
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
});
