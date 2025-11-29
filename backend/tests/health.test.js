/**
 * =============================================================================
 * TEST DE INTEGRACIÓN: Health Check
 * INTEGRATION TEST: Health Check
 * =============================================================================
 *
 * Verifica que el servidor arranca y responde en la ruta raíz.
 *
 * Verifies that the server starts and responds at the root route.
 *
 * =============================================================================
 */

const request = require('supertest');
const app = require('../index'); // Importamos la app de Express // Import Express app
// Nota: Necesitamos exportar 'app' desde index.js para que esto funcione. // Note: We need to export 'app' from index.js for this to work.

describe('Health Check Endpoint', () => {
  it('should return 200 OK and a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    // El mensaje actual en index.js es "Backend funcionando" // The current message in index.js is "Backend funcionando"
    expect(res.text).toContain('Backend funcionando');
  });
});
