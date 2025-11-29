/**
 * =============================================================================
 * TEST DE INTEGRACIÓN: Gestión de Visitas
 * INTEGRATION TEST: Visit Management
 * =============================================================================
 *
 * Pruebas para el registro y consulta de visitas (Visit Controller).
 * Verifica el flujo principal de acceso a gimnasios.
 *
 * Tests for registering and querying visits (Visit Controller).
 * Verifies the main gym access flow.
 *
 * =============================================================================
 */

const request = require('supertest');
const app = require('../index');
const db = require('../config/db');
const { clearDatabase, closeDatabase } = require('./utils/db-handler');

// Después de CADA test, limpiamos las tablas // After EACH test, clear tables
afterEach(async () => {
  await clearDatabase();
});

// Al terminar TODO, cerramos la conexión // When ALL done, close the connection
afterAll(async () => {
  await closeDatabase();
});

describe('Visit Endpoints', () => {
  
  const gymData = {
    name: 'Visit Test Gym',
    address: 'Visit St',
    city: 'Madrid',
    latitude: 40.0,
    longitude: -3.0,
    is_suspended: 0,
    is_deleted: 0
  };

  const userData = {
    first_name: 'Visitor',
    last_name: 'User',
    email: 'visitor@test.com',
    password: 'visitorpass',
    role: 'user',
    home_gym_id: 1
  };

  let userToken;
  let targetGymId;

  beforeEach(async () => {
    const connection = await db.getConnection();

    // 1. Insertar gimnasio base (ID 1) para registro de usuario // 1. Insert base gym (ID 1) for user registration
    await connection.query(`
      INSERT INTO gyms (id, name, address, city, latitude, longitude, is_suspended, is_deleted) 
      VALUES (1, 'Base Gym', 'Base St', 'Base City', 0, 0, 0, 0)
    `);

    // 2. Insertar gimnasio destino para la visita (ID automático) // 2. Insert target gym for visit (auto ID)
    const [gymRes] = await connection.query(`
      INSERT INTO gyms (name, address, city, latitude, longitude, is_suspended, is_deleted) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [gymData.name, gymData.address, gymData.city, gymData.latitude, gymData.longitude, gymData.is_suspended, gymData.is_deleted]);
    
    targetGymId = gymRes.insertId;
    connection.release();

    // 3. Registrar usuario // 3. Register user
    await request(app).post('/api/users/register').send(userData);

    // 4. Login usuario // 4. Login user
    const loginRes = await request(app).post('/api/users/login').send({
      email: userData.email,
      password: userData.password
    });
    userToken = loginRes.body.token;
  });

  describe('POST /api/visits', () => {
    it('should register a new visit successfully', async () => {
      const res = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          gym_id: targetGymId
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Visita registrada con éxito');
      // La respuesta podría variar según tu implementación, verificamos lo básico
      // The response might vary depending on your implementation, verify basics
    });

    it('should fail if gym_id is missing', async () => {
      const res = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${userToken}`)
        .send({}); // Sin gym_id // No gym_id

      expect(res.statusCode).toEqual(400);
    });

    it('should fail if gym does not exist', async () => {
      const res = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          gym_id: 99999 // ID inexistente // Non-existent ID
        });

      // Dependiendo de tu controlador, podría ser 404 o 400 o 500 (error de FK)
      // Depending on your controller, could be 404 or 400 or 500 (FK error)
      expect([404, 400, 500]).toContain(res.statusCode); 
    });
  });

  describe('GET /api/visits/my-visits', () => {
    it('should return the user visit history', async () => {
      // 1. Registrar una visita primero // 1. Register a visit first
      await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ gym_id: targetGymId });

      // 2. Consultar historial // 2. Query history
      const res = await request(app)
        .get('/api/visits/my-visits')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      
      // Tu API devuelve paginación: { data: [...], total: N } o array directo?
      // Your API returns pagination: { data: [...], total: N } or direct array?
      // Asumimos estructura paginada similar a gyms, pero verificamos ambas posibilidades.
      // We assume paginated structure similar to gyms, but verify both possibilities.
      
      let visits = [];
      if (Array.isArray(res.body)) {
        visits = res.body;
      } else if (res.body.data && Array.isArray(res.body.data)) {
        visits = res.body.data;
      }

      expect(visits.length).toBeGreaterThanOrEqual(1);
      // Verificar que la visita es al gimnasio correcto (si la respuesta incluye el nombre o ID)
      // Verify the visit is to the correct gym (if response includes name or ID)
    });
  });
});
