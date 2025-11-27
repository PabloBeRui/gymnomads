/**
 * =============================================================================
 * CONFIGURACIÓN DE PRUEBAS
 * TEST SETUP
 * =============================================================================
 *
 * Configuración global para las pruebas unitarias y de integración con Vitest.
 *
 * Global setup for unit and integration tests with Vitest.
 *
 * =============================================================================
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Limpiar después de cada prueba // Clean up after each test
afterEach(() => {
  cleanup();
});
