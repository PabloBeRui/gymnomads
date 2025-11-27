/**
 * =============================================================================
 * PRUEBA DE INTEGRACIÓN: Input de Filtro
 * INTEGRATION TEST: Filter Input
 * =============================================================================
 *
 * Pruebas para verificar la interacción del usuario con el componente de filtro.
 *
 * Tests to verify user interaction with the filter component.
 *
 * =============================================================================
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterInput } from '../../../components/forms/FilterInput';

describe('FilterInput Component', () => {
    const mockOnChange = vi.fn();
    const mockOnClear = vi.fn();
    const defaultProps = {
        label: 'Test Filter',
        value: '',
        onChange: mockOnChange,
        onClear: mockOnClear,
        placeholder: 'Type here...',
    };

    it('should render label and placeholder', () => {
        render(<FilterInput {...defaultProps} />);
        expect(screen.getByLabelText('Test Filter')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('should call onChange when typing', () => {
        render(<FilterInput {...defaultProps} />);
        const input = screen.getByPlaceholderText('Type here...');
        fireEvent.change(input, { target: { value: 'Hello' } });
        expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should show clear button only when value is present', () => {
        const { rerender } = render(<FilterInput {...defaultProps} value="" />);
        const clearButton = screen.queryByLabelText('Limpiar filtro');
        expect(clearButton).not.toBeInTheDocument();

        rerender(<FilterInput {...defaultProps} value="Some text" />);
        expect(screen.getByLabelText('Limpiar filtro')).toBeInTheDocument();
    });

    it('should call onClear when clear button is clicked', () => {
        render(<FilterInput {...defaultProps} value="Text" />);
        const clearButton = screen.getByLabelText('Limpiar filtro');
        fireEvent.click(clearButton);
        expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
});
